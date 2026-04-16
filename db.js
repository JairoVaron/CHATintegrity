const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "javo",
    password: "1234",
    database: "javochat",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool.promise();