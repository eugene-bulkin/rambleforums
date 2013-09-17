/*globals $: false */
var RAMBLE = (function ($) {
    "use strict";
    function init() {
        $.ajax({
            url: "verify.php",
            data: {
                "process": "header",
                "vmodes": "logged_in;admin_panel"
            },
            dataType: "json",
            type: "post",
            success: function (data) {
                RAMBLE.Pages.load("header", "#header", {user_id: data.logged_in, admin_panel: data.admin_panel}, false, true);
            }
        });
    }

    return {
        init: init
    };
}(jQuery));

$(function () {
    "use strict";
    RAMBLE.init();
});