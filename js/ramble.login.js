RAMBLE.Login = (function ($) {
    "use strict";
    var module = {},
    // default dialog options
        dialog_opts = {
            autoOpen: false,
            modal: true,
            draggable: false,
            width: 400,
            close: function () {
                $(this).dialog("destroy");
            }
        },
        login,
        register,
        logout;

    function log_success(data) {
        // successful login
        if (data[0] === true) {
            $('#dialog').dialog("close");
            $.ajax({
                url: "verify.php",
                data: {
                    "process": "header",
                    "vmodes": "logged_in;admin_panel"
                },
                dataType: "json",
                type: "post",
                success: function (data) {
                    RAMBLE.Pages.load("header", "#header", {user_id: data.logged_in, admin_panel: data.admin_panel, login: true}, false, true);
                }
            });
        } else {
            console.log(data);
        }
    }

    login = {
        dialog: function () {
            var d = $('<div id="dialog"></div>'),
                f = $('<form id="login_form"></form>'),
                login_form = "",
                login_buttons = {
                    "Login": login.process
                },
                opts = $.extend({
                    buttons: login_buttons,
                    title: 'Login'
                }, dialog_opts);
            login_form += '<div>';
            login_form += '<label for="username">Username:</label>';
            login_form += '<input type="text" name="username">';
            login_form += '</div><div>';
            login_form += '<label for="password">Password:</label>';
            login_form += '<input type="password" name="password">';
            login_form += '</div>';
            f.append(login_form);
            d.append(f);
            d.dialog(opts);
            d.dialog("open");
        },
        process: function () {
            var form = $(this).children('form');
            form.ajaxSubmit({
                dataType: "json",
                type: "POST",
                url: "login.php?mode=login",
                success: log_success
            });
        }
    };

    logout = {
        process: function () {
            $.ajax({
                type: "POST",
                url: "login.php?mode=logout",
                dataType: "json",
                success: function (data) {
                    if (data[0] === true) {
                        RAMBLE.Pages.load("header", "#header", {user_id: false, login: true}, false, true);
                    }
                }
            });
        }
    };

    register = {
        dialog: function () {
            var d = $('<div id="dialog"></div>'),
                f = $('<form id="login_form"></form>'),
                register_form = "",
                reg_buttons = {
                    "Create Account": register.process
                },
                opts = $.extend({
                    buttons: reg_buttons,
                    title: 'Register'
                }, dialog_opts);
            register_form += '<div>';
            register_form += '<label for="username">Username:</label>';
            register_form += '<input type="text" name="username">';
            register_form += '</div><div>';
            register_form += '<label for="password">Password:</label>';
            register_form += '<input type="password" name="password">';
            register_form += '</div>';
            f.append(register_form);
            d.append(f);
            d.dialog(opts);
            d.dialog("open");
        },
        process: function () {
            var form = $(this).children('form');
            form.ajaxSubmit({
                dataType: "json",
                type: "POST",
                url: "login.php?mode=register",
                success: log_success
            });
        }
    };

    module.init = function () {
        // Allow enter to submit form in jQuery UI Dialog
        // From http://stackoverflow.com/a/13522434/28429
        $(document).delegate('.ui-dialog', 'keyup', function (e) {
            var tagName = e.target.tagName.toLowerCase();

            tagName = (tagName === 'input' && e.target.type === 'button') ? 'button' : tagName;

            if (e.which === $.ui.keyCode.ENTER && tagName !== 'textarea' && tagName !== 'select' && tagName !== 'button') {
                $(this).find('.ui-dialog-buttonset button').eq(0).trigger('click');

                return false;
            }
        });

        $("#registerlink").on('click', register.dialog);
        $("#loginlink").on('click', login.dialog);
        $("#logoutlink").on('click', logout.process);
    };

    return module;
}(jQuery));