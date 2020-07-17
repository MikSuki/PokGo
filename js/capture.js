class Capture {
    constructor() {
        this.UI = {
            container: $(CATCH_ID.container),
            canvas: $(CATCH_ID.canvas),
            btn: $(CATCH_ID.btn)
        }
        this.UI.btn.click(function(){
            this.success()
        }.bind(this))
        this.is_stop = true
        this.page = 0
        this.init()
    }

    init() {
        this.initCannon()
        this.initThree(this.UI.canvas[0])
        gameobjects.forEach(e => {
            e.init()
        })
        this.setEvent(this.UI.canvas)
    }

    initCannon() {
        world = new CANNON.World();
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;

        world.gravity.set(0, -10, 0);
        world.broadphase = new CANNON.NaiveBroadphase();


        timeStep = 1.0 / 60.0; // seconds
    }

    initThree(canvas) {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
        });
        // this.UI.container.append( renderer.domElement )
        // document.getElementById('catch_container').appendChild( renderer.domElement )

        renderer.setClearColor(0xAAAAAA, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setPixelRatio(window.devicePixelRatio);

        // var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        // hemiLight.position.set(0, 0, 0);
        // scene.add(hemiLight);

        var light = new THREE.AmbientLight(0x404040, 5); // soft white light
        scene.add(light);

        // drawPokemon()
        // drawPokeball()


        function drawPokemon() {
            var loader = new THREE.TextureLoader();
            // Load an image file into a custom material
            var material = new THREE.MeshLambertMaterial({
                map: loader.load('https://i.imgur.com/2u64LR5.png')
            });
            // create a plane geometry for the image with a width of 10
            // and a height that preserves the image's aspect ratio
            var geometry = new THREE.PlaneGeometry(5, 5);
            // combine our image geometry and material into a mesh
            var mesh = new THREE.Mesh(geometry, material);
            // set the position of the image mesh in the x,y,z dimensions
            mesh.position.set(0, 0, 0)
            // add the image to the scene
            scene.add(mesh);
        }
    }

    animate() {
        updatePhysics();
        Pokeball.update()
        if (Pokeball.is_hit)
            if (Catch_process.run()) {
                this.is_stop = true
                this.UI.btn.show()
                app.bag.catching(curr_pokemon.number)
                app.map.closeCatchingPokemon()
            }
        get_mouse_move = true
        renderer.render(scene, camera);
        if (!this.is_stop)
            requestAnimationFrame(() => { this.animate() });
        function updatePhysics() {
            world.step(timeStep);
            if (isclick)
                Pokeball.setPosToMouse()
            Pokeball.copyTransform()
        }
    }

    reset() {
        this.UI.btn.hide()
        Pokemon.reset()
        Pokeball.reset()
        Particle_system.reset()
        Pokeball.is_throwed = false
        // Catch_process.reset()
        mouse_cur.x = 0
        mouse_cur.y = 0
        mouse_last.x = 0
        mouse_last.y = 0
        if (this.is_stop) {
            this.is_stop = false
            this.animate()
        }
    }

    setEvent(canvas) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log('phone')
            canvas.on('touchstart', function (e) {
                e.preventDefault();
                onCursorDown(e.touches[0].clientX, e.touches[0].clientY)
            })
            canvas.on('touchmove', function (e) {
                e.preventDefault();
                onCursorMove(e.touches[0].clientX, e.touches[0].clientY)
            })
            canvas.on('touchend', function (e) {
                e.preventDefault();
                console.log('end')
                onCursorUp()
            })
        }
        else {
            console.log('PC')
            canvas.on('mousedown', function (e) {
                e.preventDefault();
                onCursorDown(e.clientX, e.clientY)
            })
            canvas.on('mousemove', function (e) {
                e.preventDefault();
                onCursorMove(e.clientX, e.clientY)
            })
            canvas.on('mouseup', function (e) {
                e.preventDefault();
                onCursorUp()
            })
            canvas.on('mouseout', function (e) {
                e.preventDefault();
                onCursorUp()
            })
            window.addEventListener('resize', onWindowResize, false);
        }

        function onCursorDown(x, y) {
            if (Pokeball.is_throwed) return
            isclick = true
            Pokeball.cannon_body.velocity.set(0, 0, 0)
            Pokeball.cannon_body.angularVelocity.set(0, 0, 0)
            Pokeball.cannon_body.position.z = 0
            Target.three_body.visible = true
            // console.log(Pokeball.cannon_body)
            // Pokeball.cannon_body.mass = 0
            mouse_cur.x = x;
            mouse_cur.y = y;
        }

        function onCursorMove(x, y) {
            let over_window = false
            // console.log(e.clientX, e.clientY)
            if (!isclick || !get_mouse_move || Pokeball.is_throwed) return
            get_mouse_move = false
            // v.x += e.clientX
            // v.y += e.clientY
            // v.x /= 2
            // v.y /= 2

            if (x <= 0 || x >= window.innerWidth) {
                over_window = true
                console.log('over x')
            }
            else {
                mouse_last.x = mouse_cur.x
                mouse_cur.x = x;
            }
            if (y <= 0 || y >= window.innerHeight) {
                over_window = true
                console.log('over y')
            }
            else {
                mouse_last.y = mouse_cur.y
                mouse_cur.y = y;
            }
            if (over_window) {
                canvas.trigger('mouseup');
                canvas.trigger('touchend');
            }
        }

        function onCursorUp() {
            if (!isclick || Pokeball.is_throwed) return
            isclick = false
            if (mouse_last.x == 0 && mouse_last.y == 0) {
                app.capture.reset()
                return
            }
            var movement = chgPosToCannon(
                mouse_cur.x - mouse_last.x + window.innerWidth / 2,
                mouse_cur.y - mouse_last.y + window.innerHeight / 2
            )
            Pokeball.throwed(movement)

            function chgPosToCannon(x, y) {
                var vector = new THREE.Vector3(
                    (x / window.innerWidth) * 2 - 1,
                    - (y / window.innerHeight) * 2 + 1,
                    0.5
                );
                vector.unproject(camera);
                var dir = vector.sub(camera.position).normalize();
                var distance = - camera.position.z / dir.z;
                var pos = camera.position.clone().add(dir.multiplyScalar(distance));
                return pos
            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    back() {
        if(Pokeball.is_throwed) return false
        return true
    }

    success(){
        app.page('map')
    }
}

// export { Capture };
