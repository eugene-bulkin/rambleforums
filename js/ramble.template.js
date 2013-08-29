RAMBLE.Template = (function ($) {
    "use strict";
    var module = {};

    module.Template = function (template) {
        this.template = template;
        this.template_data = null;

        if (RAMBLE.Template.cache[this.template] !== undefined) {
            // template already loaded this session, so load from cache
            this.template_data = RAMBLE.Template.cache[this.template];
        } else {
            $.ajax({
                url: "templates/" + this.template + ".html",
                dataType: "html",
                cache: false,
                async: false, // do not allow anything else to happen until template is loaded!
                success: function (data) {
                    this.template_data = data;
                    RAMBLE.Template.cache[this.template] = data;
                }.bind(this)
            });
        }

        return this;
    };

    module.Template.prototype.apply = function (data) {
        return Mustache.render(this.template_data, data);
    };

    module.cache = {};

    return module;
}(jQuery));