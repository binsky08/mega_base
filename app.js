function fetchTable(table) {
    fetch('http://localhost:8080/get/' + table).then((res) =>  {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
        console.log(jsonData);
    });
}


var ul = document.getElementById("game_list").innerHTML = "hallo";
var newObjekt = document.createElement("li");
ul.appendChild(newObjekt);
