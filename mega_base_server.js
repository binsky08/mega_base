const express = require('express')
const app = express()
const databaseConnector = require('./databaseConnector')
const friends = require('./friends')

const Main_Identifier = 'id';

let config = databaseConnector.getConfiguration();

const connection = databaseConnector.getDatabaseConnection();

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

    databaseConnector.getQueryResult("SELECT " + selectColumns + " FROM " + table + ";", [], (data) => {
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
        databaseConnector.getQueryResult("UPDATE " + table + " " +
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
    databaseConnector.getQueryResult(sql, insetValues, (data) => {
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
    let table = databaseConnector.getTableName(resourceType);
    databaseConnector.getQueryResult("DELETE FROM " + table + " " +
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

app.get('/data/friends/:playerId', function (req, res) {
    if (req.params === undefined || req.params.playerId === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    const playerId = req.params.playerId;

    writeHead(res, 200, "application/json");
    friends.fetchFriendsIds(playerId, (friendIds) => {
        modificationResponse(friendIds, res);
    }, connection);
});

app.post('/data/friends/:playerId', function (req, res) {
    if (req.params === undefined || req.params.playerId === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    const playerId = req.params.playerId;
    const targetFriendId = req.body.destinationPlayerId;

    writeHead(res, 200, "application/json");
    friends.addFriend(playerId, targetFriendId, (data) => {
        if (data === undefined || data.affectedRows === 0) {
            failResponse(410, "No Dataset modified, maybe already deleted", res);
        } else {
            modificationResponse(data, res);
        }
    }, connection);
});

app.delete('/data/friends/:playerId', function (req, res) {
    if (req.params === undefined || req.params.playerId === undefined) {
        failResponse(404, 'not found', res);
        return;
    }

    const playerId = req.params.playerId;
    const targetFriendId = req.body.destinationPlayerId;

    writeHead(res, 200, "application/json");
    friends.removeFriend(playerId, targetFriendId, (data) => {
        if (data === undefined || data.affectedRows === 0) {
            failResponse(410, "No Dataset modified, maybe already deleted", res);
        } else {
            modificationResponse(data, res);
        }
    }, connection);
});

app.use(express.static(__dirname + '/public'));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'))
app.listen(config.applicationPort);

function writeHead(res, statusCode, contentType) {
    res.setHeader('Content-Type', contentType !== undefined ? contentType : 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
}
