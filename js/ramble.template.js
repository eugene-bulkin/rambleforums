/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
var Template = function (template) {
    "use strict";
    this.template = template;
    this.template_data = null;

    if(Template.cache[this.template] !== undefined) {
        // template already loaded this session, so load from cache
        this.template_data = Template.cache[this.template];
    } else {
        $.ajax({
            url: "templates/" + this.template + ".html",
            dataType: "html",
            cache: false,
            async: false, // do not allow anything else to happen until template is loaded!
            success: function (data) {
                this.template_data = data;
                Template.cache[this.template] = data;
            }.bind(this)
        });
    }

    return this;
};

Template.cache = {};

Template.prototype.apply = function (data) {
    "use strict";
    return Mustache.render(this.template_data, data);
};