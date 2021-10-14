const databaseConnector = require('./databaseConnector')
function fetchFriendsIds(playerId, callback, connection) {

    const friendIds = [];

    databaseConnector.getQueryResult("SELECT source_player_id, destination_player_id FROM friends" +
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

function addFriend(sourcePlayer, targetPlayer, callback, connection) {

    let sql = "INSERT INTO friends (source_player_id, destination_player_id) " +
        "VALUES (?, ?) "
    databaseConnector.getQueryResult(sql, [sourcePlayer, targetPlayer], (data) => {
        callback(data)
    }, connection);
}

function removeFriend(sourcePlayer, targetPlayer, callback, connection) {

    let sql = "DELETE FROM friends WHERE (source_player_id = ? AND destination_player_id = ?) OR  (destination_player_id = ? AND source_player_id = ?) ";
    databaseConnector.getQueryResult(sql, [sourcePlayer, targetPlayer, sourcePlayer, targetPlayer], (data) => {
        callback(data)
    }, connection);
}

module.exports = { fetchFriendsIds, addFriend, removeFriend};
