/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
var Template = function (template) {
    "use strict";
    this.template = template;
    this.template_data = null;

    this.regexes = {
        variable: /\{\{ ([\s\S]+?) \}\}/,
        each: /\{\{\{ each:(\w+?) \}\}\}([\s\S]+?)\{\{\{ \/each:\1 \}\}\}/,
        sum: /\{\{\{ sum:(\w+?):(\w+?) \}\}\}/,
        cond: "{{{ %%:(\\\w+?) }}}([\\\s\\\S]+?){{{ \/%% }}}"
    };

    this.conditionals = {
        notnull: function (val) {
            return (val !== null);
        },
        isnull: function (val) {
            return (val === null);
        },
        nonzero: function (val) {
            return (val > 0);
        }
    };

    $.ajax({
        url: "templates/" + this.template + ".html",
        dataType: "html",
        cache: false,
        async: false, // do not allow anything else to happen until template is loaded!
        success: function (data) {
            this.template_data = data;
        }.bind(this)
    });

    return this;
};

// from http://cwestblog.com/2011/11/14/javascript-snippet-regexp-prototype-clone/
RegExp.prototype.clone = function (options) {
    "use strict";
    // If the options are not in string format...
    if (options + "" !== options) {
        // If the options evaluate to true, use the properties to construct
        // the flags.
        if (options) {
            options = (options.ignoreCase ? "i" : "") + (options.global ? "g" : "") + (options.multiline ? "m" : "") + (options.sticky ? "y" : "");
        } else {
            // If the options evaluate to false, use the current flags.
            options = (this + "").replace(/[\s\S]+\//, "");
        }
    }

    // Return the new regular expression, making sure to only include the
    // sticky flag if it is available.
    return new RegExp(this.source, options);//.replace("y", ("sticky" in /s/ ? "y" : "")));
};

Template.prototype.apply = function (data) {
    "use strict";
    return Mustache.render(this.template_data, data);
};