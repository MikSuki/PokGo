class RadarMap {
    constructor() {
        this.UI = {
            container: $(MAP_ID.container)
        }
        // return
        this.page = 0
        this.radar_map = new google.maps.Map(document.querySelector(MAP_ID.radar_map), {
            center: pos_player,
            zoom: 19,
            clickableIcons: false,
            disableDefaultUI: true,
            disableDoubleClickZoom: true,
            // gestureHandling: 'none',
            // minZoom: 18,
            // maxZoom: 20,
            streetViewControl: false,
        });
        this.panorama = this.radar_map.getStreetView();
        this.panorama.setPosition(pos_player);
        this.panorama.setOptions({
            disableDefaultUI: true,
            enableCloseButton:false,
        })
        this.panorama.setPov(/** @type {google.maps.StreetViewPov} */({
            heading: 0,
            pitch: 10
        }));
        this.panorama.addListener('position_changed', function () {
            for (let i = 0; i < WILD_POK_NUMS; i++) {
                let pos = this.getPosition()
                pos_player.lat = pos.lat()
                pos_player.lng = pos.lng()
                player_marker.setPosition(pos_player);
                if (Math.sqrt((pos_player.lat - wild_pokemons[i].position.lat) ** 2
                    + (pos_player.lng - wild_pokemons[i].position.lng) ** 2) > display_distance) {
                    markers[i].setVisible(false);
                }
                else
                    markers[i].setVisible(true);
            }
        });

        this.createData()
        this.loadData()
        // this.panorama.setVisible(true);

    }

    createData() {
        for (let i = 0; i < WILD_POK_NUMS; ++i) {
            let lat = 23.692893 + (~~(Math.random() * 200) - 100) * wild_density
            let lng = 120.527607 + (~~(Math.random() * 200) - 100) * wild_density
            wild_pokemons.push({
                number: Math.floor(Math.random() * MAX_POK_LEN) + 1,
                position: { lat: lat, lng: lng }
            })
        }
        for (let i = 0; i < MAX_POK_LEN; ++i) {
            let n = i + 1
            if (n < 10) n = '00' + n
            else if (n < 100) n = '0' + n
            images.push({
                url: 'static/img/pokemon/' + n + '.png',
                scaledSize: new google.maps.Size(img_size[0], img_size[1])
            })
        }
    }

    loadData() {
        for (let i = 0; i < WILD_POK_NUMS; i++) {
            let pokemon = wild_pokemons[i]
            let marker = new google.maps.Marker({
                position: pokemon.position,
                map: this.radar_map,
                icon: images[pokemon.number - 1],
            });
            // if(Math.abs(pos_player.lat + pos_player.lng - pokemon.position.lat - pokemon.position.lng) > 0.0001)
            //     marker.setVisible(false);
            marker.addListener('click', function () {
                // console.log(pokemon.number - 1)
                // console.log(pokemon.number)
                app.bag.catching(pokemon.number - 1)
            });
            markers.push(marker)
        }

        player_marker = new google.maps.Marker({
            position: pos_player,
            title: "Hello World!"
        });
        player_marker.setMap(this.radar_map);
    }

    watchMap() {
        if (this.panorama.getVisible()) return

        for (let i = 0; i < WILD_POK_NUMS; i++) {
            player_marker.setPosition(pos_player);
            if (Math.sqrt((pos_player.lat - wild_pokemons[i].position.lat) ** 2
                + (pos_player.lng - wild_pokemons[i].position.lng) ** 2) > display_distance) {
                markers[i].setVisible(false);
            }
            else
                markers[i].setVisible(true);
        }

        for (let i = 0; i < MAX_POK_LEN; ++i) {
            images[i].scaledSize.height *= 5
            images[i].scaledSize.width *= 5
        }

        this.panorama.setVisible(true);
        player_marker.setVisible(false)
    }

    back() {
        if (!this.panorama.getVisible()) return

        for (let i = 0; i < MAX_POK_LEN; ++i) {
            images[i].scaledSize.height /= 5
            images[i].scaledSize.width /= 5
        }
        for (let i = 0; i < WILD_POK_NUMS; i++) {
            markers[i].setVisible(true);
        }

        this.panorama.setVisible(false);
        player_marker.setVisible(true)
    }
}

