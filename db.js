const sqlite3 = require('sqlite3').verbose();
const DB_PATH = 'data/db'
const UID = 'u_'


function all() {
    db.serialize(function () {
        //  db.run("CREATE TABLE USERS (UID TEXT, NAME TEXT)");


        // db.run(`CREATE TABLE pokemons (
        //     time   INTEGER,
        //     number INTEGER,
        //     height INTEGER,
        //     weight INTEGER,
        //     cp     INTEGER
        // )`);

        // console.log('in')
        // var stmt = db.prepare("INSERT INTO users(id, name) VALUES (?, ?)");
        // stmt.run('u_2', 'Jimmy')
        // stmt.finalize();


        // open the database

        let sql = `SELECT * FROM USERS`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                console.log(row.name);
            });
        });


        // let sql = `INSERT INTO USERS(id, name) VALUES(?, ?)`
        // let value = ['p_2', 'Parker']

        // db.run(sql, value, function (err) {
        //     if (err) {
        //         return console.log(err.message);
        //     }
        //     // get the last insert id
        //     console.log(`A row has been inserted with rowid ${this.lastID}`);
        // });

        // sql = "SELECT * FROM USERS WHERE name = ?"
        // let name = 'Mike'

        // // first row only
        // db.get(sql, [name], (err, row) => {
        //     if (err) {
        //         return console.error(err.message);
        //     }
        //     return row
        //         ? console.log(row.id, row.name)
        //         : console.log(`No playlist found with the name ${name}`);
        // });

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
}
// login('name1786')
function login(name) {
    // return new Promise(function (resolve, reject) {
    //     setTimeout(function () {
    //         resolve(name);
    //     }, 10000);
    // });
    const db = new sqlite3.Database(DB_PATH);
    var uid;
    return new Promise(r => {
        db.serialize(() => {
            return new Promise(resolve => { resolve(); })
                .then(() => checkNameExist())
                .then(() => getUid())
                .then(() => newUser())
                .then(() => {
                    return new Promise(resolve => {
                        db.close()
                        console.log('db over')
                        console.log(uid);
                        resolve()
                        r(uid)
                    })
                })
                .catch((err) => {
                    console.log('err: ' + err)
                    r(uid)
                });
        });
    })


    function checkNameExist() {
        console.log('check start')
        const sql = "SELECT * FROM USERS WHERE name = ?"
        return new Promise((resolve, reject) => {
            db.get(sql, [name], (err, row) => {
                if (err) {
                    // return console.error(err.message);
                    reject()
                }
                if (row) {
                    console.log('name is exist')
                    uid = row.UID
                    reject()
                }
                else {
                    resolve()
                }
            })
        })
    }
    function getUid() {
        const sql = `SELECT * 
            FROM    USERS
            ORDER BY rowid DESC LIMIT 1`;

        return new Promise((resolve, reject) => {
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject()
                }
                uid = UID + (parseInt(row.UID.slice(UID.length)) + 1)
                resolve()
            });
        })
    }
    function newUser() {
        sql = `INSERT INTO USERS(UID, NAME) VALUES(?, ?)`

        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE ` + uid + ` (
                time   INTEGER,
                number INTEGER,
                height INTEGER,
                weight INTEGER,
                cp     INTEGER
            )`);

            db.run(sql, [uid, name], function (err) {
                if (err) {
                    // return console.log(err.message);
                    reject()
                }
                // get the last insert id
                console.log(`A row has been inserted with rowid ${this.lastID}`);
                resolve()
            });
        })
    }
    function over() {
        db.close()
        return uid
    }
}

function loadPokemon(uid) {
    console.log(uid)
    const db = new sqlite3.Database(DB_PATH);
    const sql = (`SELECT rowid AS rowid, time, number, height, weight, cp FROM ` + uid);

    return new Promise(resolve => {
        db.serialize(function () {
            db.all(sql, [], function (err, rows) {
                db.close();
                resolve(rows)
            });
        });
    })
}

function addPokemon(uid, pokemon) {
    // const pokemon = {
    //     time: 0,
    //     number: 1,
    //     height: 2,
    //     weight: 3,
    //     cp: 4
    // }
    const db = new sqlite3.Database(DB_PATH);
    const sql = (`INSERT INTO ` + uid + `
                (time, number, height, weight, cp) VALUES (?, ?, ?, ?, ?)`);
    const v = [
        pokemon.time,
        pokemon.number,
        pokemon.height,
        pokemon.weight,
        pokemon.cp
    ]
    db.serialize(() => {
        db.run(sql, v, function (err) {
            if (err) {
                console.log('add pokemon err')
            }
            else
                console.log('add success')
        });
        db.close();
    })
}

function removePokemon(uid, time) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `DELETE FROM ` + uid + ` WHERE time=?`

    db.run(sql, [time], function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(time)
        console.log('rmove')
        db.close();
    });
}

module.exports = {
    login: login,
    loadPokemon: loadPokemon,
    addPokemon: addPokemon,
    removePokemon: removePokemon
}