const Ground = {
    cannon_body: null,
    three_body: null,
    init: function () {
        const pos_y = -6
        // cannon
        var groundShape = new CANNON.Plane();
        this.cannon_body = new CANNON.Body({ mass: 0 });
        this.cannon_body.addShape(groundShape);
        this.cannon_body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.cannon_body.position.y = pos_y
        this.cannon_body.addEventListener("collide", function () {
            if (Pokeball.is_dropping) {
                Pokeball.touch_ground = true
                Pokeball.is_dropping = false
            }
        });
        world.addBody(this.cannon_body);

        // three
        this.three_body = new THREE.GridHelper(200, 20, 0x888888, 0x888888);
        this.three_body.position.y = pos_y
        scene.add(this.three_body);

    }
}
const Pokeball = {
    cannon_body: null,
    three_body: null,
    is_throwed: false,
    throw_cnt: 0,
    is_hit: false,
    is_dropping: false,
    is_rotate_first: true,
    is_success: false,
    touch_ground: false,
    DEFAULT_POS: {
        x: 0,
        y: 0,
        z: 0
    },
    DEFAULT_MASS: 0,
    init: function () {
        // cannon
        var radius = 1; // m
        this.cannon_body = new CANNON.Body({
            mass: 1, // kg
            position: new CANNON.Vec3(this.DEFAULT_POS.x, this.DEFAULT_POS.y, this.DEFAULT_POS.z), // m
            shape: new CANNON.Sphere(radius)
        });
        this.cannon_body.mass = this.DEFAULT_MASS
        world.addBody(this.cannon_body);

        // three
        this.three_body = BALL_GLTF.scene;
        scene.add(this.three_body);
    },
    reset: function () {
        this.cannon_body.mass = this.DEFAULT_MASS
        this.cannon_body.position.copy(this.cannon_body.initPosition)
        this.cannon_body.quaternion.set(0, 0, 0, 1)
        this.cannon_body.velocity.set(0, 0, 0)
        this.cannon_body.angularVelocity.set(0, 0, 0)
        this.is_rotate_first = true
        this.is_hit = false
        this.is_dropping = false
        this.touch_ground = false
        this.is_success = false
    },
    update() {
        if (this.is_throwed && !this.is_hit) {
            if (--this.throw_cnt < 0) {
                app.capture.reset()
            }
        }
    },
    setPosToMouse: function () {
        var raycaster = new THREE.Raycaster();
        var vector = new THREE.Vector3(
            (mouse_cur.x / window.innerWidth) * 2 - 1,
            - (mouse_cur.y / window.innerHeight) * 2 + 1,
            0.5
        );
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        this.cannon_body.position.x = pos.x
        this.cannon_body.position.y = pos.y
    },
    copyTransform: function () {
        this.three_body.position.copy(this.cannon_body.position);
        this.three_body.quaternion.copy(this.cannon_body.quaternion);
    },
    throwed(movement) {
        console.log('throw')
        if (this.cannon_body.position.y - this.three_body.scale.y < Ground.cannon_body.position.y) {
            app.capture.reset()
            return
        }
        this.is_throwed = true
        this.throw_cnt = FRAME.BALL_THROW

        const v = {
            x: ~~(movement.x / timeStep / 10),
            y: ~~(movement.y / timeStep / 10)
        }
        const offset = 5
        v.x += v.x > 0 ? offset : -offset
        v.y += v.y > 0 ? offset : -offset
        if (v.x == -offset) v.x = 0
        if (v.y == -offset) v.y = 0
        v.z = -1.5 * Math.sqrt(v.x ** 2 + v.y ** 2) - offset

        this.cannon_body.mass = 1
        this.cannon_body.velocity.set(
            v.x,
            v.y,
            // Pokeball.cannon_body.position.y * 10, 
            v.z
        )
        console.log('mouse_cur')
        console.log(mouse_cur)
        console.log('mouse_last')
        console.log(mouse_last)
        console.log(this.cannon_body.velocity)
    },
    bound: function (cnt) {
        this.cannon_body.velocity.x *= 1.03
        this.cannon_body.velocity.y *= 1.03
        this.cannon_body.velocity.z *= 1.03

        if (cnt == 0) {
            this.cannon_body.velocity.set(0, 0, 0)
            this.cannon_body.angularVelocity.set(0, 0, 0)
            this.cannon_body.mass = 0
            start_pos.copy(this.three_body.position)
            end_pos.copy(Pokemon.three_body.position)
            end_pos.y = -5
            dir_vec = new THREE.Vector3(
                end_pos.x - start_pos.x,
                end_pos.y - start_pos.y,
                end_pos.z - start_pos.z,
            )
            distance = start_pos.distanceTo(end_pos)
        }
    },
    waitDropping: (function () {
        return function (cnt) {
            if (cnt == FRAME.DROPPING) {
                Beam.three_body.visible = false
                Pokemon.three_body.visible = false
                this.is_dropping = true
                this.cannon_body.position.set(this.DEFAULT_POS.x, this.DEFAULT_POS.y, this.DEFAULT_POS.z)
                this.cannon_body.quaternion.set(0, 0, 0, 1)
                this.cannon_body.mass = 1
                --Catch_process.cnt // prevent interlock 
            }
            if (cnt == 0) {
                // Catch_process.nextStatus()
            }
            // wait until pokeball touch on the ground
            if (!this.touch_ground)
                ++Catch_process.cnt
        }
    })(),
    rotate: (function () {
        const rad = 180 / Math.PI
        var x_minus, y_minus,
            cnt1, cnt2,
            rotate_time,
            fail_time,
            angle = {
                x: 0,
                y: 0,
                z: 0
            };

        return function () {
            if (this.is_rotate_first) {
                this.is_rotate_first = false
                cnt1 = FRAME.ROTATE
                cnt2 = FRAME.WAIT_ROTATE
                rotate_time = ROTATE_TIME
                x_minus = VALUE.ROTATE_X
                y_minus = VALUE.ROTATE_Y
                this.is_success = ~~(Math.random() * 100) > PROBABILITY ? true : false
                if (this.is_success) {
                    fail_time = -1
                    result = true
                }
                else {
                    fail_time = ~~(Math.random() * 4) + 1
                    c = false
                }
            }
            if (rotate_time > 0) {
                if (cnt1 >= 0) {
                    angle.x += x_minus
                    angle.y -= y_minus
                    x_minus *= 0.9
                    y_minus *= 0.9
                    if (cnt1 % (FRAME.ROTATE / 2) == 0) {
                        if (Math.sign(x_minus) > 0) {
                            x_minus = -1 * VALUE.ROTATE_X
                        }
                        else {
                            x_minus = VALUE.ROTATE_X
                        }
                        if (Math.sign(y_minus) > 0) {
                            y_minus = -1 * VALUE.ROTATE_Y
                        }
                        else {
                            y_minus = VALUE.ROTATE_Y
                        }

                    }
                    if (cnt1 == 0) {
                        angle = {
                            x: 0,
                            y: 0,
                            z: 0
                        }
                    }
                    this.cannon_body.quaternion.setFromEuler(
                        angle.x / rad,
                        angle.y / rad,
                        angle.z / rad,
                        'XYZ'
                    )
                    --cnt1
                }
                else if (cnt2 >= 0) {
                    if (rotate_time == fail_time) {
                        Catch_process.nextStatus()
                        ++Catch_process.cnt
                        return
                    }
                    if (cnt2 == 0) {
                        cnt1 = FRAME.ROTATE
                        cnt2 = FRAME.WAIT_ROTATE
                        x_minus *= -1
                        --rotate_time
                    }
                    --cnt2
                }
            }
        }

    })(),
}
const Pokemon = {
    three_body: null,
    size: {
        x: 20,
        y: 20,
        z: .1
    },
    init: function () {
        // three
        var geometry = new THREE.PlaneGeometry(
            this.size.x,
            this.size.y,
            this.size.z
        );
        var material = new THREE.MeshBasicMaterial({
            // color: 0x000000,
            // map: pokemon_map,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });
        this.three_body = new THREE.Mesh(geometry, material);
        this.three_body.position.set(POKEMON_POS.x, POKEMON_POS.y, POKEMON_POS.z)
        scene.add(this.three_body);
    },
    updateMap(src) {
        new THREE.TextureLoader().load(src,
            function (texture) {
                var geometry = new THREE.PlaneGeometry(
                    this.size.x,
                    this.size.y,
                    this.size.z
                );
                var material = new THREE.MeshBasicMaterial({
                    // color: 0x000000,
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 1
                });
                scene.remove(this.three_body)
                this.three_body = new THREE.Mesh(geometry, material);
                this.three_body.position.set(POKEMON_POS.x, POKEMON_POS.y, POKEMON_POS.z)
                scene.add(this.three_body);
                app.page('capture')
            }.bind(this))
    },
    absorb: (function () {
        const FINAL_SCALE = 0.1;
        let scale_minus, interval;
        return function (cnt) {
            if (cnt == FRAME.ABSORB) {
                scale_minus = this.three_body.scale.y * (1 - FINAL_SCALE) / FRAME.ABSORB
                var dir_vec = new THREE.Vector3(
                    start_pos.x - this.three_body.position.x,
                    start_pos.y - this.three_body.position.y,
                    start_pos.z - this.three_body.position.z
                )
                interval = dir_vec.clone().multiplyScalar((1 - FINAL_SCALE) / FRAME.ABSORB)
            }
            this.three_body.scale.x -= scale_minus
            this.three_body.scale.y -= scale_minus
            this.three_body.position.add(interval)
        }
    })(),
    breakAway: (function () {
        const FINAL_SCALE = 0.1;
        let scale_minus, interval;
        return function (cnt) {
            if (cnt == FRAME.BREAK) {
                this.three_body.visible = true
                this.three_body.position.copy(Pokeball.cannon_body.position)
                Pokeball.cannon_body.velocity.set(
                    Math.random() * 30 - 15,
                    Math.random() * 10,
                    Math.random() * 10 + 10
                )
                scale_minus = (1 - FINAL_SCALE) / FRAME.BREAK
                var dir_vec = new THREE.Vector3(
                    POKEMON_POS.x - Pokeball.three_body.position.x,
                    POKEMON_POS.y - Pokeball.three_body.position.y,
                    POKEMON_POS.z - Pokeball.three_body.position.z
                )
                interval = dir_vec.clone().multiplyScalar((1 - FINAL_SCALE) / FRAME.BREAK)
                if(!interval.x) interval.x = 0
                if(!interval.y) interval.y = 0
                if(!interval.z) interval.z = -2
            }
            this.three_body.scale.x += scale_minus
            this.three_body.scale.y += scale_minus
            this.three_body.position.add(interval)
            if (cnt == 0)
                app.capture.reset()
        }
    }()),
    reset: function () {
        // this.cannon_body.position.copy(this.cannon_body.initPosition)
        this.three_body.position.set(POKEMON_POS.x, POKEMON_POS.y, POKEMON_POS.z)
        this.three_body.scale.set(1, 1, 1)
    }
}
const Target = {
    cannon_body: null,
    three_body: null,
    init: function () {
        const RADIUS = POKEMON_SIZE.x / 2 * 0.8
        // cannon
        const targetShape = new CANNON.Cylinder(
            RADIUS,
            RADIUS,
            .1,
            128
        );
        this.cannon_body = new CANNON.Body({ mass: 0 });
        this.cannon_body.addShape(targetShape);
        this.cannon_body.position.x = POKEMON_POS.x
        this.cannon_body.position.y = POKEMON_POS.y
        this.cannon_body.position.z = POKEMON_POS.z
        // this.cannon_body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), -Math.PI / 2);
        this.cannon_body.addEventListener("collide", function (e) {
            if (!Pokeball.touch_ground) {
                this.three_body.visible = false
                Pokeball.is_hit = true
                Catch_process.init()
            }
        }.bind(this));
        world.addBody(this.cannon_body);

        // three
        var segments = 128,
            material = new THREE.LineBasicMaterial(),
            geometry = new THREE.CircleGeometry(1, segments);
        // Remove center vertex
        geometry.vertices.shift();
        this.three_body = new THREE.LineLoop(geometry, material)
        this.three_body.position.set(POKEMON_POS.x, POKEMON_POS.y, POKEMON_POS.z)
        this.three_body.scale.set(
            RADIUS,
            RADIUS,
            POKEMON_SIZE.z
        )
        this.three_body.visible = false
        scene.add(this.three_body);

    }
}
const Beam = {
    three_body: null,
    init: function () {
        var option = {
            radiusTop: 1,
            radiusBottom: 2,
            height: 1
        }
        var geometry = new THREE.CylinderGeometry(
            option.radiusTop,
            option.radiusBottom,
            option.height,
        );
        var material = new THREE.ShaderMaterial({
            uniforms: {
                color1: {
                    value: new THREE.Color(0xff0000)
                },
                color2: {
                    value: new THREE.Color(0xffbb00)
                },
                color3: {
                    value: new THREE.Color(0xffffff)
                }
            },
            vertexShader: `
                        varying vec2 vUv;

                        void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                        }
                    `,
            fragmentShader: `
                        uniform vec3 color1;
                        uniform vec3 color2;
                        uniform vec3 color3;
                    
                        varying vec2 vUv;
                        
                        void main() {
                        
                        gl_FragColor = vec4(mix(color1, color3, vUv.y), 0.5);
                        }
                    `,
            // wireframe: true,
            transparent: true
        });
        this.three_body = new THREE.Mesh(geometry, material);
        this.three_body.visible = false
        scene.add(this.three_body);


    },
    setTransform: function () {
        this.three_body.scale.y = distance
        this.three_body.position.copy(start_pos);
        this.three_body.position.add(dir_vec.clone().multiplyScalar(0.5));
        this.three_body.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir_vec.clone().normalize());
        this.three_body.visible = true
    },
    absorb: (function () {
        const FINAL_SCALE = 0.1;
        let scale_minus, interval;
        return function (cnt) {
            if (cnt == FRAME.ABSORB) {
                this.setTransform()
                scale_minus = this.three_body.scale.y * (1 - FINAL_SCALE) / FRAME.ABSORB
                interval = dir_vec.clone().multiplyScalar(0.5 * (1 - FINAL_SCALE) / FRAME.ABSORB)
            }
            this.three_body.scale.y -= scale_minus
            this.three_body.position.sub(interval);
        }
    }()),
}
const Particle_system = {
    len: 50,
    velocity: [],
    three_body: null,
    init: function () {
        const positions = []
        for (let i = 0; i < this.len; ++i) {
            positions.push(
                0, 0, 0
            );
            this.velocity.push(
                Math.random() - 0.5,
                Math.random(),
                Math.random() - 0.5
            )
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffff55,
            size: 0.3,
            transparent: true,
            opacity: 1
        });

        this.three_body = new THREE.Points(geometry, material);
        this.three_body.visible = false
        scene.add(this.three_body);
    },
    reset: function () {
        this.velocity = []
        for (let i = 0; i < this.len; ++i) {
            this.velocity.push(
                Math.random() - 0.5,
                Math.random(),
                Math.random() - 0.5
            )
        }
    },
    setTransform: function () {
        const positions = this.three_body.geometry.attributes.position.array;
        this.cnt = FRAME.SUCCESS
        for (let i = 0; i < positions.length; i += 3) {
            // update the velocity
            // and the position
            positions[i] = Pokeball.three_body.position.x
            positions[i + 1] = Pokeball.three_body.position.y
            positions[i + 2] = Pokeball.three_body.position.z
        }
        this.three_body.visible = true
    },
    update: function (cnt) {
        const positions = this.three_body.geometry.attributes.position.array;
        const g = 9.8 / 2 * timeStep
        if (cnt == FRAME.SUCCESS) {
            this.setTransform()
        }
        else if (cnt <= 0) {
            this.three_body.visible = false
            return
        }
        for (let i = 0; i < positions.length; i += 3) {
            // update the velocity
            this.velocity[i + 1] -= g
            // and the position
            positions[i] += this.velocity[i]
            positions[i + 1] += this.velocity[i + 1]
            positions[i + 2] += this.velocity[i + 2]
        }
        this.three_body.geometry.attributes.position.needsUpdate = true;
        // this.three_body.geometry.computeBoundingSphere();
    }
}
const Catch_process = {
    status: Number.MAX_SAFE_INTEGER,
    cnt: -1,
    init: function () {
        this.status = 0
        this.setCnt()
    },
    reset: function () {
        this.init()
    },
    addCnt: function (value) {
        this.cnt += value
    },
    setCnt: function () {
        switch (this.status) {
            case 0: this.cnt = FRAME.BOUNCE; break;
            case 1: this.cnt = FRAME.ABSORB; break;
            case 2: this.cnt = FRAME.DROPPING; break;
            case 3: this.cnt = (FRAME.ROTATE + FRAME.WAIT_ROTATE) * ROTATE_TIME; break;
            case 4:
                if (result == true)
                    this.cnt = FRAME.SUCCESS
                else
                    this.cnt = FRAME.BREAK;
                break;
        }
    },
    nextStatus: function () {
        ++this.status
        this.setCnt()
    },
    run: function () {
        if (this.status > Object.keys(FRAME).length - 1) return
        switch (this.status) {
            case 0: // pokeball bound
                Pokeball.bound(this.cnt)
                break;
            case 1: // absorb
                Pokemon.absorb(this.cnt)
                Beam.absorb(this.cnt)
                break;
            case 2: // ball dropping
                Pokeball.waitDropping(this.cnt)
                break;
            case 3: // catching...
                Pokeball.rotate()
                break;
            case 4: // success or false
                if (Pokeball.is_success) {
                    Particle_system.update(this.cnt)
                    if (this.cnt == 0) return true
                }
                else
                    Pokemon.breakAway(this.cnt)
                break;
        }
        if (--this.cnt < 0)
            this.nextStatus()
    }
}

const gameobjects = [Ground, Pokeball, Pokemon, Target, Beam, Particle_system]
