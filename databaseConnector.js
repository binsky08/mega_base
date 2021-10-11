const fs = require("fs");

function getDatabaseConfig() {
    let configContent = fs.readFileSync('config/environment.config.json');
    let config = JSON.parse(configContent);

    return config.database
}

module.exports = { getDatabaseConfig };
