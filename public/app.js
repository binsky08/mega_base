const prefix = '/data';

function refreshList(type) {
    fetch(prefix + '/' + type).then((res) => {
        return res.json();
    }).then((jsonData) => {
        const list = document.getElementById(type + '_list');
        list.innerHTML = '';
        for (const listElement of jsonData) {
            const child = document.createElement('div');
            child.classList.add('list-entry');
            const nameElement = document.createElement('span');

            switch (type) {
                case 'game':
                    let releasedate = listElement.release_date.slice(0, 10);
                    let releasdateObject = new Date(releasedate);
                    nameElement.innerText = listElement.name;
                    nameElement.innerText += ' - Release date: ' + releasdateObject.toLocaleDateString();
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
                        alert(res.statusText);
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
        document.getElementById("edit_" + type + "_email").value = listElement.email;
        document.getElementById("edit_" + type + "_first_name").value = listElement.first_name;
        document.getElementById("edit_" + type + "_last_name").value = listElement.last_name;
        document.getElementById("edit_" + type + "_nickname").value = listElement.nickname;
        document.getElementById("edit_" + type + "_password").value = listElement.password_plain;
        document.getElementById("edit_" + type + "_date_of_birth").value = listElement.date_of_birth.slice(0, 10);
        document.getElementById("edit_" + type + "_button").addEventListener('click', () => editUser(listElement));
    }
}

function resetFields(modificationType, resourceType) {
    switch (resourceType) {
        case 'player':
            document.getElementById(modificationType + "_" + resourceType + "_email").value = '';
            document.getElementById(modificationType + "_" + resourceType + "_first_name").value = '';
            document.getElementById(modificationType + "_" + resourceType + "_last_name").value = '';
            document.getElementById(modificationType + "_" + resourceType + "_nickname").value = '';
            document.getElementById(modificationType + "_" + resourceType + "_password").value = '';
            document.getElementById(modificationType + "_" + resourceType + "_date_of_birth").value = '';
            break;
        case 'game':
            document.getElementById(modificationType + "_" + resourceType + "_name").value = '';
            document.getElementById(modificationType + "_" + resourceType + "_date").value = '';
            break;
        default:
            alert('type ' + resourceType + ' not supported');
            break;
    }
}

function add(type) {
    const obj = {};

    switch (type) {
        case 'game':
            obj.name = document.getElementById("add_" + type + "_name").value;
            obj.release_date = document.getElementById("add_" + type + "_date").value;
            break;
        case 'player':
            obj.email = document.getElementById("add_" + type + "_email").value;
            obj.first_name = document.getElementById("add_" + type + "_first_name").value;
            obj.last_name = document.getElementById("add_" + type + "_last_name").value;
            obj.nickname = document.getElementById("add_" + type + "_nickname").value;
            obj.password_plain = document.getElementById("add_" + type + "_password").value;
            obj.date_of_birth = document.getElementById("add_" + type + "_date_of_birth").value;
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
                    case 'player':
                        resetFields('add', type);
                        break;
                }
            } else {
                alert(res.statusText);
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
                resetFields('edit', 'game');
                document.getElementById("edit_game_group").classList.add('display-none');
            } else {
                alert(res.statusText);
            }
        });
}

function editUser(playerListElement) {
    let player = {id: playerListElement.id};
    const type = 'player';
    player.email = document.getElementById("edit_" + type + "_email").value;
    player.first_name = document.getElementById("edit_" + type + "_first_name").value;
    player.last_name = document.getElementById("edit_" + type + "_last_name").value;
    player.nickname = document.getElementById("edit_" + type + "_nickname").value;
    player.password_plain = document.getElementById("edit_" + type + "_password").value;
    player.date_of_birth = document.getElementById("edit_" + type + "_date_of_birth").value;

    const options = {
        method: 'PATCH',
        body: JSON.stringify(player),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(prefix + '/player', options)
        .then(function (res) {
            if (res.status === 200) {
                refreshList('player');
                resetFields('edit', 'player');
                document.getElementById("edit_player_group").classList.add('display-none');
            } else {
                alert(res.statusText);
            }
        })
}
