/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
var RAMBLE = (function ($) {
    "use strict";
    function init() {
        RAMBLE.Login.init();

        $('#title a').on('click', function () {
            RAMBLE.Pages.load("forums", "#page");
        });

        // page already loaded! that is, we just refreshed
        if (history.state && history.state.rambleforums) {
            RAMBLE.Pages.load(history.state.mode, history.state.element, history.state.options, true);
        } else {
            RAMBLE.Pages.load("forums", "#page", null, true);
        }
    }

    return {
        init: init
    };
}(jQuery));

$(function () {
    "use strict";
    RAMBLE.init();
});