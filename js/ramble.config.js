RAMBLE.Config = (function ($) {
    "use strict";
    var module = {};

    module.processGroupOrder = function () {
        // disable sorting while we process
        $("#forum_groups").sortable('disable');
        $(".forumSortable").sortable('disable');
        $("#loading").html('<br /><img src="images/loading.gif" />');
        // process data
        var grp_ord = [];
        $("#forum_groups").find("div.fgroup").each(function (i, el) {
            grp_ord.push($(el).attr('id').replace('fg', ''));
        });
        $.ajax({
            url: 'update.php',
            data: {
                query: 'grp_ord',
                data: JSON.stringify(grp_ord)
            },
            type: 'POST',
            dataType: 'json',
            success: function (data) {
                if (data === true) {
                    $("#forum_groups").sortable('enable');
                    $(".forumSortable").sortable('enable');
                    $("#loading").html('');
                }
            }
        });
    };

    module.processForumOrder = function () {
        // disable sorting while we process
        $("#forum_groups").sortable('disable');
        $(".forumSortable").sortable('disable');
        $("#loading").html('<br /><img src="images/loading.gif" />');
        // process data
        var forum_ord = {};
        $("#forum_groups").find("div.fgroup").each(function (i, el) {
            var fgid = $(el).attr('id').replace('fg', '');
            forum_ord[fgid] = [];
            $(this).find('li').each(function (i, el) {
                var fid = $(el).attr('id').replace('f', '');
                forum_ord[fgid].push(fid);
            });
        });
        $.ajax({
            url: 'update.php',
            data: {
                query: 'frm_ord',
                data: JSON.stringify(forum_ord)
            },
            type: 'POST',
            dataType: 'json',
            success: function (data) {
                if (data === true) {
                    $("#forum_groups").sortable('enable');
                    $(".forumSortable").sortable('enable');
                    $("#loading").html('');
                }
            }
        });
    };

    return module;
}(jQuery));