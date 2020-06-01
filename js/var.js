const app = {};
const pos_player = { lat: 23.692893, lng: 120.527607 };
const pos_pok = { lat: 23.692843, lng: 120.527607 };
const img_size = [50, 50]
const MAX_POK_LEN = 50// 386
const wild_pokemons = [];
const WILD_POK_NUMS = 100
const images = [];
const markers = [];
const display_distance = 0.0003
const wild_density = 0.00005
const LOAD_STATUS = {
    map: true,
    pokedex_data: false,
    image: false
}
var player_marker

const BAG_ROW_CONTAIN = 3
const POKEMONS = []
const POK_IMG = []
const TYPE = [
    '一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面'
    , '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精'
]


const PATH = {
    pokedex: '/static/data/pokemon.json',
    poke_img: "static/img/pokemon/"
}
const MAP_ID = {
    container: '#map_container',
    radar_map: '#radar_map'
}
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

const SIZE = {
    bag_img: window.innerWidth / 3 * 0.5
}
let cnt = 0;