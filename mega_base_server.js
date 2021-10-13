const mariadb_callback = require('mariadb/callback');

const express = require('express')
const app = express()
const databaseConnector = require('./databaseConnector')

const Main_Identifier = 'id';

let config = databaseConnector.getConfiguration();
let databaseConfig = databaseConnector.getDatabaseConfig();

const connection = mariadb_callback.createConnection({
    host: databaseConfig.host,
    ssl: databaseConfig.ssl,
    port: databaseConfig.port,
    user: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database
});
connection.connect(function (err) {
    if (err) throw err;
});

const failResponse = function (statusCode, message, response) {
    response.status(statusCode);
    response.type('application/json');
    response.statusMessage = message;
    response.send({
        error: message
    });
    response.send();
};

const fetchResource = function (resource, res) {
    writeHead(res, 200, "application/json");
    let table = databaseConnector.getTableName(resource);
    let selectColumns = '*';

    getQueryResult("SELECT " + selectColumns + " FROM " + table + ";", [], (data) => {
        res.send(JSON.stringify(data));
        res.end();
    }, connection);
}

/**
 * updates the corresponding Table
 * @param resource Tablename
 * @param res
 * @param data
 */
const updateContent = function (resource, res, data) {
    if (data === undefined || data[Main_Identifier] === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    writeHead(res, 200, "application/json");
    let table = databaseConnector.getTableName(resource);
    let columns = databaseConnector.getColumns(table, Main_Identifier);
    let updateColumns = [];
    let idValue = data[Main_Identifier];
    let updateValues = [];

    for (let column of columns) {
        // skip id, cause it's used for identification
        if (column === Main_Identifier) {
            continue;
        }

        if (data[column] !== undefined) {
            updateColumns.push(column + ' = ?');
            updateValues.push(data[column]);
        }
    }
    delete data[Main_Identifier];

    updateValues.push(idValue);

    if (updateColumns.length > 0) {
        getQueryResult("UPDATE " + table + " " +
            "SET " + updateColumns.join(', ') + " " +
            "WHERE id = ?;", updateValues, (data) => {
            if (data === undefined || data.affectedRows === 0) {
                failResponse(410, "No Dataset modified, maybe already deleted", res);
            } else {
                modificationResponse(data, res);
            }
        }, connection);
    }
}

function createContent(resourceType, res, fields) {
    let table = databaseConnector.getTableName(resourceType);
    let columns = databaseConnector.getColumns(table, Main_Identifier);
    columns.shift(); // remove auto-Generated id

    let insetValues = [];

    for (let column of columns) {
        // skip id, cause it's used for identification
        if (column === Main_Identifier) {
            continue;
        }

        if (fields[column] === undefined) {
            failResponse(406, 'Field "' + column + '" isn\'t set', res)
            return
        }
        insetValues.push(fields[column]);
    }
    delete fields[Main_Identifier];

    let insertPlaceHolders = Array(insetValues.length).fill('?');
    let sql = "INSERT INTO " + table + " (" + columns.join(',') + ")" +
        "VALUES (" + insertPlaceHolders.join(',') + ") "
    getQueryResult(sql, insetValues, (data) => {
        if (data === undefined || data.affectedRows === 0) {
            failResponse(410, "No Dataset modified, maybe already deleted", res);
        } else {
            modificationResponse(data, res);
        }
    }, connection);
}

function modificationResponse(data, response) {
    if (data === undefined || data.affectedRows === 0) {
        failResponse(410, "No Dataset modified, maybe already deleted", response)
    } else {
        response.send(JSON.stringify(data));
        response.end();
    }
}

function deleteContent(resourceType, response, data) {
    if (data === undefined || data[Main_Identifier] === undefined) {
        failResponse(404, 'not found', response);
        return;
    }

    writeHead(response, 200, "application/json");
    let table = databaseConnector.getTableName(response);
    getQueryResult("DELETE FROM " + table + " " +
        " WHERE id = ?;", [data[Main_Identifier]], (data) => {
        modificationResponse(data, response);
    }, connection);
}

app.get('/data/:resourceType/', function (req, res) {
    fetchResource(req.params.resourceType, res);
})
app.use(express.json());

app.post('/data/:resourceType/', function (req, res) {
    createContent(req.params.resourceType, res, req.body);
})

app.patch('/data/:resourceType/', function (req, res) {
    updateContent(req.params.resourceType, res, req.body);
})

app.delete('/data/:resourceType/', function (req, res) {
    deleteContent(req.params.resourceType, res, req.body);
})

function fetchFriendsIds(playerId, callback) {

    const friendIds = [];

    getQueryResult("SELECT source_player_id, destination_player_id FROM friends" +
        " WHERE ? in (source_player_id, destination_player_id )" +
        " ;", [playerId], (data) => {
        for (let friend of data) {
            if (parseInt(friend.source_player_id) !== parseInt(playerId)) {
                friendIds.push(friend.source_player_id);
            } else if (parseInt(friend.destination_player_id) !== parseInt(playerId)) {
                friendIds.push(friend.destination_player_id);
            }
        }
        callback(friendIds);
    }, connection);
}

function addFriend(sourcePlayer, targetPlayer, callback) {

    let sql = "INSERT INTO friends (source_player_id, destination_player_id) " +
        "VALUES (?, ?) "
    getQueryResult(sql, [sourcePlayer, targetPlayer], (data) => {
        callback(data)
    }, connection);
}

function removeFriend(sourcePlayer, targetPlayer, callback) {

    let sql = "DELETE FROM friends WHERE (source_player_id = ? AND destination_player_id = ?) OR  (destination_player_id = ? AND source_player_id = ?) ";
    getQueryResult(sql, [sourcePlayer, targetPlayer, sourcePlayer, targetPlayer], (data) => {
        callback(data)
    }, connection);
}


app.get('/data/friends/:playerId', function (req, res) {
    if (req.params === undefined || req.params.playerId === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    const playerId = req.params.playerId;

    writeHead(res, 200, "application/json");
    fetchFriendsIds(playerId, (friendIds) => {
        modificationResponse(friendIds, res);
    });
});

app.post('/data/friends/:playerId', function (req, res) {
    if (req.params === undefined || req.params.playerId === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    const playerId = req.params.playerId;
    const targetFriendId = req.body.destinationPlayerId;

    writeHead(res, 200, "application/json");
    addFriend(playerId, targetFriendId, (data) => {
        if (data === undefined || data.affectedRows === 0) {
            failResponse(410, "No Dataset modified, maybe already deleted", res);
        } else {
            modificationResponse(data, res);
        }
    });
});

app.delete('/data/friends/:playerId', function (req, res) {
    if (req.params === undefined || req.params.playerId === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    const playerId = req.params.playerId;
    const targetFriendId = req.body.destinationPlayerId;

    writeHead(res, 200, "application/json");
    removeFriend(playerId, targetFriendId, (data) => {
        if (data === undefined || data.affectedRows === 0) {
            failResponse(410, "No Dataset modified, maybe already deleted", res);
        } else {
            modificationResponse(data, res);
        }
    });
});

app.use(express.static(__dirname + '/public'));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'))
app.listen(config.applicationPort);

function writeHead(res, statusCode, contentType) {
    res.setHeader('Content-Type', contentType !== undefined ? contentType : 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
}

function getQueryResult(sql, params, callback, connection) {
    connection.query(sql, params, (err, res) => {
        if (err)
            console.error(err);
        callback(res);
    });
}
