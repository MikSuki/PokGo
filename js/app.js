// import { Catch } from './module/capture.js';

window.onload = function () {
    app.socket = Socket()
    app.login = new Login()
    app.curPage = app.login
    app.back_btn = $(BACK_BTN_ID)

    app.startLogin = function () {
        $(SPINNER_ID).hide()
        app.page('login')
    }
    app.loadGame = function () {
        $(IMG_SRC_A_ID).show()
        this.socket.loadPokemon()
        this.map = new RadarMap()
        this.dex = new Pokedex()
        this.capture = new Capture()
        this.page('map')
    }
    app.page = function (cmd) {
        this.curPage.UI.container.hide()
        this.back_btn.show()
        switch (cmd) {
            case 'login':
                this.curPage = this.login
            case 'map':
                this.back_btn.hide()
                this.curPage = this.map
                break;
            case 'bag':
                this.curPage = this.bag
                break;
            case 'dex':
                this.curPage = this.dex
                break;
            case 'capture':
                this.capture.reset()
                this.curPage = this.capture
                break;
        }
        this.curPage.UI.container.show()
    }
    app.back = function () {
        if (this.curPage.back())
            this.page('map')
    }
}
