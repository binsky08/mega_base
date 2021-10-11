const mariadb_callback = require('mariadb/callback');
const connection = mariadb_callback.createConnection({
    host: 'localhost',
    ssl: {
        rejectUnauthorized: false
    },
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'mega_base'
});

const express = require('express')
const app = express()
const formidable = require('express-formidable');

function getTableName(resource) {
    let table;
    switch (resource) {
        case 'player':
            table = 'player';
            break;
        case 'game':
        default:
            table = 'game';
            break;
    }
    return table;
}

const fetchResource = function (resource, res) {
    writeHead(res, 200, "application/json");
    let table = getTableName(resource);
    let selectColumns = '*';

    getQueryResult("SELECT " + selectColumns + " FROM " + table + ";", [], (data) => {
        res.send(JSON.stringify(data));
        res.end();
    }, connection);
}

const Main_Identifier = 'id';

function getColumns(table) {
    switch (table) {
        case 'player':
            return [Main_Identifier, 'email', 'first_name', 'last_name', 'nickname', 'password_plain', 'date_of_birth'];
        case 'game':
            return [Main_Identifier, 'name', 'release_date']
    }
}

/**
 * updates the corresponding Table
 * @param resource Tablename
 * @param res
 * @param data
 */
const updateContent = function (resource, res, data) {
    if (data === undefined || data[Main_Identifier] === undefined) {
        // TODO create 404 page
        console.log('not found')
        res.writeHead(404, "NotFound");
        res.send()
        return;
    }

    writeHead(res, 200, "application/json");
    let table = getTableName(resource);
    let columns = getColumns(table);
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
            res.send(JSON.stringify(data));
            res.end();
        }, connection);
    }
}

app.get('/:resourceType/', function (req, res) {
    fetchResource(req.params.resourceType, res);
})
app.use(formidable());

app.post('/:resourceType/', function (req, res) {
    updateContent(req.params.resourceType, res, req.fields);
})

app.use(express.static('public'));
app.listen(8080);

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
