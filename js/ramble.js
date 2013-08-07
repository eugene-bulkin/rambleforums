/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
$(function() {
    "use strict";
    Login.init();

    $('#title a').on('click', function() {
        Pages.load("forums", "#page");
    });

    // page already loaded! that is, we just refreshed
    if (history.state && history.state.rambleforums) {
        Pages.load(history.state.mode, history.state.element, history.state.options, true);
    } else {
        Pages.load("forums", "#page", null, true);
    }
});