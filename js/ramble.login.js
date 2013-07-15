var Login = {
    init: function () {
        // Allow enter to submit form in jQuery UI Dialog
        // From http://stackoverflow.com/a/13522434/28429
        $(document).delegate('.ui-dialog', 'keyup', function(e) {
            var tagName= e.target.tagName.toLowerCase();

            tagName= (tagName == 'input' && e.target.type == 'button') ? 'button' : tagName;

            if (e.which == $.ui.keyCode.ENTER &&
                tagName != 'textarea' &&
                tagName != 'select'
                && tagName != 'button') {
                $(this).find('.ui-dialog-buttonset button').eq(0).trigger('click');

                return false;
            }
        });

        $("#registerlink").on('click', Login.register.dialog);
        $("#loginlink").on('click', Login.login.dialog);
        $("#logoutlink").on('click', Login.logout.process);
    },

    // default dialog options
    dialog_opts: {
        autoOpen: false,
        modal: true,
        draggable: false,
        close: function (e, ui) {
            $(this).dialog("destroy");
        }
    },

    log_success: function (data) {
        // successful login
        if(data === true) {
            $('#dialog').dialog("close");
        } else {
            console.log(data);
        }
    },

    login: {
        dialog: function(e, ui) {
            var d = $('<div id="dialog"></div>'),
                f = $('<form></form>'),
                login_form = "",
                login_buttons = { "Login": Login.login.process },
                opts = $.extend({ buttons: login_buttons } ,Login.dialog_opts);
            login_form += '<label for="username">Username</label>';
            login_form += '<input type="text" name="username">';
            login_form += '<label for="password">Password</label>';
            login_form += '<input type="password" name="password">';
            f.append(login_form);
            d.append(f);
            var dialog = d.dialog(opts);
            d.dialog("open");
        },
        process: function(e, ui) {
            var form = $(this).children('form');
            form.ajaxSubmit({
                dataType: "json",
                type: "POST",
                url: "login.php?mode=login",
                success: Login.log_success
            });
        }
    },

    logout: {
        process: function(e, ui) {
            $.ajax({
                type: "POST",
                url: "login.php?mode=logout",
                dataType: "json",
                success: function (data) {
                    if(data === true) {
                        location.href = location.href;
                    }
                }
            });
        }
    },

    register: {
        dialog: function(e, ui) {
            var d = $('<div id="dialog"></div>'),
                f = $('<form></form>'),
                register_form = "",
                reg_buttons = { "Create Account": Login.register.process },
                opts = $.extend({ buttons: reg_buttons }, Login.dialog_opts);
            register_form += '<label for="username">Username</label>';
            register_form += '<input type="text" name="username">';
            register_form += '<label for="password">Password</label>';
            register_form += '<input type="password" name="password">';
            f.append(register_form);
            d.append(f);
            var dialog = d.dialog(opts);
            d.dialog("open");
        },
        process: function(e, ui) {
            var form = $(this).children('form');
            form.ajaxSubmit({
                dataType: "json",
                type: "POST",
                url: "login.php?mode=register",
                success: Login.log_success
            });
        }
    }
};