const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const dbConnect = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

dbConnect.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the database!");
  }
});

module.exports = dbConnect;
