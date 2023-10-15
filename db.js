const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'NewUsr',
  password: '$tvT2hXE0yPa',
  database: 'CompDB'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

module.exports = connection;
