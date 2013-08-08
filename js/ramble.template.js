/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
var Template = function (template) {
    this.template = template;
    this.template_data = null;

    this.regexes = {
        variable: /\{\{ ([\s\S]+?) \}\}/,
        each: /\{\{\{ each:(.+?) \}\}\}([\s\S]+?)\{\{\{ \/each \}\}\}/,
        cond: "{{{ %%:(.+?) }}}([\\\s\\\S]+?){{{ \/%% }}}",
    }

    this.conditionals = {
        notnull: function (val) { return (val !== null); },
        isnull: function (val) { return (val === null); },
        nonzero: function (val) { return (val > 0); }
    }

    $.ajax({
        url: "templates/" + this.template + ".html",
        dataType: "html",
        cache: false,
        async: false, // do not allow anything else to happen until template is loaded!
        success: function(data) {
            this.template_data = data;
        }.bind(this)
    });

    return this;
}

// from http://cwestblog.com/2011/11/14/javascript-snippet-regexp-prototype-clone/
RegExp.prototype.clone = function(options) {
    // If the options are not in string format...
    if(options + "" !== options) {
        // If the options evaluate to true, use the properties to construct
        // the flags.
        if(options) {
            options = (options.ignoreCase ? "i" : "")
                + (options.global ? "g" : "")
                + (options.multiline ? "m" : "")
                + (options.sticky ? "y" : "");
        }
        // If the options evaluate to false, use the current flags.
        else {
            options = (this + "").replace(/[\s\S]+\//, "");
        }
    }

    // Return the new regular expression, making sure to only include the
    // sticky flag if it is available.
    return new RegExp(this.source, options.replace("y", ("sticky" in /s/ ? "y" : "")));
};

Template.prototype.getMatches = function(search, regex) {
    var str = search, result = [];
    regex = regex.clone("");
    while((res = str.match(regex)) !== null) {
        result.push(res);
        str = str.substr(res.index + 1);
    }
    return result;
}

// Get value from data object with given key, following periods to
// go deeper into object
Template.prototype.getValue = function(data, key) {
    var keyS = key.split("."), val = data[keyS[0]],
        i;
    for(i = 1; i < keyS.length; i++) {
        val = val[keyS[i]];
    }
    return val;
}

Template.prototype.apply = function(data, td) {
    td = td || this.template_data;
    var matchArr, repl,
        eachD, eachRes,
        variable, varVal, i, j,
        k, regex,
        result = td,
        matches;
    // process each tag first because it has higher precedent
    matches = this.getMatches(result, this.regexes.each);
    for(i = 0; i < matches.length; i++) {
        matchArr = matches[i];
        eachD = this.getValue(data, matchArr[1]);
        eachRes = "";
        for(j = 0; j < eachD.length; j++) {
            eachRes += this.apply(eachD[j], matchArr[2]);
        }
        result = result.replace(matchArr[0], eachRes);
    }
    for(k in this.conditionals) {
        if(this.conditionals.hasOwnProperty(k)) {
            regex = new RegExp(this.regexes.cond.replace(/%%/g, k));
            matches = this.getMatches(result, regex);
            for(i = 0; i < matches.length; i++) {
                matchArr = matches[i];
                // if condition is fulfilled, strip tags
                if(this.conditionals[k](this.getValue(data, matchArr[1]))) {
                    result = result.replace(matchArr[0], matchArr[2]);
                }
                // otherwise, remove data
                else {
                    result = result.replace(matchArr[0], "");
                }
            }
        }
    }
    matches = this.getMatches(result, this.regexes.variable);
    for(i = 0; i < matches.length; i++) {
        matchArr = matches[i];
        variable = matchArr[1];
        try {
            varVal = this.getValue(data, variable);
        } catch(e) {
            continue;
        }
        repl = "{{ " + variable + " }}";
        result = result.replace(repl, varVal);
    }
    return result;
}