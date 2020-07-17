class Login {
    constructor() {
        this.UI = {
            container: $(LOGIN_ID.container),
            input: $(LOGIN_ID.input),
            btn: $(LOGIN_ID.btn)
        }

        this.UI.input.keyup(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                this.UI.btn.click();
            }
        }.bind(this))
        this.UI.btn.click(function () {
            const name = this.UI.input.val()
            if (name.length > 0)
                app.socket.login(name)
        }.bind(this));
    }
}
