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
                    // remove loading gif
                    html.html('');
                    html.attr('style', null);
                    // process forum groups
                    $(data).each(function() {
                        var fgrp = this,
                            table = $("<table>"),
                            tbody = $("<tbody>"),
                            thread_count = 0;
                        table.addClass("list").attr("id", "fg" + this.id);
                        table.attr("cellspacing", "0");
                        table.append("<caption>" + this.name + "</caption>");
                        table.append("<thead><tr><th>Forum</th><th>Threads</th><th>Last Post</th></tr></thead>");
                        // add forum list
                        $(this.forums).each(function() {
                            var row = $('<tr class="forum">'),
                                lastp = this.last_post;
                            row.append('<td><h1>' + this.name + '</h1><br />' + this.description + '</td>');
                            row.append('<td>' + this.num_threads + '</td>');
                            if(lastp === null) {
                                row.append('<td>No posts in this forum</td>');
                            } else {
                                row.append('<td>by <a>' + lastp.uname + '</a><br /><span class="date">' + lastp.date + '</span></td>');
                            }
                            tbody.append(row);
                        });
                        table.append(tbody);

                        table.append('<tfoot><tr><td colspan="3">Total threads: ' + thread_count + '</td></tr></tfoot>');

                        html.append(table);
                    });
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