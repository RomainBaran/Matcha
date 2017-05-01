const mysql = require('mysql');

const connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'matcha',
  multipleStatements: true
});

module.exports = connection;
