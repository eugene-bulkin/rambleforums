<?php
require 'config.inc.php';
session_start();

$mode = array_key_exists( 'mode', $_GET ) ? $_GET['mode'] : null;
if (!$mode) {
    exit;
}

function new_thread( $DBH, $post_data )
{
    $title = array_key_exists( 'title', $post_data ) ? $post_data['title'] : null;
    $body = array_key_exists( 'body', $post_data ) ? $post_data['body'] : null;
    if (!$title || !$body) {
        return null;
    }

    try {
        if ( !array_key_exists( 'user_id', $_SESSION ) ) {
            return null;
        }
        $uid = $_SESSION["user_id"];
        $STH = $DBH->prepare("INSERT INTO threads (`title`, `body`, `user_id`, `forum_id`, `date_posted`) VALUES (?, ?, ?, ?, NOW())");
        $STH->execute(array($title, $body, $uid, $post_data["forum_id"]));
    } catch ( PDOException $e ) {
        return $e->getMessage();
    }

    $result = new stdClass();
    $result->success = true;
    $result->thread_id = $DBH->lastInsertId();

    return $result;
}

$result = null;
switch ($mode) {
case "new_thread":
    $result = new_thread( $DBH, $_POST );
    break;
default:
    break;
}
print json_encode( $result );
