const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db');



db.serialize(function () {
    db.run("CREATE TABLE users (id TEXT, password TEXT)");
    db.run(`CREATE TABLE pokemons (
        time   INTEGER,
        number INTEGER,
        height INTEGER,
        weight INTEGER,
        cp     INTEGER
    )`);

    // console.log('in')
    // var stmt = db.prepare("INSERT INTO users(id, password) VALUES (?, ?)");
    // stmt.run(user.id, user.password)
    // stmt.finalize();


    // db.each("SELECT rowid AS id, number, height, weight, cp FROM pokemons", function (err, row) {
    //     console.log(row);
    // });

    // let time = 4
    // db.run(`DELETE FROM pokemons WHERE time=?`, time, function (err) {
    //     if (err) {
    //         return console.error(err.message);
    //     }
    //     console.log(`Row(s) deleted ${this.changes}`);
    // });
});

db.close();