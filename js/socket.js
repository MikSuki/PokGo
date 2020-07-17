function Socket() {
    const socket = io({ transports: ['websocket'], upgrade: false })
    socket.login = login
    socket.loadPokemon = loadPokemon
    socket.addPokemon = addPokemon
    socket.removePokemon = removePokemon
    socket.on('login_success', loginSuccess);
    socket.on('login_again', msg => { alert('名稱重複登入') })
    socket.on('load_pokemon_success', function (data) {
        app.bag = new Bag(data)
    });

    return socket

    function login(name) {
        socket.emit('login', name);
    }

    function loginSuccess(name, pos) {
        pos_player.lat = pos.lat
        pos_player.lng = pos.lng
        const div = document.createElement('h2')
        div.innerHTML = 'Hi!&nbsp;' + name + '~&nbsp;&nbsp;&nbsp;'
        div.style.position = 'absolute'
        div.style.right = 0
        div.style.top = 0
        div.style.zIndex = 5
        document.body.appendChild(div)
        loadJS(
            'https://maps.googleapis.com/maps/api/js?key=AIzaSyBblg8OR6WM1ZnLVvOIjnBNRnDnn5GeSrU&callback=mapLoaded',
            document.body
        );
    }

    function loadPokemon() {
        socket.emit('load_pokemon');
    }

    function addPokemon(pokemon) {
        socket.emit('add_pokemon', pokemon);
    }

    function removePokemon(time) {
        socket.emit('remove_pokemon', time);
    }
}

