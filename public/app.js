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

            switch (type) {
                case 'game':
                    let releasedate = listElement.release_date.slice(0, 10);
                    let releasdateObject = new Date(releasedate);
                    nameElement.innerText = listElement.name;
                    nameElement.innerText += ' - Release date: '+ releasdateObject.toLocaleDateString();
                    break;
                case 'player':
                    nameElement.innerText = listElement.first_name + ' ' + listElement.last_name;
                    break;
                case 'category':
                    nameElement.innerText = listElement.name;
                    break;
            }

            child.appendChild(nameElement);

            const editButton = document.createElement("i");
            editButton.classList.add('fas');
            editButton.classList.add('fa-edit')

            const editDiv = document.createElement('div');
            editDiv.appendChild(editButton);
            editDiv.classList.add('icon');

            if (type === 'game') {
                editDiv.addEventListener('click', () => loadToEdit(type, listElement));
            } else if (type === 'player') {
                editDiv.addEventListener('click', () => loadToEdit(type, listElement));
            }

            const deleteButton = document.createElement("i");
            deleteButton.classList.add('fas');
            deleteButton.classList.add('fa-trash')

            const deleteDiv = document.createElement('div');
            deleteDiv.appendChild(deleteButton);
            deleteDiv.classList.add('icon');

            deleteDiv.addEventListener('click', function () {
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

            child.appendChild(editDiv);
            child.appendChild(deleteDiv);
            list.appendChild(child);
        }
    });
}

refreshList('game');
refreshList('player');
refreshList('category');

document.getElementById("add_game_button").addEventListener("click", () => add('game'));
document.getElementById("add_player_button").addEventListener("click", () => add('player'));
document.getElementById("add_category_button").addEventListener("click", () => add('category'));

function loadToEdit(type, listElement) {
    const clone = document.getElementById("edit_" + type + "_button").cloneNode(true);
    document.getElementById("edit_" + type + "_button").replaceWith(clone);

    document.getElementById("edit_" + type + "_group").classList.remove('display-none');
    if (type === 'game') {
        document.getElementById("edit_" + type + "_name").value = listElement.name;
        document.getElementById("edit_" + type + "_date").value = listElement.release_date.slice(0, 10);
        document.getElementById("edit_" + type + "_button").addEventListener('click', () => editGame(listElement));
    } else if (type === 'player') {
        document.getElementById("edit_" + type + "_first_name").value = listElement.first_name;
        document.getElementById("edit_" + type + "_last_name").value = listElement.last_name;
        document.getElementById("edit_" + type + "_button").addEventListener('click', () => editUser(listElement));
    }
}

function add(type) {
    const obj = {};

    switch (type) {
        case 'game':
            obj.name = document.getElementById("add_" + type + "_name").value;
            obj.release_date = document.getElementById("add_" + type + "_date").value;
            break;
    }

    const options = {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(prefix + '/' + type, options)
        .then(function (res) {
            if (res.status === 200) {
                refreshList(type);

                switch (type) {
                    case 'game':
                        document.getElementById("add_" + type + "_name").value = '';
                        document.getElementById("add_" + type + "_date").value = '';
                        break;
                }
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

function editUser(playerListElement) {
    const editPlayerFirstName = document.getElementById("edit_player_first_name");
    const editPlayerLastName = document.getElementById("edit_player_last_name");

    const game = {
        id: playerListElement.id,
        first_name: editPlayerFirstName.value,
        last_name: editPlayerLastName.value
    };

    const options = {
        method: 'PATCH',
        body: JSON.stringify(game),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(prefix + '/player', options)
        .then(function (res) {
            if (res.status === 200) {
                refreshList('player');
                editPlayerFirstName.value = '';
                editPlayerLastName.value = '';
                document.getElementById("edit_player_group").classList.add('display-none');
            } else {
                alert(res.statusMessage);
            }
        })
}
