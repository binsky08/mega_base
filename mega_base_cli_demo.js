const mariadb = require('mariadb/callback');
const connection = mariadb.createConnection({
    host: 'localhost',
    ssl: {
        rejectUnauthorized: false
    },
    port: 3306,
    user: 'root',
    password: 'asdf12',
    database: 'mega_base'
});

function printQueryResult(sql, connection) {
    connection.query(sql, (err, res) => {
        if (err) console.error(err);
        else console.log(res);
    });
};

connection.connect(err => {
    if (err) {
        console.log("Not connected due to error: " + err);
    } else {
        console.log("Successfully connected! Connection id is " + connection.threadId);

        printQueryResult("SELECT * FROM game;", connection);
        printQueryResult("SELECT p.first_name, g.name " +
            "FROM player p " +
            "INNER JOIN link_player_game lpg ON lpg.player_id=p.id " +
            "INNER JOIN game g ON g.id=lpg.game_id " +
            "WHERE g.name='Portal 3';", connection);
    }
});
