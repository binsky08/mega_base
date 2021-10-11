const http = require('http');
const url = require('url');
const fs = require('fs');
const mime = require('mime');
const mariadb = require('mariadb');
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
const bodyParser = require("body-parser");
;

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
 * updates the correspondig Table
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
    let selectColumns = '*';
    let table = getTableName(resource);
    let columns = getColumns(table);
    let updates = [];

    for (let column in columns) {
        // skip id, cause it's used for identification
        if (column === Main_Identifier)
            continue;

        if (data[column] !== undefined) {
            updates.push(column + ' = ?');
        }
    }

    updates.push(data[Main_Identifier])

    if (updates.length > 0) {
        getQueryResult("Update " + table + " " +
            "SET " + updates.join(', ') + "" +
            "WHERE id = ?;", data, (data) => {
            res.send(JSON.stringify(data));
            res.end();
        }, connection);
    }


}

app.get('/:resourceType/', function (req, res) {
    fetchResource(req.params.resourceType, res);
})
app.use(bodyParser.urlencoded({extended: true}));
app.post('/:resourceType/', function (req, res) {
    updateContent(req.params.resourceType, res, req.body);
})

app.listen(8080);
app.use(express.static('public'));

function writeHead(res, statusCode, contentType) {
    res.setHeader('Content-Type', contentType !== undefined ? contentType : 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
}

function exists(val) {
    return val !== undefined;
}

function getQueryResult(sql, params, callback, connection) {
    connection.query(sql, params, (err, res) => {
        if (err)
            console.error(err);
        callback(res);
    });
}
