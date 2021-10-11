function fetchTable(table) {
    fetch('http://localhost:8080/get/' + table).then((res) => {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
        console.log(jsonData);
    });
}

function refreshGameList() {
    fetch('http://localhost:8080/game').then((res) => {
        return res.json();
    }).then((jsonData) => {
        const gameList = document.getElementById('game_list');
        gameList.innerHTML = '';
        for (const gameListElement of jsonData) {
            const game = document.createElement('li');
            game.appendChild(gameListElement.name);

            const deleteGame = document.createElement("button");
            deleteGame.value = 'Delete';
            deleteGame.addEventListener('click', function () {
                const options = {
                    method: 'DELETE',
                    body: JSON.stringify({
                        id: gameListElement.id
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                fetch("http://localhost:8080/game/", options);
            });

            game.appendChild(deleteGame);
            gameList.appendChild(game);
        }
        console.log(jsonData);
    });
}


document.getElementById("add_games_button").addEventListener("click", addGame);

function addGame() {
    const gameName = document.getElementById("game_name").value;
    const gameDate = document.getElementById("game_date").value;

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
        .then(function (res) {
            if (res.statusCode === 200) {
                refreshGameList();
            } else {
                alert(res.statusMessage);
            }
        });
}
