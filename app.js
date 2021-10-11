function fetchColumn(column) {
    fetch('http://localhost:8080/get/' + column).then((res) =>  {
        return res.json();
    }).then((jsonData) => {
        document.getElementById('result').innerText = JSON.stringify(jsonData);
        console.log(jsonData);
    });
}
