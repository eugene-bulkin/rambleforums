/*globals $: false */
var RAMBLE = (function ($) {
    "use strict";
    function init() {
        $.ajax({
            url: "verify.php",
            data: {
                "process": "logged_in"
            },
            dataType: "json",
            type: "post",
            success: function (data) {
                RAMBLE.Pages.load("header", "#header", {user_id: data}, false, true);
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