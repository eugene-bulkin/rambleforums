function process_logout(e, ui) {
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

function process_registration(e, ui) {
    var form = $(this).children('form');
    form.ajaxSubmit({
        dataType: "json",
        type: "POST",
        url: "login.php?mode=register",
        success: function (data) {
            // successful registration
            if(data === true) {
                $('#dialog').dialog("close");
            } else {
                console.log(data);
            }
        }
    });
}

function register_form(e, ui) {
    var d = $('<div id="dialog"></div>'),
        f = $('<form></form>'),
        register_form = "";
    register_form += '<label for="username">Username</label>';
    register_form += '<input type="text" name="username">';
    register_form += '<label for="password">Password</label>';
    register_form += '<input type="password" name="password">';
    f.append(register_form);
    d.append(f);
    var dialog = d.dialog({
        autoOpen: false,
        modal: true,
        draggable: false,
        buttons: {
            "Create Account": process_registration
        },
        close: function (e, ui) {
            $(this).dialog("destroy");
        }
    });
    d.dialog("open");
}

function process_login(e, ui) {
    var form = $(this).children('form');
    form.ajaxSubmit({
        dataType: "json",
        type: "POST",
        url: "login.php?mode=login",
        success: function (data) {
            // successful login
            if(data === true) {
                $('#dialog').dialog("close");
            } else {
                console.log(data);
            }
        }
    });
}

function login_form(e, ui) {
    var d = $('<div id="dialog"></div>'),
        f = $('<form></form>'),
        login_form = "";
    login_form += '<label for="username">Username</label>';
    login_form += '<input type="text" name="username">';
    login_form += '<label for="password">Password</label>';
    login_form += '<input type="password" name="password">';
    f.append(login_form);
    d.append(f);
    var dialog = d.dialog({
        autoOpen: false,
        modal: true,
        draggable: false,
        buttons: {
            "Login": process_login
        },
        close: function (e, ui) {
            $(this).dialog("destroy");
        }
    });
    d.dialog("open");
}

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

$(function () {
    $("button#register").on('click', register_form);
    $("button#login").on('click', login_form);
    $("button#logout").on('click', process_logout);
});