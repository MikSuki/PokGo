class RadarMap {
    constructor() {
        this.UI = {
            container: $(MAP_ID.container),
            panel: $(MAP_ID.panel)
        }
        // return
        this.page = 0
        this.radar_map = new google.maps.Map(document.querySelector(MAP_ID.radar_map), {
            center: pos_player,
            zoom: 19,
            clickableIcons: false,
            disableDefaultUI: true,
            disableDoubleClickZoom: true,
            // panControl: false,
            zoomControl: true,
            draggable: false,
            scrollwheel: true,
            // gestureHandling: 'cooperative',
            minZoom: 19,
            maxZoom: 20,
            streetViewControl: false,
        });
        this.panorama = this.radar_map.getStreetView();
        this.panorama.setPosition(pos_player);
        this.panorama.setOptions({
            disableDefaultUI: true,
            enableCloseButton: false,
        })
        this.panorama.setPov(/** @type {google.maps.StreetViewPov} */({
            heading: 0,
            pitch: 10
        }));
        this.panorama.addListener('position_changed', function () {
            pos_player.lat = this.panorama.getPosition().lat()
            pos_player.lng = this.panorama.getPosition().lng()
            this.updateWildPokemons(pos_player)
            this.closeTooFarPokemons()
        }.bind(this));

        player_marker = new google.maps.Marker({
            position: pos_player,
        });
        player_marker.setMap(this.radar_map);
        player_marker.setVisible(false)
        this.setMarkerImg()
        this.getWildPokemons(pos_player)
        this.panorama.setVisible(true);
    }

    setMarkerImg() {
        for (let i = 0; i < MAX_POK_LEN; ++i) {
            let n = i + 1
            if (n < 10) n = '00' + n
            else if (n < 100) n = '0' + n
            images.push({
                url: 'static/img/pokemon/' + n + '.png',
                scaledSize: new google.maps.Size(img_size[0] * POKEMON_SCALE, img_size[1] * POKEMON_SCALE)
            })
        }
    }

    watchMap() {
        app.back_btn.show()
        this.UI.panel.hide()
        this.radar_map.setCenter(new google.maps.LatLng(pos_player.lat, pos_player.lng))
        this.panorama.setVisible(false);
        player_marker.setPosition(pos_player);
        player_marker.setVisible(true)
        for (let i = 0; i < MAX_POK_LEN; ++i) {
            images[i].scaledSize.height /= POKEMON_SCALE
            images[i].scaledSize.width /= POKEMON_SCALE
        }
        for (let i = 0; i < markers.length; i++) {
            if (markers[i])
                markers[i].setVisible(true);
        }
    }

    back() {
        app.back_btn.hide()
        this.UI.panel.show()
        for (let i = 0; i < MAX_POK_LEN; ++i) {
            images[i].scaledSize.height *= POKEMON_SCALE
            images[i].scaledSize.width *= POKEMON_SCALE
        }
        this.closeTooFarPokemons()
        this.panorama.setVisible(true);
        player_marker.setVisible(false)
    }

    loadWildPokemons() {
        for (let i = 0; i < markers.length; ++i)
            if (markers[i])
                markers[i].setMap(null);
        markers.length = 0

        let cnt = 0
        surround_grid_keys.forEach(key => {
            const pos_offset = this.getIndexToPos(key)
            wild_pokemons[key[0]][key[1]].forEach(pokemon => {
                if (!pokemon.alive) {
                    // markers.push(null)
                    return
                }
                const pos = {
                    lat: pos_offset.lat + pokemon.position.lat,
                    lng: pos_offset.lng + pokemon.position.lng
                }
                let marker = new google.maps.Marker({
                    position: pos,
                    map: this.radar_map,
                    icon: images[pokemon.number - 1],
                });
                const marker_index = cnt
                marker.addListener('click', function () {
                    if (!this.panorama.getVisible()) return
                    curr_pokemon.number = pokemon.number - 1
                    curr_pokemon.marker_index = marker_index
                    curr_pokemon.key = key
                    curr_pokemon.pokemon_arr_index = wild_pokemons[key[0]][key[1]].indexOf(pokemon)
                    Pokemon.updateMap(POK_IMG[curr_pokemon.number].src)
                }.bind(this));
                markers.push(marker)
                ++cnt
            })
        })
    }

    getWildPokemons(pos) {
        surround_grid_keys.length = 0
        pos_curr_grid.lat = parseInt(pos.lat) + this.getPosToIndex(pos.lat) * GRID_LENGTH
        pos_curr_grid.lng = parseInt(pos.lng) + this.getPosToIndex(pos.lng) * GRID_LENGTH
        // left bottom grid pos
        let lat = pos_curr_grid.lat - GRID_LENGTH
        let lng = pos_curr_grid.lng - GRID_LENGTH
        // create 3 * 3 grid
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                const INT_lat = parseInt(lat)
                const INT_lng = parseInt(lng)
                const index_lat = this.getPosToIndex(lat)
                const index_lng = this.getPosToIndex(lng)
                const pos_to_key1 = INT_lat + '_' + INT_lng
                const pos_to_key2 = index_lat + '_' + index_lng
                this.createWildPokemons(pos_to_key1, pos_to_key2)
                surround_grid_keys.push([pos_to_key1, pos_to_key2])
                lng += GRID_LENGTH
            }
            lat += GRID_LENGTH
            lng -= GRID_LENGTH * 3
        }
        this.loadWildPokemons()
    }

    createWildPokemons(key1, key2) {
        const pokem_arr = []
        if (wild_pokemons[key1] == undefined)
            wild_pokemons[key1] = {}
        if (wild_pokemons[key1][key2] != undefined)
            return
        for (let k = 0; k < NUM_OF_ONE_GRID_POK; ++k)
            pokem_arr.push({
                number: ~~(Math.random() * MAX_POK_LEN) + 1,
                alive: true,
                position: {
                    lat: GRID_LENGTH * Math.random(),
                    lng: GRID_LENGTH * Math.random()
                }
            })
        wild_pokemons[key1][key2] = pokem_arr
    }

    updateWildPokemons(pos) {
        if (pos.lat > pos_curr_grid.lat ||
            pos.lat + GRID_LENGTH < pos_curr_grid.lat ||
            pos.lng - GRID_LENGTH > pos_curr_grid.lng ||
            pos.lng < pos_curr_grid.lng) {
            this.getWildPokemons(pos)
            console.log('update pos')
        }
    }

    closeTooFarPokemons() {
        for (let i = 0; i < markers.length; i++) {
            if (!markers[i]) continue
            if (Math.sqrt((pos_player.lat - markers[i].position.lat()) ** 2
                + (pos_player.lng - markers[i].position.lng()) ** 2) > DISPLAY_DISTANCE) {
                markers[i].setVisible(false);
            }
            else
                markers[i].setVisible(true);
        }
    }

    closeCatchingPokemon() {
        markers[curr_pokemon.marker_index].setMap(null);
        wild_pokemons[curr_pokemon.key[0]][curr_pokemon.key[1]][curr_pokemon.pokemon_arr_index].alive = false
    }

    getPosToIndex(v) {
        return Math.round((v % 1) / GRID_LENGTH)
    }

    getIndexToPos(key) {
        const lat = parseInt(key[0].slice(0, key[0].indexOf('_'))) + key[1].slice(0, key[1].indexOf('_')) * GRID_LENGTH
        const lng = parseInt(key[0].slice(key[0].indexOf('_') + 1, key[0].length)) + key[1].slice(key[1].indexOf('_') + 1, key[1].length) * GRID_LENGTH
        return {
            lat: lat,
            lng: lng
        }
    }
}

