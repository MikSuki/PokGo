const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

function download(uri, filename, callback) {
    // return new Promise(function (resolve, reject) {
        request(uri).pipe(fs.createWriteStream(filename));
    // });
};

const max_pok_len = 386//151;
const URL = 'https://tw.portal-pokemon.com/play/pokedex/'
const IMG_URL = 'https://tw.portal-pokemon.com'
var index = 1
var url_end = '001'

search()


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
    var src = $('.pokemon-img__front').attr('src')


    download(IMG_URL + src, url_end+'.png')

    if (++index > max_pok_len) {
        console.log('end')
    }
    else {
        url_end = index
        if (index < 10) url_end = '00' + index
        else if (index < 100) url_end = '0' + index
        search()
    }
}
