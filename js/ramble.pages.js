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
                        row.append('<td><h1>' + forum.name + '</h1><br />' + forum.description + '</td>');
                        row.append('<td>' + forum.num_threads + '</td>');
                        if (lastp === null) {
                            row.append('<td>No posts in this forum</td>');
                        } else {
                            row.append('<td>by <a>' + lastp.uname + '</a><br /><span class="date">' + lastp.date + '</span></td>');
                        }
                        tbody.append(row);

                        thread_count += Number(forum.num_threads);
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
        var html = $('<div id="group_ordering"></div>');

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

    load: function (mode, element, options) {
        "use strict";
        switch (mode) {
        case "forums":
            $(element).html(Pages.forums());
            break;
        case "threads":
            $(element).html(Pages.threads(options));
            break;
        case "group_order":
            $(element).html(Pages.group_order());
            break;
        default:
            break;
        }
    }
};