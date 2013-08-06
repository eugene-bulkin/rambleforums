/*jslint browser: true, devel: true, plusplus: true, indent: 4, unparam: true */
/*globals $: false, Pages: false, Config: false, Login: false */
var Pages = {
    forums: function () {
        "use strict";
        var html = $('<div id="forums"></div>');

        $.ajax({
            url: "db.php?query=forums",
            type: "POST",
            dataType: "json",
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var i, j,
                    grp_ord = data.group_order,
                    frm_ord = data.forum_order,
                    fgrp, ord, table, tbody, thread_count,
                    row, forum, lastp;
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // process forum groups
                for (i = 0; i < grp_ord.length; i++) {
                    fgrp = data.forum_groups[grp_ord[i]];
                    ord = frm_ord[fgrp.id];
                    table = $("<table>");
                    tbody = $("<tbody>");
                    thread_count = 0;
                    table.addClass("list").attr("id", "fg" + fgrp.id);
                    table.attr("cellspacing", "0");
                    table.append("<caption>" + fgrp.name + "</caption>");
                    table.append("<thead><tr><th>Forum</th><th>Threads</th><th>Last Post</th></tr></thead>");
                    // add forum list
                    for (j = 0; j < ord.length; j++) {
                        row = $('<tr class="forum">');
                        forum = fgrp.forums[ord[j]];
                        lastp = forum.last_post;
                        row.append('<td><h1><a>' + forum.name + '</a></h1><br />' + forum.description + '</td>');

                        row.append('<td>' + forum.num_threads + '</td>');
                        if (lastp === null) {
                            row.append('<td>No posts in this forum</td>');
                        } else {
                            row.append('<td>by <a>' + lastp.uname + '</a><br /><span class="date">' + lastp.date + '</span></td>');
                        }
                        tbody.append(row);

                        thread_count += Number(forum.num_threads);

                        // bind forum to go to thread list
                        row.find('h1 a').on('click', null, forum.id, function (e) {
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

    threads: function (options) {
        "use strict";
        var html = $('<div id="threads"></div>'),
            defaults = {
                page: 1,
                pp: 5,
                forum_id: 1
            },
            opts = $.extend(defaults, options);
        $.ajax({
            url: "db.php",
            data: {
                query: "threads",
                data: JSON.stringify(opts)
            },
            dataType: "json",
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var i,
                    table, tbody, forum, row, pagination,
                    tfoot, pages, pagearr, temparr, li, pagelink, linktext;
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // back to forum list
                html.append('<div class="backlink"><a>< Go Back to Forums</a></div>');
                $('.backlink a').on('click', function () {
                    Pages.load("forums", "#page");
                });
                // build thread list
                table = $("<table>");
                tbody = $("<tbody>");
                tfoot = $("<tfoot>");
                forum = data.forum;

                table.addClass("list").attr('id', 'forum').attr('cellspacing', '0');
                table.append("<caption>" + forum.name + "</caption>");
                table.append("<thead><tr><th>Thread</th><th>Author</th><th>Replies</th><th>Last Post</th></tr></thead>");

                $(data.threads).each(function () {
                    row = $('<tr class="thread">');
                    row.append('<td><a class="thread_link">' + this.title + "</a></td>");
                    row.append("<td><a>" + this.uname + "</a></td>");
                    row.append("<td>" + this.posts + "</td>");
                    // if there is a last post, say so; else it is the thread itself
                    if (this.last_post !== null) {
                        row.append('<td>by <a>' + this.last_post.uname + '</a><br /><span class="date">' + this.last_post.date + '</span></td>');
                    } else {
                        row.append('<td>by <a>' + this.uname + '</a><br /><span class="date">' + this.date + '</span></td>');
                    }

                    tbody.append(row);

                    row.find('.thread_link').on('click', null, this.id, function (e) {
                        Pages.load("thread", "#page", {
                                thread_id: e.data
                        });
                    });
                });

                table.append(tbody);

                tfoot.append('<tr></tr>');
                pages = $('<td colspan="4"><ul id="pagelinks"></ul></td>');

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
                $(pagearr).each(function (i) {
                    switch (i) {
                    case 0: // first link
                        linktext = "<<";
                        break;
                    case (pagearr.length - 1): // last link
                        linktext = ">>";
                        break;
                    default:
                        linktext = this;
                        break;
                    }
                    li = $('<li>');
                    if (this !== opts.page) {
                        pagelink = $('<a id="page' + this + '">' + linktext + '</a>');
                        pagelink.on('click', null, [this, opts.forum_id], function (e) {
                            Pages.load("threads", "#page", {
                                page: e.data[0],
                                forum_id: e.data[1]
                            });
                        });
                    } else {
                        pagelink = $('<span>' + linktext + '</span>');
                    }
                    li.append(pagelink);
                    pages.children('ul').append(li);
                });

                tfoot.children('tr').append(pages);
                table.append(tfoot);

                html.append(table);
            }
        });

        return html;
    },

    group_order: function () {
        "use strict";
        var html = $('<div id="group_order"></div>');

        $.ajax({
            url: "db.php?query=forums",
            type: "POST",
            dataType: "json",
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var fgrps = $('<div id="forum_groups">'),
                    i,
                    j,
                    grp_ord = data.group_order,
                    frm_ord = data.forum_order,
                    wClasses = "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all",
                    fgrp,
                    ord,
                    div,
                    ful,
                    forum,
                    li;
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // process forum groups
                for (i = 0; i < grp_ord.length; i++) {
                    fgrp = data.forum_groups[grp_ord[i]];
                    ord = frm_ord[fgrp.id];
                    div = $('<div class="fgroup">');
                    ful = $('<ul class="forumSortable">');
                    div.attr('id', 'fg' + fgrp.id);
                    div.append('<div class="fgname"><span>' + fgrp.name + '</span></div>');
                    console.log(ord, fgrp.forums);
                    for (j = 0; j < ord.length; j++) {
                        forum = fgrp.forums[ord[j]];
                        li = $('<li>');
                        li.addClass("ui-button ui-widget ui-state-default ui-button-text-only");
                        li.attr('id', 'f' + forum.id);
                        li.text(forum.name);
                        ful.append(li);
                    }
                    div.append(ful);
                    fgrps.append(div);
                }

                // add sortability
                fgrps.sortable({
                    update: Config.processGroupOrder,
                    axis: 'x',
                    cursor: 'move',
                    distance: 50,
                    revert: true,
                    tolerance: "pointer"
                }).disableSelection();
                html.append(fgrps);

                $(".fgroup").addClass(wClasses);
                $(".forumSortable").sortable({
                    connectWith: ".forumSortable",
                    update: Config.processForumOrder,
                    cursor: 'move',
                    distance: 15,
                    opacity: 0.9,
                    revert: true
                }).disableSelection();
            }
        });

        return html;
    },

    thread: function (options) {
        "use strict";
        var html = $('<div id="thread"></div>'),
            defaults = {
                page: 1,
                pp: 5,
                thread_id: 1
            },
            opts = $.extend(defaults, options);
        $.ajax({
            url: "db.php",
            data: {
                query: "thread",
                data: JSON.stringify(opts)
            },
            dataType: "json",
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var thread_body = $('<div id="thread_body">'),
                    posts = $('<div id="posts">'),
                    user_box, user_table,
                    pages, pagearr, temparr,
                    linktext, li, pagelink;
                // remove loading gif
                html.html('');
                html.attr('style', null);
                //stfsda
                html.append('<div class="backlink">In <a>' + data.fname + '</a></div>');
                $(".backlink a").on('click', null, data.fid, function (e) {
                    Pages.load("threads", "#page", {
                        forum_id: e.data
                    });
                });
                // thread first post
                // create user box
                user_box = $('<div class="user_box">');
                user_box.append('<span class="username">' + data.uname + '</span>');
                user_table = $('<table class="user_data">');
                user_table.append('<tr><th>Member since</th><td>' + data.ujoined + '</td></tr>');
                user_table.append('<tr><th>Total posts</th><td>' + data.uposts + '</td></tr>');
                user_box.append(user_table);
                thread_body.append(user_box);
                // create post body
                thread_body.append('<div class="post_title"><span>' + data.title + '</span></div>');
                thread_body.append('<div class="post_body"><span>' + data.body + '</span></div>');
                thread_body.append('<div class="post_foot"><span class="date_posted">Posted on ' + data.date + '</span></div>');
                html.append(thread_body);
                // get posts
                if(data.posts.length > 0) {
                    $(data.posts).each(function () {
                        var post = $('<div class="post">'),
                            user_box, user_table;
                        // create user box
                        user_box = $('<div class="user_box">');
                        user_box.append('<span class="username">' + this.uname + '</span>');
                        user_table = $('<table class="user_data">');
                        user_table.append('<tr><th>Member since</th><td>' + this.ujoined + '</td></tr>');
                        user_table.append('<tr><th>Total posts</th><td>' + this.uposts + '</td></tr>');
                        user_box.append(user_table);
                        post.append(user_box);
                        // create post body
                        post.append('<div class="post_body"><span>' + this.body + '</span></div>');
                        post.append('<div class="post_foot"><span class="date_posted">Posted on ' + this.date + '</span></div>');
                        posts.append(post);
                    });

                    // page links
                    pages = $('<div><ul id="pagelinks"></ul></div>');
                    pagearr = [1, data.pages]; // initial pages
                    if (opts.page === 1) {
                        temparr = [1, 2, 3];
                    } else if (opts.page === data.pages) {
                        temparr = [data.pages - 2, data.pages - 1, data.pages];
                    } else {
                        temparr = [opts.page - 1, opts.page, opts.page + 1];
                    }
                    pagearr.splice(1, 0, temparr[0], temparr[1], temparr[2]); // last page
                    if (data.pages <= 3) {
                        pagearr = [1];
                        pagearr.push(1);
                        for (i = 2; i <= data.pages; i++) {
                            pagearr.push(i);
                        }
                        pagearr.push(data.pages);
                    }
                    $(pagearr).each(function (i) {
                        switch (i) {
                        case 0: // first link
                            linktext = "<<";
                            break;
                        case (pagearr.length - 1): // last link
                            linktext = ">>";
                            break;
                        default:
                            linktext = this;
                            break;
                        }
                        li = $('<li>');
                        if (this !== opts.page) {
                            pagelink = $('<a id="page' + this + '">' + linktext + '</a>');
                            pagelink.on('click', null, [this, opts.thread_id], function (e) {
                                Pages.load("thread", "#page", {
                                    page: e.data[0],
                                    thread_id: e.data[1]
                                });
                            });
                        } else {
                            pagelink = $('<span>' + linktext + '</span>');
                        }
                        li.append(pagelink);
                        pages.children('ul').append(li);
                    });

                    posts.append(pages);

                    html.append(posts);
                }
            }
        });

        return html;
    },

    load: function (mode, element, options, firstLoad, noHistory) {
        "use strict";

        firstLoad = firstLoad || false;
        noHistory = noHistory || false;
        var state = {'mode': mode, 'element': element, 'options': options, 'rambleforums': true};

        switch (mode) {
        case "forums":
            $(element).html(Pages.forums());
            break;
        case "threads":
            $(element).html(Pages.threads(options));
            break;
        case "thread":
            $(element).html(Pages.thread(options));
            break;
        case "group_order":
            $(element).html(Pages.group_order());
            break;
        default:
            break;
        }

        // add to history
        if(!noHistory) {
            if(!firstLoad) {
                history.pushState(state);
            } else {
                history.replaceState(state);

                $(window).on('popstate', Pages.processHistory);
            }
        }
    },

    processHistory: function (event) {
        var s = event.originalEvent.state;
        if(s) {
            Pages.load(s.mode, s.element, s.options, false, true);
        }
    }
};