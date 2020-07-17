class Pokedex {
    constructor() {
        this.UI = {
            container: $(DEX_ID.container),
            all_pok: $(DEX_ID.all_pok),
            detail: $(DEX_ID.detail),
        }
        this.page = 0
        this.show()
    }

    show() {
        for (let i = 0; i < MAX_POK_LEN; ++i) {
            const img = POK_IMG[i].cloneNode(false);
            img.width = 120
            this.UI.all_pok.append(img)
            img.classList.add('dex_all_img', /*'rounded-circle'*/)
            img.onclick = function () {
                Pokemon.updateMap(POK_IMG[i].src)
                this.setDexDetail(i + 1)
            }.bind(this)
        }
    }

    setDexDetail(number) {
        const pokemon = POKEMONS[number - 1]
        console.log(pokemon.number)
        const elem_type = $(DEX_ID.type)
        const elem_weakness = $(DEX_ID.weakness)
        $(DEX_ID.number).html(pokemon.number)
        $(DEX_ID.img).attr("src", POK_IMG[number - 1].cloneNode(false).src);
        $(DEX_ID.name).html(pokemon.name)
        $(DEX_ID.height).html(pokemon.height)
        $(DEX_ID.weight).html(pokemon.weight)
        $(DEX_ID.category).html(pokemon.category)
        $(DEX_ID.story).html(pokemon.story)
        // type
        elem_type.empty()
        pokemon.types.forEach(i => {
            let div = document.createElement('div')
            div.classList.add('col')
            div.innerHTML = TYPE[i]
            elem_type.append(div)
        })
        // category
        elem_weakness.empty()
        pokemon.weaknesses.forEach(i => {
            let div = document.createElement('div')
            div.classList.add('col')
            div.innerHTML = TYPE[i]
            elem_weakness.append(div)
        })
        this.UI.all_pok.hide()
        this.UI.detail.show(600)
        this.page = 1
    }

    back() {
        if (this.page == 0) return true
        --this.page
        this.UI.detail.hide()
        this.UI.all_pok.show()
    }
}
