RAMBLE.Pages = (function ($) {
    "use strict";
    var module = {};

    function page_links(cur_page, num_pages, mode, id) {
        var pagearr, temparr, i,
            li, linktext, pagelink,
            pageBinding;
        // page links
        pagearr = [1, num_pages]; // initial pages
        if (cur_page === 1) {
            temparr = [1, 2, 3];
        } else if (cur_page === num_pages) {
            temparr = [num_pages - 2, num_pages - 1, num_pages];
        } else {
            temparr = [cur_page - 1, cur_page, cur_page + 1];
        }
        pagearr.splice(1, 0, temparr[0], temparr[1], temparr[2]); // last page
        if (num_pages <= 3) {
            pagearr = [1];
            pagearr.push(1);
            for (i = 2; i <= num_pages; i += 1) {
                pagearr.push(i);
            }
            pagearr.push(num_pages);
        }
        $(pagearr).each(function (i) {
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
            if (this !== cur_page) {
                pagelink = $('<a id="page' + this + '">' + linktext + '</a>');
                if (mode === "forum") {
                    pageBinding = function (e) {
                        RAMBLE.Pages.load("threads", "#page", {
                            page: e.data[0],
                            forum_id: e.data[1]
                        });
                    };
                } else {
                    pageBinding = function (e) {
                        RAMBLE.Pages.load("thread", "#page", {
                            page: e.data[0],
                            thread_id: e.data[1]
                        });
                    };
                }
                pagelink.on('click', null, [this, id], pageBinding);
            } else {
                pagelink = $('<span>' + linktext + '</span>');
            }
            li.append(pagelink);
            $('#pagelinks').append(li);
        });
    }

    function forums() {
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
            each: {}
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
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var i, j,
                    grp_ord = data[0].group_order,
                    frm_ord = data[0].forum_order,
                    fgrps = {}, forums = {},
                    fgrp, ord, forum,
                    template, template_data;
                // turn forum groups and forums into associative arrays
                $(data[1]).each(function () {
                    fgrps[this.id] = this;
                });
                $(data[2]).each(function () {
                    forums[this.id] = this;
                });
                // remove loading gif
                html.html('');
                html.attr('style', null);
                template = new RAMBLE.Template.Template("forums");
                template_data = {
                    fg: []
                };
                for (i = 0; i < grp_ord.length; i += 1) {
                    fgrp = fgrps[grp_ord[i]];
                    fgrp.forums = [];
                    fgrp.total_threads = 0;
                    ord = frm_ord[fgrp.id];
                    for (j = 0; j < ord.length; j += 1) {
                        forum = forums[ord[j]];
                        fgrp.total_threads += forum.num_threads;
                        fgrp.forums.push(forum);
                    }
                    template_data.fg.push(fgrp);
                }
                html.html(template.apply(template_data));
                // process bindings
                // forum links
                $('.forum_link').on('click', function () {
                    RAMBLE.Pages.load("threads", "#page", {
                        forum_id: this.id.replace("flid", "")
                    });
                });
                // last post links
                $('.lp_link').on('click', function () {
                    RAMBLE.Pages.load("thread", "#page", {
                        thread_id: this.id.replace("lpid", "")
                    });
                });
                // user links
                $('.user_link').on('click', function () {
                    RAMBLE.Pages.load("user", "#page", {
                        user_id: $(this).attr('href').replace("user_", "")
                    });
                    return false;
                });
            }
        });

        return html;
    }

    function threads(options) {
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
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var forum = data[0],
                    template;
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new RAMBLE.Template.Template("thread_list");
                html.html(template.apply({
                    forum: data[0],
                    threads: data[1]
                }));

                // process bindings
                $('.backlink a').on('click', function () {
                    RAMBLE.Pages.load("forums", "#page");
                });

                $('.thread_link').on('click', function () {
                    RAMBLE.Pages.load("thread", "#page", {
                        thread_id: this.id.replace("tlid", "")
                    });
                });

                // user links
                $('.user_link').on('click', function () {
                    RAMBLE.Pages.load("user", "#page", {
                        user_id: $(this).attr('href').replace("user_", "")
                    });
                    return false;
                });

                page_links(opts.page, forum.pages, "forum", opts.forum_id);

                $("#new_thread").bind('click', function () {
                    $("#page").append('<div id="dialog">');
                    var thread_template = new RAMBLE.Template.Template("new_thread");
                    $("#dialog").html(thread_template.apply({ forum: data[0] }))
                        .dialog({
                            autoOpen: false,
                            modal: true,
                            draggable: false,
                            width: 700,
                            height: 575,
                            title: "New Thread",
                            buttons: {
                                "Submit": function () {
                                    var form = $(this).children('form');
                                    form.ajaxSubmit({
                                        dataType: "json",
                                        type: "POST",
                                        url: "post.php?mode=new_thread",
                                        success: function (data) {
                                            if (data.success === true) {
                                                $('#dialog').dialog("close");

                                                RAMBLE.Pages.load("thread", "#page", {
                                                    page: 1,
                                                    thread_id: data.thread_id
                                                });
                                            } else {
                                                console.log(data);
                                            }
                                        }
                                    });
                                }
                            },
                            close: function () {
                                $("#dialog").dialog("destroy").remove();
                            }
                        }).dialog("open");
                });
            }
        });

        return html;
    }

    function thread(options) {
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
            order: ["date_posted", "ASC"],
            paginate: [opts.page, opts.pp]
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var template,
                    thread = data[0];
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new RAMBLE.Template.Template("thread");
                html.html(template.apply($.extend(thread, {
                    posts: data[1],
                    has_posts: (data[1].length > 0)
                })));
                // process bindings
                $(".backlink a").on('click', null, thread.forum.id, function (e) {
                    RAMBLE.Pages.load("threads", "#page", {
                        forum_id: e.data
                    });
                });

                // user links
                $('.user_link').on('click', function () {
                    RAMBLE.Pages.load("user", "#page", {
                        user_id: $(this).attr('href').replace("user_", "")
                    });
                    return false;
                });

                page_links(opts.page, thread.pages, "thread", opts.thread_id);

                $("#new_reply").bind('click', function () {
                    $("#page").append('<div id="dialog">');
                    var reply_template = new RAMBLE.Template.Template("new_reply");
                    $("#dialog").html(reply_template.apply({ thread: data[0] }))
                        .dialog({
                            autoOpen: false,
                            modal: true,
                            draggable: false,
                            width: 700,
                            height: 575,
                            title: "New Reply",
                            buttons: {
                                "Submit": function () {
                                    var form = $(this).children('form');
                                    form.ajaxSubmit({
                                        dataType: "json",
                                        type: "POST",
                                        url: "post.php?mode=new_reply",
                                        success: function (data) {
                                            if (data.success === true) {
                                                $('#dialog').dialog("close");

                                                RAMBLE.Pages.load("thread", "#page", {
                                                    page: 1,
                                                    thread_id: data.thread_id
                                                });
                                            } else {
                                                console.log(data);
                                            }
                                        }
                                    });
                                }
                            },
                            close: function () {
                                $("#dialog").dialog("destroy").remove();
                            }
                        }).dialog("open");
                });
            }
        });

        return html;
    }

    function userpage(options) {
        var html = $('<div id="userpage"></div>'),
            defaults = { },
            opts = $.extend(defaults, options),
            sql = [];
        sql[0] = {
            type: "indiv",
            query: "users",
            keys: ["id", "username", "date_joined"],
            each: {
                "user_info": ["email"],
                "user_lastlogin": ["lastlogin"]
            },
            where: ["id", opts.user_id]
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var template,
                    user = data[0];
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new RAMBLE.Template.Template("user");
                html.html(template.apply(user));
            }
        });

        return html;
    }

    function editprofile(options) {
        var html = $('<div id="editprofile" class="panel_wrapper"></div>'),
            defaults = { },
            opts = $.extend(defaults, options),
            sql = [];
        sql[0] = {
            type: "indiv",
            query: "users",
            keys: ["id", "username"],
            each: {
                "user_info": ["email"]
            },
            where: ["id", opts.user_id]
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function (xhr) {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
                $.ajax({
                    url: "verify.php",
                    data: {
                        "id": opts.user_id,
                        "process": "edit_profile"
                    },
                    dataType: "json",
                    type: "post",
                    success: function (data) {
                        // if we don't have permission, stop request
                        if (!data) {
                            xhr.abort();
                        }
                    }
                });
            },
            success: function (data) {
                var template,
                    user = data[0];
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new RAMBLE.Template.Template("editprofile");
                html.html(template.apply(user));

                $("#profsub").on('click', function () {
                    var form = $("#profile_form");
                    form.ajaxSubmit({
                        dataType: "json",
                        type: "POST",
                        url: "panel.php?mode=user",
                        success: function (data) {
                            if (data === true) { // success!
                                $("#results").html("Profile successfully updated!");
                            } else {
                                console.log(data);
                            }
                        }
                    });
                    return false;
                });
            }
        });

        return html;
    }

    function adminpanel() {
        var html = $('<div id="admin_panel" class="panel_wrapper"></div>'),
            sql = [];
        // get forum information
        sql[0] = {
            type: "indiv",
            query: "config",
            keys: ["ramble.forum_name"]
        };
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function (xhr) {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
                // verify admin
                $.ajax({
                    url: "verify.php",
                    data: {
                        "process": "header",
                        "vmodes": "admin_panel"
                    },
                    dataType: "json",
                    type: "post",
                    success: function (data) {
                        // if we don't have permission, stop request
                        if (!data.admin_panel) {
                            xhr.abort();
                        }
                    }
                });
            },
            success: function (data) {
                var template,
                    forum = data[0];
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // apply template
                template = new RAMBLE.Template.Template("adminpanel");
                html.html(template.apply(forum));

                $("#grpord").on('click', function () {
                    RAMBLE.Pages.load("group_order", "#page");
                    return false;
                });

                $("#adminsub").on('click', function () {
                    var form = $("#admin_form");
                    form.ajaxSubmit({
                        dataType: "json",
                        type: "POST",
                        url: "panel.php?mode=admin",
                        success: function (data) {
                            if (data === true) { // success!
                                $("#results").html("Forums successfully updated!");
                                $.ajax({
                                    url: "verify.php",
                                    data: {
                                        "process": "header",
                                        "vmodes": "logged_in;admin_panel"
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (data) {
                                        RAMBLE.Pages.load("header", "#header", {user_id: data.logged_in, admin_panel: data.admin_panel, from_admin: true}, false, true);
                                    }
                                });
                            } else {
                                console.log(data);
                            }
                        }
                    });
                    return false;
                });
            },
            error: function (xhr, status) {
                if (status === "abort") {
                    html.html('You do not have permission to access this page.');
                }
            }
        });

        return html;
    }

    function group_order() {
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
            each: {}
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
            beforeSend: function () {
                // add loading gif
                html.css('text-align', 'center');
                html.html('<img src="images/loading.gif" />');
            },
            success: function (data) {
                var fghtml = $('<div id="forum_groups">'),
                    i,
                    j,
                    grp_ord = data[0].group_order,
                    frm_ord = data[0].forum_order,
                    wClasses = "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all",
                    fgrps = {},
                    forums = {},
                    fgrp,
                    ord,
                    div,
                    ful,
                    forum,
                    li;
                // turn forum groups and forums into associative arrays
                $(data[1])
                    .each(function () {
                        fgrps[this.id] = this;
                    });
                $(data[2])
                    .each(function () {
                        forums[this.id] = this;
                    });
                // remove loading gif
                html.html('');
                html.attr('style', null);
                // process forum groups
                for (i = 0; i < grp_ord.length; i += 1) {
                    fgrp = fgrps[grp_ord[i]];
                    ord = frm_ord[fgrp.id];
                    div = $('<div class="fgroup">');
                    ful = $('<ul class="forumSortable">');
                    div.attr('id', 'fg' + fgrp.id);
                    div.append('<div class="fgname"><span>' + fgrp.name + '</span></div>');
                    for (j = 0; j < ord.length; j += 1) {
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
                    update: RAMBLE.Config.processGroupOrder,
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
                        update: RAMBLE.Config.processForumOrder,
                        cursor: 'move',
                        distance: 15,
                        opacity: 0.9,
                        revert: true
                    })
                    .disableSelection();

                html.append('<div id="loading" style="text-align: center"></div>');
            }
        });

        return html;
    }

    function header(options) {
        var html = $('#header'),
            defaults = { },
            opts = $.extend(defaults, options),
            sql = [],
            logged_in = (opts.user_id !== false);
        // get forum name
        sql[0] = {
            type: "indiv",
            query: "config",
            keys: ["ramble.forum_name"]
        };
        // logged in
        if (logged_in) {
            sql[1] = {
                type: "indiv",
                query: "users",
                keys: ["id", "username"],
                each: {},
                where: ["id", opts.user_id]
            };
        }
        $.ajax({
            url: "db.php",
            data: {
                options: JSON.stringify(sql)
            },
            dataType: "json",
            beforeSend: function () {
                if (opts.login === true) {
                    // add loading gif
                    $("#userinfo").css('text-align', 'center');
                    $("#userinfo").html('<img src="images/loading.gif" />');
                }
            },
            success: function (data) {
                var template,
                    forum_name = data[0].forum_name;
                // cancel out loading gif
                $("#userinfo").attr('style', null);
                // apply template
                template = new RAMBLE.Template.Template("header");
                html.html(template.apply({
                    forum_name: forum_name,
                    user: data[1] || false,
                    admin: opts.admin_panel || false
                }));

                RAMBLE.Login.init();

                $('#title').find('a').on('click', function () {
                    RAMBLE.Pages.load("forums", "#page");
                });

                // if we came from admin panel, do nothing
                if (!opts.from_admin) {
                    // page already loaded! that is, we just refreshed
                    if (history.state && history.state.rambleforums) {
                        RAMBLE.Pages.load(history.state.mode, history.state.element, history.state.options, true);
                    } else {
                        RAMBLE.Pages.load("forums", "#page", null, true);
                    }
                }

                // bind user links
                $('.user_link').on('click', function () {
                    RAMBLE.Pages.load("user", "#page", {
                        user_id: $(this).attr('href').replace("user_", "")
                    });
                    return false;
                });
                $(".edit_prof").on('click', function () {
                    RAMBLE.Pages.load("editprofile", "#page", {
                        user_id: $(this).attr('id').replace("ep_", "")
                    });
                });
                $(".admin_link").on('click', function () {
                    RAMBLE.Pages.load("adminpanel", "#page");
                });
            }
        });

        return html;
    }

    function processHistory(event) {
        var s = event.originalEvent.state;
        if (s) {
            RAMBLE.Pages.load(s.mode, s.element, s.options, false, true);
        }
    }

    module.load = function (mode, element, options, firstLoad, noHistory) {
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
            $(element).html(forums());
            break;
        case "threads":
            $(element).html(threads(options));
            break;
        case "thread":
            $(element).html(thread(options));
            break;
        case "user":
            $(element).html(userpage(options));
            break;
        case "editprofile":
            $(element).html(editprofile(options));
            break;
        case "adminpanel":
            $(element).html(adminpanel());
            break;
        case "group_order":
            $(element).html(group_order());
            break;
        case "header":
            header(options);
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

                $(window).on('popstate', processHistory);
            }
        }
    };

    return module;
}(jQuery));