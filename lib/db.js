const mysql = require('mysql');

const connection = mysql.createPool({
  host     : 'localhost',
  user     : 'rbaran',
  password : '',
  database : 'matcha',
  port     : 3307,
  multipleStatements: true
});

module.exports = connection;
