const mysql = require("mysql2");
const { database } = require("./keys");

let conn = mysql.createConnection({
  host: database.host,
  port: database.port,
  user: database.user,
  database: database.database,
  password: database.password,
  dateStrings: true,
});


try {
  conn.query("SELECT 1");
  console.log("Connected DB ");
  const sql = "SELECT 1";
  setInterval(() => {
    conn
      .promise()
      .query(sql)
      .then(([result, fields]) => {
        console.log("Todo Correcto");
      })
      .catch((err) => console.log("ERROR::", err));
  }, 3600000);
} catch (error) {
  if (error) {
    let posicion = error.message.indexOf("Can't add new command when connection is in closed state");
    if (posicion !== -1) {
      console.log("Disconnected DB :(");
      conn = mysql.createConnection({
        host: database.host,
        user: database.user,
        database: database.database,
        password: database.password,
        dateStrings: true,
      });
      console.log("Reconected DB ");
    }
  }
}

module.exports = conn;
