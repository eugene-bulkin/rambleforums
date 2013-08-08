/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
var Pages = {
    forums: function() {
        "use strict";
        var html = $('<div id="forums"></div>'),
            sql = [];
        // get group and forum orders
        sql[0] = {
            type: "indiv",
            query: "config",
            keys: ["forum.group_order", "forum.forum_order"]
        };
        // get forum groups
        sql[1] = {
            type: "list",
            query: "forum_groups",
            keys: ["id", "name"],
            each: {},
        };
        // get forums
        sql[2] = {
            type: "list",
            query: "forums",
            keys: ["id", "name", "description", "num_threads"],
            each: {
                "last_post": ["id", "date", "uid", "uname"]
            }
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function() {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function(data) {
                var i, j,
                    grp_ord = data[0].group_order,
                    frm_ord = data[0].forum_order,
                    fgrps = {}, forums = {},
                    fgrp, ord, table, tbody, thread_count,
                    row, forum, lastp;
                // turn forum groups and forums into associative arrays
                $(data[1])
                    .each(function() {
                        fgrps[this.id] = this;
                    });
                $(data[2])
                    .each(function() {
                        forums[this.id] = this;
                    });
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // process forum groups
                for (i = 0; i < grp_ord.length; i++) {
                    fgrp = fgrps[grp_ord[i]];
                    ord = frm_ord[fgrp.id];
                    table = $("<table>");
                    tbody = $("<tbody>");
                    thread_count = 0;
                    table.addClass("list")
                        .attr("id", "fg" + fgrp.id);
                    table.attr("cellspacing", "0");
                    table.append("<caption>" + fgrp.name + "</caption>");
                    table.append("<thead><tr><th>Forum</th><th>Threads</th><th>Last Post</th></tr></thead>");
                    // add forum list
                    for (j = 0; j < ord.length; j++) {
                        row = $('<tr class="forum">');
                        forum = forums[ord[j]];
                        lastp = forum.last_post;
                        row.append('<td><h1><a>' + forum.name + '</a></h1><br />' + forum.description + '</td>');

                        row.append('<td>' + forum.num_threads + '</td>');
                        if (lastp === null) {
                            row.append('<td>No posts in this forum</td>');
                        } else {
                            row.append('<td>by <a>' + lastp.user.username + '</a><br /><span class="date">' + lastp.last_date_posted + '</span></td>');
                        }
                        tbody.append(row);

                        thread_count += Number(forum.num_threads);

                        // bind forum to go to thread list
                        row.find('h1 a')
                            .on('click', null, forum.id, function(e) {
                                Pages.load("threads", "#page", {
                                    forum_id: e.data
                                });
                            });
                    }
                    table.append(tbody);

                    table.append('<tfoot><tr><td colspan="3">Total threads: ' + thread_count + '</td></tr></tfoot>');

                    html.append(table);
                }
            }
        });

        return html;
    },

    threads: function(options) {
        "use strict";
        var html = $('<div id="threads"></div>'),
            defaults = {
                page: 1,
                pp: 5,
                forum_id: 1
            },
            opts = $.extend(defaults, options),
            sql = [];
        // get info about the forum itself
        sql[0] = {
            type: "indiv",
            query: "forums",
            keys: ["id", "name", "pages"],
            each: {},
            where: ["id", opts.forum_id],
            order: false,
            paginate: [opts.page, opts.pp]
        };
        // actual thread list sql
        sql[1] = {
            type: "list",
            query: "threads",
            keys: ["id", "title", "date_posted", "num_replies"],
            each: {
                "users": ["id", "username"],
                "last_post": ["id", "date", "uid", "uname"]
            },
            where: ["forum_id", opts.forum_id],
            order: ["date_posted", "DESC"],
            paginate: [opts.page, opts.pp]
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function() {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function(data) {
                var i,
                    forum = data[0], row, pagination,
                    pagearr, temparr, li, pagelink, linktext,
                    template;
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new Template("thread_list");
                html.html(template.apply({forum: data[0], threads: data[1]}));

                // process bindings
                $('.backlink a').on('click', function() {
                    Pages.load("forums", "#page");
                });

                $('.thread_link').on('click', function() {
                    Pages.load("thread", "#page", {
                        thread_id: this.id.replace("tlid", "")
                    });
                });

                // page links
                pagearr = [1, forum.pages]; // initial pages
                if (opts.page === 1) {
                    temparr = [1, 2, 3];
                } else if (opts.page === forum.pages) {
                    temparr = [forum.pages - 2, forum.pages - 1, forum.pages];
                } else {
                    temparr = [opts.page - 1, opts.page, opts.page + 1];
                }
                pagearr.splice(1, 0, temparr[0], temparr[1], temparr[2]); // last page
                if (forum.pages <= 3) {
                    pagearr = [1];
                    pagearr.push(1);
                    for (i = 2; i <= forum.pages; i++) {
                        pagearr.push(i);
                    }
                    pagearr.push(forum.pages);
                }
                $(pagearr).each(function(i) {
                    switch (i) {
                        case 0:
                            // first link
                            linktext = "<<";
                            break;
                        case (pagearr.length - 1):
                            // last link
                            linktext = ">>";
                            break;
                        default:
                            linktext = this;
                            break;
                    }
                    li = $('<li>');
                    if (this !== opts.page) {
                        pagelink = $('<a id="page' + this + '">' + linktext + '</a>');
                        pagelink.on('click', null, [this, opts.forum_id], function(e) {
                            Pages.load("threads", "#page", {
                                page: e.data[0],
                                forum_id: e.data[1]
                            });
                        });
                    } else {
                        pagelink = $('<span>' + linktext + '</span>');
                    }
                    li.append(pagelink);
                    $('#pagelinks').append(li);
                });
            }
        });

        return html;
    },

    group_order: function() {
        "use strict";
        var html = $('<div id="group_order"></div>'),
            sql = [];
        // get group and forum orders
        sql[0] = {
            type: "indiv",
            query: "config",
            keys: ["forum.group_order", "forum.forum_order"]
        };
        // get forum groups
        sql[1] = {
            type: "list",
            query: "forum_groups",
            keys: ["id", "name"],
            each: {},
        };
        // get forums
        sql[2] = {
            type: "list",
            query: "forums",
            keys: ["id", "name"],
            each: {}
        };

        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function() {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function(data) {
                var fghtml = $('<div id="forum_groups">'),
                    i,
                    j,
                    grp_ord = data[0].group_order,
                    frm_ord = data[0].forum_order,
                    wClasses = "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all",
                    fgrps = {}, forums = {},
                    fgrp,
                    ord,
                    div,
                    ful,
                    forum,
                    li;
                // turn forum groups and forums into associative arrays
                $(data[1])
                    .each(function() {
                        fgrps[this.id] = this;
                    });
                $(data[2])
                    .each(function() {
                        forums[this.id] = this;
                    });
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // process forum groups
                for (i = 0; i < grp_ord.length; i++) {
                    fgrp = fgrps[grp_ord[i]];
                    ord = frm_ord[fgrp.id];
                    div = $('<div class="fgroup">');
                    ful = $('<ul class="forumSortable">');
                    div.attr('id', 'fg' + fgrp.id);
                    div.append('<div class="fgname"><span>' + fgrp.name + '</span></div>');
                    for (j = 0; j < ord.length; j++) {
                        forum = forums[ord[j]];
                        li = $('<li>');
                        li.addClass("ui-button ui-widget ui-state-default ui-button-text-only");
                        li.attr('id', 'f' + forum.id);
                        li.text(forum.name);
                        ful.append(li);
                    }
                    div.append(ful);
                    fghtml.append(div);
                }

                // add sortability
                fghtml.sortable({
                    update: Config.processGroupOrder,
                    axis: 'x',
                    cursor: 'move',
                    distance: 50,
                    revert: true,
                    tolerance: "pointer"
                })
                    .disableSelection();
                html.append(fghtml);

                $(".fgroup")
                    .addClass(wClasses);
                $(".forumSortable")
                    .sortable({
                        connectWith: ".forumSortable",
                        update: Config.processForumOrder,
                        cursor: 'move',
                        distance: 15,
                        opacity: 0.9,
                        revert: true
                    })
                    .disableSelection();
            }
        });

        return html;
    },

    thread: function(options) {
        "use strict";
        var html = $('<div id="thread"></div>'),
            defaults = {
                page: 1,
                pp: 5,
                thread_id: 1
            },
            opts = $.extend(defaults, options),
            sql = [];
        // get info about the thread itself
        sql[0] = {
            type: "indiv",
            query: "threads",
            keys: ["id", "title", "body", "date_posted", "pages"],
            each: {
                "users": ["id", "username", "date_joined", "num_posts"],
                "forums": ["id", "name"]
            },
            where: ["id", opts.thread_id],
            order: false,
            paginate: [opts.page, opts.pp]
        };
        // actual post list sql
        sql[1] = {
            type: "list",
            query: "posts",
            keys: ["id", "body", "date_posted"],
            each: {
                "users": ["id", "username", "date_joined", "num_posts"]
            },
            where: ["thread_id", opts.thread_id],
            order: ["date_posted", "DESC"],
            paginate: [opts.page, opts.pp]
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function() {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function(data) {
                var template, i,
                    pagearr, temparr,
                    linktext, li, pagelink,
                    thread = data[0];
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new Template("thread");
                html.html(template.apply($.extend(thread, {posts: data[1]})));
                // process bindings
                $(".backlink a").on('click', null, thread.forum.id, function(e) {
                    Pages.load("threads", "#page", {
                        forum_id: e.data
                    });
                });
                // page links
                pagearr = [1, thread.pages]; // initial pages
                if (opts.page === 1) {
                    temparr = [1, 2, 3];
                } else if (opts.page === thread.pages) {
                    temparr = [thread.pages - 2, thread.pages - 1, thread.pages];
                } else {
                    temparr = [opts.page - 1, opts.page, opts.page + 1];
                }
                pagearr.splice(1, 0, temparr[0], temparr[1], temparr[2]); // last page
                if (thread.pages <= 3) {
                    pagearr = [1];
                    pagearr.push(1);
                    for (i = 2; i <= thread.pages; i++) {
                        pagearr.push(i);
                    }
                    pagearr.push(thread.pages);
                }
                $(pagearr).each(function(i) {
                        switch (i) {
                            case 0:
                                // first link
                                linktext = "<<";
                                break;
                            case (pagearr.length - 1):
                                // last link
                                linktext = ">>";
                                break;
                            default:
                                linktext = this;
                                break;
                        }
                        li = $('<li>');
                        if (this !== opts.page) {
                            pagelink = $('<a id="page' + this + '">' + linktext + '</a>');
                            pagelink.on('click', null, [this, opts.thread_id], function(e) {
                                Pages.load("thread", "#page", {
                                    page: e.data[0],
                                    thread_id: e.data[1]
                                });
                            });
                        } else {
                            pagelink = $('<span>' + linktext + '</span>');
                        }
                        li.append(pagelink);
                        $('#pagelinks').append(li);
                    });
            }
        });

        return html;
    },

    load: function(mode, element, options, firstLoad, noHistory) {
        "use strict";

        firstLoad = firstLoad || false;
        noHistory = noHistory || false;

        var state = {
            'mode': mode,
            'element': element,
            'options': options,
            'rambleforums': true
        };

        switch (mode) {
            case "forums":
                $(element)
                    .html(Pages.forums());
                break;
            case "threads":
                $(element)
                    .html(Pages.threads(options));
                break;
            case "thread":
                $(element)
                    .html(Pages.thread(options));
                break;
            case "group_order":
                $(element)
                    .html(Pages.group_order());
                break;
            default:
                break;
        }

        // add to history
        if (!noHistory) {
            if (!firstLoad) {
                history.pushState(state);
            } else {
                history.replaceState(state);

                $(window)
                    .on('popstate', Pages.processHistory);
            }
        }
    },

    processHistory: function(event) {
        var s = event.originalEvent.state;
        if (s) {
            Pages.load(s.mode, s.element, s.options, false, true);
        }
    }
};