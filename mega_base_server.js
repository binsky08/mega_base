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
    password: 'asdf12',
    database: 'mega_base'
});

const server = http.createServer();
const _default = "mega_base.html";

function writeHead(res, statusCode, contentType) {
    res.writeHead(statusCode, {
        'Content-Type': contentType !== undefined ? contentType : 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
}

function sendFile(res, file) {
    console.log("called sendFile " + file);
    if (fs.existsSync(file)) {
        writeHead(res, 200, mime.getType(file));
        res.write(fs.readFileSync(file));
    } else {
        writeHead(res, 404, mime.getType(file));
    }
}

function exists(val) {
    return val !== undefined;
}

function getQueryResult(sql, params, callback, connection) {
    connection.query(sql, params, (err, res) => {
        if (err) console.error(err);
        callback(res);
    });
};

server.on('request', (req, res) => {
    const uri = url.parse(req.url, true);
    const query = uri.query;
    const path = uri.pathname;
    console.log(path);

    if (/(\.\.)/.test(path)) {
        writeHead(res, 401);
        console.log('Illegal path: ' + path);
        console.log('Query: ' + JSON.stringify(query));
        res.end();
    } else if (path.startsWith('/get/')) {
        writeHead(res, 200, "application/json");
        const parsedColumn = path.substring('/get/'.length);
        let column = 'game';
        let selectColumns = '*';

        switch (parsedColumn) {
            case 'player':
                column = 'player';
                break;
            case 'game':
                column = 'game';
                break;
        }

        getQueryResult("SELECT " + selectColumns + " FROM " + column + ";", [], (data) => {
            console.log(data);
            res.write(JSON.stringify(data));
            res.end();
        }, connection);
    } else if (!/(\.\.)/.test(path)) {
        let myPath = path;
        if (path.startsWith("/")) {
            myPath = myPath.substring(1);
        }
        if (myPath === "/" || myPath === "") {
            myPath = _default;
        }
        sendFile(res, myPath);
        res.end();
    } else {
        res.write('Path: ' + path);
        res.write('\nQuery: ' + JSON.stringify(query));
        res.end();
    }
});
server.listen(8080);
