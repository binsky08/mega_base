const fs = require("fs");
const mariadb_callback = require('mariadb/callback');

function getConfiguration() {
    let configContent = fs.readFileSync('config/environment.config.json');
    return JSON.parse(configContent);
}

function getDatabaseConfig() {
    let config = getConfiguration();

    return config.database
}

function getDatabaseConnection(){
    let databaseConfig = getDatabaseConfig();
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
    return connection;
}

function getColumns(table, mainID) {
    switch (table) {
        case 'player':
            return [mainID, 'email', 'first_name', 'last_name', 'nickname', 'password_plain', 'date_of_birth'];
        case 'game':
            return [mainID, 'name', 'release_date'];
        case 'category':
            return [mainID, 'name'];
    }
}

function getTableName(resource) {
    let table;
    switch (resource) {
        case 'category':
            table = 'category';
            break;
        case 'friends':
            table = 'friends';
            break;
        case 'link_game_category':
            table = 'link_game_category'
            break;
        case 'link_game_rating_agency':
            table = 'link_game_rating_agency'
            break;
        case 'link_player_game':
            table = 'link_player_game'
            break;
        case 'rating_agency':
            table = 'rating_agency'
            break;
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

function getQueryResult(sql, params, callback, connection) {
    connection.query(sql, params, (err, res) => {
        if (err)
            console.error(err);
        callback(res);
    });
}

module.exports = {getColumns, getTableName, getConfiguration, getQueryResult, getDatabaseConnection};
