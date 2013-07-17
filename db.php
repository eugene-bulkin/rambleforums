<?php
require 'config.inc.php';
session_start();

$query = array_key_exists('query', $_GET) ? $_GET['query'] : null;
if(!$query) {
    exit;
}

function process_error($e) {
    $error_msg = "";
    switch($e->getCode()) {
        case "42000":
            $error_msg = "ERROR: MySQL syntax error on line {$e->getLine()}.";
            break;
        default:
            $error_msg = $e->getMessage();
    }

    return $error_msg;
}

function forum_list($DBH, $_config) {
    try {
        // Get thread count
        $STH = $DBH->prepare("SELECT forum_id, COUNT(*) AS num_threads FROM threads GROUP BY forum_id");
        $STH->execute();
        $RES = $STH->fetchAll(PDO::FETCH_OBJ);
        $thread_counts = array();
        foreach($RES as $row) {
            $thread_counts[$row->forum_id] = $row->num_threads;
        }

        // Get last post
        $subquery = "SELECT forum_id, max(date_posted) AS last_date FROM ( SELECT posts.date_posted, threads.forum_id FROM posts INNER JOIN threads ON posts.thread_id = threads.id ) AS posts_aug GROUP BY forum_id";
        $query = "SELECT posts.id, posts.user_id, users.username, posts.date_posted, forum_id FROM ( $subquery ) AS last_posts";
        $query .= " INNER JOIN posts ON posts.date_posted = last_date";
        $query .= " INNER JOIN users ON users.id = posts.user_id";
        $query .= " ORDER BY forum_id";
        $STH = $DBH->prepare($query);
        $STH->execute();
        $RES = $STH->fetchAll(PDO::FETCH_OBJ);
        $last_posts = array();
        foreach($RES as $row) {
            $obj = new stdClass();
            $obj->id = $row->id;
            $obj->uid = $row->user_id;
            $obj->uname = $row->username;
            // format date differently
            $obj->date = date_format(date_create_from_format("Y-m-d H:i:s", $row->date_posted), "F g, Y h:i:s A");
            $last_posts[$row->forum_id] = $obj;
        }

        $STH = $DBH->prepare("SELECT id, name FROM forum_groups");
        $STH->execute();
        if($STH->rowCount() == 0) {
            return 'no_forum_groups';
        }

        $result = new stdClass();
        $result->forum_groups = array();
        $result->group_order = $_config->get("forum.group_order");
        $result->forum_order = $_config->get("forum.forum_order");

        $forum_groups = $STH->fetchAll(PDO::FETCH_OBJ);
        foreach($forum_groups as $forum_group) {
            $forum_group->forums = array();

            // Process forums
            $STH = $DBH->prepare("SELECT id, name, description FROM forums WHERE fgid = ?");
            $data = array($forum_group->id);
            $STH->execute($data);
            $forums = $STH->fetchAll(PDO::FETCH_OBJ);

            foreach($forums as $forum) {
                $forum_group->forums[$forum->id] = $forum;
                $forum->num_threads = (array_key_exists($forum->id, $thread_counts)) ? $thread_counts[$forum->id] : 0;
                $forum->last_post = (array_key_exists($forum->id, $last_posts)) ? $last_posts[$forum->id] : null;
            }

            $result->forum_groups[$forum_group->id] = $forum_group;
        }

        return $result;
    } catch(PDOException $e) {
        return process_error($e);
    }
}

$result = null;
switch($query) {
    case "forums":
        $result = forum_list($DBH, $_config);
        break;
    default:
        exit;
}
print json_encode($result);
?>