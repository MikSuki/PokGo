function checkAllLoad() {
    for (let [key, value] of Object.entries(LOAD_STATUS)) {
        if(!value) return
    }
    appStart()
}

// load pokedex data
$.ajax({
    url: PATH.pokedex
}).done(function (data) {
    data.forEach(e => {
        POKEMONS.push(e)
    });
    LOAD_STATUS.pokedex_data = true
    checkAllLoad()
});


// load image
for (let i = 0; i < MAX_POK_LEN; ++i) {
    let fn = i + 1
    if (fn < 10) fn = '00' + fn
    else if (fn < 100) fn = '0' + fn
    POK_IMG[i] = document.createElement("img")
    POK_IMG[i].width = 50
    POK_IMG[i].setAttribute('draggable', false);
    // document.body.appendChild(POK_IMG[i])
    POK_IMG[i].onload = function () {
        POK_IMG[i].onclick = function () {
            // setDexDetail(i + 1)
        }
        ++cnt
        if (cnt >= MAX_POK_LEN) {
            LOAD_STATUS.image = true
            checkAllLoad()
        }
    }
    POK_IMG[i].src = PATH.poke_img + fn + ".png"
}


// load map
function mapLoaded(){
    LOAD_STATUS.map = true
    checkAllLoad()
}