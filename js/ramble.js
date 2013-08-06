/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
$(function () {
    "use strict";
    Login.init();

    $('#title a').on('click', function () {
        Pages.load("forums", "#page");
    });

    Pages.load("threads", "#page", {forum_id: 1});
});