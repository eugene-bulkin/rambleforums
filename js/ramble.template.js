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

Template.prototype.getMatches = function (search, regex) {
    "use strict";
    var str = search,
        result = [],
        res;
    regex = regex.clone("");
    while ((res = str.match(regex)) !== null) {
        result.push(res);
        str = str.substr(res.index + 1);
    }
    return result;
};

// Get value from data object with given key, following periods to
// go deeper into object
Template.prototype.getValue = function (data, key) {
    "use strict";
    var keyS = key.split("."),
        val = data[keyS[0]],
        i;
    for (i = 1; i < keyS.length; i++) {
        val = val[keyS[i]];
    }
    return val;
};

Template.prototype.apply = function (data, td) {
    "use strict";
    td = td || this.template_data;
    var matchArr, repl,
        eachD, eachRes,
        variable, varVal, i, j,
        k, regex, sum,
        sumParent,
        result = td,
        matches;
    // process each tag first because it has higher precedent
    // have to do in loop in case of nesting
    while ((matchArr = result.match(this.regexes.each)) !== null) {
        eachD = this.getValue(data, matchArr[1]);
        eachRes = "";
        for (j = 0; j < eachD.length; j++) {
            eachRes += this.apply(eachD[j], matchArr[2]);
        }
        result = result.replace(matchArr[0], eachRes);
    }
    // other tags
    matches = this.getMatches(result, this.regexes.sum);
    for (i = 0; i < matches.length; i++) {
        matchArr = matches[i];
        sum = 0;
        sumParent = this.getValue(data, matchArr[1]);
        for (j = 0; j < sumParent.length; j++) {
            sum += Number(this.getValue(sumParent[j], matchArr[2]));
        }
        result = result.replace(matchArr[0], sum);
    }
    // process conditional tags
    for (k in this.conditionals) {
        if (this.conditionals.hasOwnProperty(k)) {
            regex = new RegExp(this.regexes.cond.replace(/%%/g, k));
            matches = this.getMatches(result, regex);
            for (i = 0; i < matches.length; i++) {
                matchArr = matches[i];
                // if condition is fulfilled, strip tags
                if (this.conditionals[k](this.getValue(data, matchArr[1]))) {
                    result = result.replace(matchArr[0], matchArr[2]);
                } else {
                    // otherwise, remove data
                    result = result.replace(matchArr[0], "");
                }
            }
        }
    }
    matches = this.getMatches(result, this.regexes.variable);
    for (i = 0; i < matches.length; i++) {
        matchArr = matches[i];
        variable = matchArr[1];
        try {
            varVal = this.getValue(data, variable);
        } catch (e) {
            continue;
        }
        repl = "{{ " + variable + " }}";
        result = result.replace(repl, varVal);
    }
    return result;
};