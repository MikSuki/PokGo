class Bag {
    constructor() {
        this.UI = {
            container: $(BAG_ID.container),
            all_pok: $(BAG_ID.all_pok),
            detail: $(BAG_ID.detail),
            remove: $(BAG_ID.remove),
            sort_group: $(BAG_ID.sort_group),
            sort_number: $(BAG_ID.sort_number),
            sort_cp: $(BAG_ID.sort_cp),
            sort_time: $(BAG_ID.sort_time),
        }
        this.page = 0
        this.poke_list = {
            cur_sort: null,
            byNumber: null,
            byCp: null,
            byTime: null
        }
        this.selected = null
        // get data
        $.ajax({
            url: "load_pokemon"
        }).done(function (data) {
            this.poke_list.byTime = data
            this.poke_list.cur_sort = this.poke_list.byTime
            // sort by cp
            this.poke_list.byCp = this.poke_list.byTime.slice().sort((a, b) => {
                if (a.cp < b.cp) {
                    return 1;
                }
                if (a.cp > b.cp) {
                    return -1;
                }
                return 0;
            });
            // sort by number
            this.poke_list.byNumber = this.poke_list.byCp.slice().sort((a, b) => {
                if (a.number < b.number) {
                    return -1;
                }
                if (a.number > b.number) {
                    return 1;
                }
                return 0;
            });
            this.show()
        }.bind(this));


        // click event

        this.UI.remove.click(function () {
            this.remove(this.selected)
            this.selected = null
            this.back()
        }.bind(this))

        this.UI.sort_number.click(function () {
            this.sort(0)
        }.bind(this))

        this.UI.sort_cp.click(function () {
            this.sort(1)
        }.bind(this))

        this.UI.sort_time.click(function () {
            this.sort(2)
        }.bind(this))

        delete this.UI.remove
        delete this.UI.sort_number;
        delete this.UI.sort_cp;
        delete this.UI.sort_time;
    }

    catching(number/*pokemon*/) {
        const pokemon = {
            time: 1,
            number: Math.floor(number/*Math.random() * MAX_POK_LEN*/),
            height: Math.floor(Math.random() * 15),
            weight: Math.floor(Math.random() * 100),
            cp: Math.floor(Math.random() * 3000),
        }

        if (this.poke_list.byTime.slice(-1)[0] != undefined)
            pokemon.time = this.poke_list.byTime.slice(-1)[0].time + 1

        $.ajax({
            url: "add_pokemon",
            data: pokemon,
        }).done(function (data) {
            console.log(data)
        });


        // push in "by time" 
        console.log(pokemon.cp)
        this.poke_list.byTime.push(pokemon);
        // push in "by number" & "by cp"
        if (this.poke_list.byTime.length == 1) {
            this.poke_list.byNumber.push(pokemon)
            this.poke_list.byCp.push(pokemon)
        }
        else {
            pushByNumber(this.poke_list.byNumber, pokemon)
            pushByCp(this.poke_list.byCp, pokemon)
        }


        this.show()

        function pushByNumber(arr, pokemon) {
            let flag = false
            for (let i in arr) {
                if (
                    pokemon.number < arr[i].number ||
                    (pokemon.number == arr[i].number &&
                        pokemon.cp >= arr[i].cp)
                ) {
                    flag = true
                    arr.splice(i, 0, pokemon)
                    break
                }
            }
            if (!flag) arr.push(pokemon)
        }

        function pushByCp(arr, pokemon) {
            let flag = false
            for (let i in arr) {
                if (pokemon.cp > arr[i].cp) {
                    flag = true
                    arr.splice(i, 0, pokemon)
                    break
                }
            }
            if (!flag) arr.push(pokemon)
        }
    }

    remove(pokemon/*index*/) {
        let arr = this.poke_list.byTime
        // const pokemon = arr[index]
        let pok = arr.splice(arr.indexOf(pokemon), 1)
        arr = this.poke_list.byCp
        arr.splice(arr.indexOf(pokemon), 1)
        arr = this.poke_list.byNumber
        arr.splice(arr.indexOf(pokemon), 1)
        this.show()

        $.ajax({
            url: "remove_pokemon",
            data: {
                time: pokemon.time
            }
        }).done(function (data) {
            // console.log(data)
        }.bind(this));
    }

    sort(cmd) {
        switch (cmd) {
            case 0:
                this.poke_list.cur_sort = this.poke_list.byNumber
                console.log('sort by number')
                break;
            case 1:
                this.poke_list.cur_sort = this.poke_list.byCp
                console.log('sort by cp')
                break;
            case 2:
                this.poke_list.cur_sort = this.poke_list.byTime
                console.log('sort by time')
                break;
        }
        this.show()
    }

    show() {
        let i = 0, len = this.poke_list.cur_sort.length - i;
        this.UI.all_pok.html('')
        while (len > 0) {
            const row = document.createElement('div')
            row.setAttribute('class', 'row')
            if (len > BAG_ROW_CONTAIN) len = BAG_ROW_CONTAIN
            for (let j = i; j < i + len; ++j) {
                let poke_number = this.poke_list.cur_sort[j].number,
                    col = document.createElement('div'),
                    span = document.createElement('span'),
                    img = POK_IMG[poke_number].cloneNode(false);

                col.setAttribute('class', 'col-4')
                span.setAttribute('class', 'position-absolute')
                span.innerHTML = this.poke_list.cur_sort[j].cp
                col.classList.add('text-center')
                img.width = SIZE.bag_img
                img.onclick = function () {
                    this.showDetail(this.poke_list.cur_sort[j])
                }.bind(this)
                col.appendChild(span)
                col.appendChild(img)
                row.appendChild(col)
            }
            this.UI.all_pok.append(row)
            i += BAG_ROW_CONTAIN
            len = this.poke_list.cur_sort.length - i
        }
    }

    showDetail(pokemon) {
        const bag_ID = {
            cp: '#bag_cp',
            img: '#bag_img',
            name: '#bag_name',
            type: '#bag_type',
            height: '#bag_height',
            weight: '#bag_weight',
        }
        const elem_type = $(bag_ID.type)
        $(bag_ID.cp).html('cp' + pokemon.cp)
        $(bag_ID.img).attr('src', POK_IMG[pokemon.number].cloneNode(false).src);
        $(bag_ID.name).html(POKEMONS[pokemon.number].name)
        $(bag_ID.height).html(pokemon.height)
        $(bag_ID.weight).html(pokemon.weight)
        // type
        elem_type.empty()
        const types = POKEMONS[pokemon.number].types
        let span = document.createElement('span')
        if (types.length == 1) {
            span.innerHTML = TYPE[types[0]]
        }
        else {
            span.innerHTML = TYPE[types[0]] + '/' + TYPE[types[1]]
        }
        elem_type.append(span)

        this.UI.all_pok.hide()
        this.UI.detail.show(600)
        this.page = 1
        this.selected = pokemon
    }

    back() {
        if(this.page == 0) return true
        --this.page
        this.UI.detail.hide()
        this.UI.all_pok.show()
    }
}
