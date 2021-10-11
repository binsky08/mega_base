const tabNames = ['games', 'player'];
let activeTab = 'games';

function initialize() {
    let tabList = document.getElementById('tab_list');
    for (const tabNameElement of tabNames) {
        let li = document.createElement('li');
        li.classList.add('app-tabs__tab');
        if (tabNameElement === 'games') {
            li.classList.add('active');
        }
        li.addEventListener('click', function() { changeTab(tabNameElement); });
        li.innerText = tabNameElement.charAt(0).toUpperCase() + tabNameElement.slice(1);
        li.id = 'tab_' + tabNameElement;
        tabList.appendChild(li);
    }
}

initialize();

function fetchColumn(column) {
    fetch('http://localhost:8080/get/' + column).then((res) => {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
        console.log(jsonData);
    });
}

function changeTab(tabName) {
    for (const tabNameElement of tabNames) {
        console.log(tabNameElement);
        document.getElementById('tab_' + tabNameElement).classList.remove('active');
        document.getElementById('content_' + tabNameElement).classList.add('display-none');
    }

    document.getElementById('tab_' + tabName).classList.add('active');
    document.getElementById('content_' + tabName).classList.remove('display-none');
}
