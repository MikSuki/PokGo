const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const db_js_path = './db.js'
const users = []
const HOST = '192.168.0.102'
const PORT = 80
const init_positions = [
    { lat: 25.032945, lng: 121.564531 },
    { lat: 25.013842, lng: 121.464179 },
    { lat: 24.957586, lng: 121.241370 },
    { lat: 24.799942, lng: 120.990560 },
    { lat: 24.587324, lng: 120.768096 },
    { lat: 24.178827, lng: 120.646471 },
    { lat: 24.078426, lng: 120.548664 },
    { lat: 23.692525, lng: 120.527525 },
    { lat: 22.652918, lng: 120.303455 },
]
// const UID = 'u_13'


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

app.all('/client', function (req, res) {
    res.sendFile(path.join(__dirname, 'client.html'));
});


io.set('transports', ['websocket']);
io.on('connection', socket => {
    console.log(socket.id)
    var UID, USER_NAME;
    console.log('connect')
    console.log(users)
    socket.on('login', function (name) {
        if (users.indexOf(name) != -1) {
            socket.emit('login_again', 'same name has logined')
            return
        }
        USER_NAME = name
        users.push(USER_NAME)
        // const database = require(db_js_path)
        Promise.resolve(USER_NAME)
            .then(require(db_js_path).login)
            .then((uid) => {
                return new Promise((resolve) => {
                    UID = uid
                    socket.emit(
                        'login_success',
                        USER_NAME,
                        init_positions[~~(Math.random() * init_positions.length)]
                    )
                    resolve(uid)
                })
            })
    })

    socket.on('load_pokemon', function () {
        Promise.resolve(UID)
            .then(require(db_js_path).loadPokemon)
            .then(data => {
                return new Promise((resolve) => {
                    socket.emit('load_pokemon_success', data)
                    resolve()
                })
            })
    })

    socket.on('add_pokemon', function (pokemon) {
        const database = require(db_js_path)
        database.addPokemon(UID, pokemon)
        console.log('catching')
    })

    socket.on('remove_pokemon', function (pokemon_time) {
        require(db_js_path).removePokemon(UID, pokemon_time)
    })

    socket.on('disconnect', function () {
        // no login user
        if (!UID) return
        console.log('disconnect')
        console.log(USER_NAME + ' disconnected');
        users.splice(users.indexOf(USER_NAME), 1)
    });
});

server.listen(PORT, HOST);

// setInterval(() => {
//    console.log(users) 
// }, 1500);

// app.listen(PORT, HOST, function () {
//     console.log('start server');
//     console.log('dir:  ' + __dirname)
// });

