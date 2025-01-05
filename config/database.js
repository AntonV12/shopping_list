import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "12345",
  database: "shopping_list",
});
