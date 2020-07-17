const sqlite3 = require('sqlite3').verbose();
const DB_PATH = 'data/db'
const UID = 'u_'
const db = new sqlite3.Database(DB_PATH);

db.serialize(function () {
    db.run("CREATE TABLE USERS (UID TEXT, NAME TEXT)");
    db.run(`INSERT INTO USERS(UID, NAME) VALUES(?, ?)`, ['u_0', 'test']);
});

db.close();