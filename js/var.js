const app = {};
const MAX_POK_LEN = 386
const GRID_LENGTH = 0.001
const DISPLAY_DISTANCE = GRID_LENGTH * 0.25
const MAX_OF_GRID = 1 / GRID_LENGTH
const pos_player = { lat: 23.692525, lng: 120.527525 };
const pos_curr_grid = { lat: 0, lng: 0 };
const wild_pokemons = {}
const surround_grid_keys = []
const NUM_OF_ONE_GRID_POK = 4
const curr_pokemon = {
    number: -1,
    marker_index: -1,
    key: '',
    pokemon_arr_index: -1
}
const img_size = [50, 50]
const POKEMON_SCALE = 5
const images = [];
const markers = [];
const LOAD_STATUS = {
    // map: false,
    pokedex_data: false,
    image: false,
    ball_model: false
}
var player_marker;
const BAG_ROW_CONTAIN = 3
const POKEMONS = []
const POK_IMG = []
var BALL_GLTF = null
const TYPE = [
    '一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面'
    , '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精'
]
const PATH = {
    pokedex: '/static/data/pokemon.json',
    poke_img: "static/img/pokemon/",
    model: 'static/model/pokeball.glb',
}
const SPINNER_ID = '#spinner'
const LOGIN_ID = {
    container: '#login_container',
    input: '#login_input',
    btn: '#login_btn',
}
const MAP_ID = {
    container: '#map_container',
    radar_map: '#radar_map',
    panel: '#map-panel'
}
const BACK_BTN_ID = '#back_btn'
const IMG_SRC_A_ID = '#img_src_a'
const BAG_ID = {
    container: '#bag_container',
    all_pok: '#bag_all_pok',
    detail: '#bag_detail',
    remove: '#rm_btn',
    sort_group: '#bag_sort_group',
    sort_number: '#bag_number_btn',
    sort_cp: '#bag_cp_btn',
    sort_time: '#bag_time_btn',
}
const DEX_ID = {
    container: '#dex_container',
    all_pok: '#dex_all_pok',
    detail: '#dex_detail',
    number: '#dex_number',
    img: '#dex_img',
    name: '#dex_name',
    type: '#dex_type',
    weakness: '#dex_weakness',
    height: '#dex_height',
    weight: '#dex_weight',
    category: '#dex_category',
    story: '#dex_story',
}
const CATCH_ID = {
    container: '#catch_container',
    canvas: '#catch_cns',
    btn: '#catch_btn'
}
const SIZE = {
    bag_img: window.innerWidth / 3 * 0.5
}
let cnt = 0;

const PROBABILITY = 100
const ROTATE_TIME = 4
const POKEMON_POS = {
    x: 0,
    y: 3,
    z: -25
}
const POKEMON_SIZE = {
    x: 20,
    y: 20,
    z: .1
}
const VALUE = {
    ROTATE_X: 18,
    ROTATE_Y: 12
}
const FRAME = {
    BALL_THROW: 150,
    BOUNCE: 30,
    ABSORB: 30,
    DROPPING: 30,
    ROTATE: 13 * 2,
    WAIT_ROTATE: 20,
    SUCCESS: 20,
    BREAK: 30
}
// for (let i in FRAME)
//     FRAME[i] /= 10

var world, timeStep;
var scene, camera, renderer;
var start_pos = new THREE.Vector3(5, 5, -10)
var end_pos = new THREE.Vector3(0, 0, 0)
var dir_vec = new THREE.Vector3(
    end_pos.x - start_pos.x,
    end_pos.y - start_pos.y,
    end_pos.z - start_pos.z,
)
var distance = start_pos.distanceTo(end_pos)

var isclick = false,
    get_mouse_move = false,
    mouse_cur = new THREE.Vector2(),
    mouse_last = new THREE.Vector2(),
    result = false;
