const host = 'http://localhost:8081/data';

function fetchTable(table) {
    fetch(host + '/get/' + table).then((res) => {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
        console.log(jsonData);
    });
}

function refreshGameList() {
    fetch(host + '/game').then((res) => {
        return res.json();
    }).then((jsonData) => {
        const gameList = document.getElementById('game_list');
        gameList.innerHTML = '';
        for (const gameListElement of jsonData) {
            const game = document.createElement('li');
            const gameName = document.createElement('span');
            gameName.innerText = gameListElement.name;
            game.appendChild(gameName);

            const editGame = document.createElement("button");
            editGame.innerText = 'Edit';
            editGame.style.marginLeft = '5px';
            editGame.addEventListener('click', () => loadGameToEdit(gameListElement));

            const deleteGame = document.createElement("button");
            deleteGame.innerText = 'Delete';
            deleteGame.style.marginLeft = '5px';
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
                fetch(host + '/game', options);
            });

            game.appendChild(editGame);
            game.appendChild(deleteGame);
            gameList.appendChild(game);
        }
        console.log(jsonData);
    });
}

refreshGameList();
document.getElementById("add_games_button").addEventListener("click", addGame);

function loadGameToEdit(gameListElement) {
    const clone = document.getElementById("edit_games_button").cloneNode(true);
    document.getElementById("edit_games_button").replaceWith(clone);

    document.getElementById("edit_game_name").value = gameListElement.name;
    document.getElementById("edit_game_date").value = gameListElement.release_date.slice(0, 10);
    document.getElementById("edit_game_group").classList.remove('display-none');
    document.getElementById("edit_games_button").addEventListener('click', () => editGame(gameListElement));
}

function addGame() {
    const gameName = document.getElementById("add_game_name");
    const gameDate = document.getElementById("add_game_date");

    const game = {
        name: gameName.value,
        release_date: gameDate.value
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(game),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(host + '/game', options)
        .then(function (res) {
            if (res.statusCode === 200) {
                refreshGameList();
                gameName.value = '';
                gameDate.value = '';
            } else {
                alert(res.statusMessage);
            }
        });
}

function editGame(gameListElement) {
    const editGameName = document.getElementById("edit_game_name");
    const editGameDate = document.getElementById("edit_game_date");

    const game = {
        id: gameListElement.id,
        name: editGameName.value,
        release_date: editGameDate.value
    };

    const options = {
        method: 'PATCH',
        body: JSON.stringify(game),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(host + '/game', options)
        .then(function (res) {
            if (res.statusCode === 200) {
                refreshGameList();
                editGameName.value = '';
                editGameDate.value = '';
                document.getElementById("edit_game_group").classList.add('display-none');
            } else {
                alert(res.statusMessage);
            }
        });
}
