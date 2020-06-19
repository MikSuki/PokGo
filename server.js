const express = require('express');
const path = require('path');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = 'data/db'
const HOST = '192.168.0.102'
const PORT = 80

app.use('/static/img/', express.static(path.join(__dirname, '/img')));
app.use('/static/data/', express.static(path.join(__dirname, '/data/static')));
app.use('/static/model/', express.static(path.join(__dirname, '/model')));
app.use('/css', express.static(path.join(__dirname + '/css')));
app.use('/js', express.static(path.join(__dirname + '/js')));
app.use(express.json());

app.all('/index', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.all('/bag', function (req, res) {
    res.sendFile(path.join(__dirname, 'bag.html'));
});

app.all('/d', function (req, res) {
    res.sendFile(path.join(__dirname, '3d.html'));
});

app.all('/load_pokemon', function (req, res) {
    const db = new sqlite3.Database(DB_PATH);

    db.serialize(function () {
        db.all("SELECT rowid AS time, number, height, weight, cp FROM pokemons", function (err, row) {
            // console.log(row)
            db.close();
            res.send(row)
        });
    });
});

app.all('/add_pokemon', function (req, res) {
    const db = new sqlite3.Database(DB_PATH);
    const pokemon = req.query

    db.serialize(function () {
        var stmt = db.prepare(`INSERT INTO pokemons
            (time, number, height, weight, cp) VALUES (?, ?, ?, ?, ?)`);
        stmt.run(
            pokemon.time,
            pokemon.number,
            pokemon.height,
            pokemon.weight,
            pokemon.cp
        )
        stmt.finalize();
    });
    db.close();
    res.send(req.query)
});

app.all('/remove_pokemon', function (req, res) {
    const db = new sqlite3.Database(DB_PATH);
    const q = req.query

    db.run(`DELETE FROM pokemons WHERE time=?`, q.time, function (err) {
        if (err) {
            return console.error(err.message);
        }
        // console.log(`Row(s) deleted ${this.changes}`);
    });
    db.close();
    res.send(q)
});

app.listen(PORT, HOST, function () {
    console.log('start server');
    console.log('dir:  ' + __dirname)
});

