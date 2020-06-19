function appStart() {
    // app.map = new RadarMap()
    // app.bag = new Bag()
    app.dex = new Pokedex()
    app.dex.show()
    // app.curPage = app.map
    app.curPage = app.dex
    app.page = function (cmd) {
        this.curPage.UI.container.hide()
        switch (cmd) {
            case 'map':
                this.map.UI.container.show()
                this.curPage = this.map
                break;
            case 'bag':
                this.bag.UI.container.show()
                this.curPage = this.bag
                break;
            case 'dex':
                this.dex.UI.container.show()
                this.curPage = this.dex
                break;
        }
    }

    app.back = function () {
        if (this.curPage.back())
            this.page('map')
    }
}