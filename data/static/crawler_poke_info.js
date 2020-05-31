const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const TYPE = [
    '一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面'
    , '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精'
]
const POKEMONS = []
const URL = 'https://tw.portal-pokemon.com/play/pokedex/'
const max_pok_len = 386
var index = 1
var url_end = '001'

function doRequest(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

async function search() {
    var body = await doRequest(URL + url_end);
    var $ = cheerio.load(body)
    var name = $('.pokemon-slider__main-name').text()
    var types = $('.pokemon-type__type')
    var weaknesses = $('.pokemon-weakness')
    var height = $('.pokemon-info__height').find('.pokemon-info__value').text()
    var weight = $('.pokemon-info__weight').find('.pokemon-info__value').text()
    var category = $('.pokemon-info__category').find('.pokemon-info__value').text()
    var stories = $('.pokemon-story__body')
    var pokemon = {
        number: url_end,
        name: name,
        types: [],
        weaknesses: [],
        height: height,
        weight: weight,
        category: category,
        story: ''
    }

    types.find('span').each((i, type) => {
        pokemon.types.push(TYPE.indexOf(type.children[0].data))
    })
    weaknesses.find('span').each((i, weakness) => {
        pokemon.weaknesses.push(TYPE.indexOf(weakness.children[0].data))
    })
    stories.find('span').each((i, story) => {
        // if(pokemon.story != '' && pokemon.story != story.children[0].data){
        //     console.log(pokemon.story )
        //     console.log(story.children[0].data)
        // }
        pokemon.story = story.children[0].data
    })

    POKEMONS.push(pokemon)

    if (++index > max_pok_len) {
        wFile()
    }
    else {
        url_end = index
        if (index < 10) url_end = '00' + index
        else if (index < 100) url_end = '0' + index
        search()
    }
}

search()

function wFile() {
    var json = JSON.stringify(POKEMONS);
    fs.writeFile('pokemon.json', json, 'utf8', function (err2) {
        if (err2) throw err2;
    });
}
