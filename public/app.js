const prefix = '/data';

function fetchTable(table) {
    fetch(prefix + '/get/' + table).then((res) => {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
    });
}

function refreshList(type) {
    fetch(prefix + '/' + type).then((res) => {
        return res.json();
    }).then((jsonData) => {
        const list = document.getElementById(type + '_list');
        list.innerHTML = '';
        for (const listElement of jsonData) {
            const child = document.createElement('li');
            const nameElement = document.createElement('span');
            nameElement.innerText = listElement.name;
            if (type === 'game') {
                nameElement.innerText += ' - Release date: ' + listElement.release_date.slice(0, 10);
            }
            child.appendChild(nameElement);

            const editButton = document.createElement("button");
            editButton.innerText = 'Edit';
            editButton.style.marginLeft = '5px';
            if (type === 'game') {
                editButton.addEventListener('click', () => loadToEdit(type, listElement));
            }

            const deleteButton = document.createElement("button");
            deleteButton.innerText = 'Delete';
            deleteButton.style.marginLeft = '5px';
            deleteButton.addEventListener('click', function () {
                const options = {
                    method: 'DELETE',
                    body: JSON.stringify({
                        id: listElement.id
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                fetch(prefix + '/' + type, options).then((res) => {
                    if (res.status === 200) {
                        refreshList('game');
                    } else {
                        alert(res.statusMessage);
                    }
                });
            });

            child.appendChild(editButton);
            child.appendChild(deleteButton);
            list.appendChild(child);
        }
    });
}

refreshList('game');
document.getElementById("add_game_button").addEventListener("click", addGame);

function loadToEdit(type, listElement) {
    const clone = document.getElementById("edit_" + type + "_button").cloneNode(true);
    document.getElementById("edit_" + type + "_button").replaceWith(clone);

    document.getElementById("edit_" + type + "_name").value = listElement.name;
    document.getElementById("edit_" + type + "_group").classList.remove('display-none');
    if (type === 'game') {
        document.getElementById("edit_" + type + "_date").value = listElement.release_date.slice(0, 10);
        document.getElementById("edit_" + type + "_button").addEventListener('click', () => editGame(listElement));
    }
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

    fetch(prefix + '/game', options)
        .then(function (res) {
            if (res.status === 200) {
                refreshList('game');
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
        release_date: new Date(editGameDate.value).toISOString().slice(0, 19).replace('T', ' ')
    };

    const options = {
        method: 'PATCH',
        body: JSON.stringify(game),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(prefix + '/game', options)
        .then(function (res) {
            if (res.status === 200) {
                refreshList('game');
                editGameName.value = '';
                editGameDate.value = '';
                document.getElementById("edit_game_group").classList.add('display-none');
            } else {
                alert(res.statusMessage);
            }
        });
}
