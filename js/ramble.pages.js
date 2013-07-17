var Pages = {
    forums: function () {
        var html = $('<div id="forums"></div>');

        $.ajax({
                url: "db.php?query=forums",
                type: "POST",
                dataType: "json",
                beforeSend: function () {
                    // add loading gif
                    html.css('text-align','center');
                    html.html('<img src="images/loading.gif" />');
                },
                success: function (data) {
                    var i, j,
                        grp_ord = data.group_order,
                        frm_ord = data.forum_order;
                    // remove loading gif
                    html.html('');
                    html.attr('style', null);
                    // process forum groups
                    for(i = 0; i < grp_ord.length; i++) {
                        var fgrp = data.forum_groups[grp_ord[i]],
                            ord = frm_ord[fgrp.id],
                            table = $("<table>"),
                            tbody = $("<tbody>"),
                            thread_count = 0;
                        table.addClass("list").attr("id", "fg" + fgrp.id);
                        table.attr("cellspacing", "0");
                        table.append("<caption>" + fgrp.name + "</caption>");
                        table.append("<thead><tr><th>Forum</th><th>Threads</th><th>Last Post</th></tr></thead>");
                        // add forum list
                        for(j = 0; j < ord.length; j++) {
                            var row = $('<tr class="forum">'),
                                forum = fgrp.forums[ord[j]],
                                lastp = forum.last_post;
                            row.append('<td><h1>' + forum.name + '</h1><br />' + forum.description + '</td>');
                            row.append('<td>' + forum.num_threads + '</td>');
                            if(lastp === null) {
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