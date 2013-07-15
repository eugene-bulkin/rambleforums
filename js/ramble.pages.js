var Pages = {
    forums: function () {
        var html = $('<div id="forums"></div>');

        return html;
    },

    threads: function (options) {
        var html = $('<div id="threads"></div>');

        return html;
    },

    load: function(mode, element, options) {
        if(mode == "forums") {
            $(element).html(Pages.forums());
        } else if(mode == "threads") {
            $(element).html(Pages.threads(options));
        }
    }
};