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
            async: false,
            success: function (data) {
                RAMBLE.Pages.load("main", "body", {user_id: data});
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