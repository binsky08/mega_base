function fetchTable(table) {
    fetch('http://localhost:8080/get/' + table).then((res) =>  {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
        console.log(jsonData);
    });
}


document.getElementById("add_games_button").addEventListener("click", addGame);
function addGame(){
    const gameName = document.getElementById("game_name").value;
    const gameDate = document.getElementById("game_date").value;
    const gameElement = document.createElement("p");

    gameElement.appendChild(gameName);
    gameElement.appendChild(deleteGame);
    document.getElementById("content_games").appendChild(gameElement);

    const game = {
        name: gameName,
        release_date: gameDate
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(game),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    fetch("http://localhost:8080/game/", options)
        .then(function (res){
            return res.json();
        })
        .then(function (result) {
        const deleteGame = document.createElement("button");
        deleteGame.addEventListener('click', function (){

            const options = {
                method: 'DELETE',
                body: JSON.stringify({
                    id: result.id
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            fetch("http://localhost:8080/game/", options);
        })
    });

}
