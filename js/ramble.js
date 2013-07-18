/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
$(function () {
    "use strict";
    Login.init();

    Pages.load("group_order", "#page");
});