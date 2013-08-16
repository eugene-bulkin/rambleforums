<?php
require 'config.inc.php';
session_start();

$query = array_key_exists( 'query', $_POST ) ? $_POST['query'] : null;
$qdata = array_key_exists( 'data', $_POST ) ? $_POST['data'] : null;
if (!$query || !$qdata) {
    exit;
}

function upd_group_order( $DBH, $qdata )
{
    try {
        $STH = $DBH->prepare( "UPDATE config SET `value` = ? WHERE `key` = 'forum' AND `subkey` = 'group_order'" );
        $STH->execute( array( $qdata ) );
    } catch ( PDOException $e ) {
        return $e->getMessage();
    }

    return true;
}

function upd_forum_order( $DBH, $qdata )
{
    try {
        // First update parent forum groups in forums table
        $new_order = json_decode( $qdata );
        foreach ($new_order as $fgid => $forums) {
            foreach ($forums as $f) {
                try {
                    $STH = $DBH->prepare( "UPDATE forums SET `fgid` = ? WHERE `id` = ?" );
                    $STH->execute( array( $fgid, $f ) );
                } catch ( PDOException $e ) {
                    return $e->getMessage();
                }
            }
        }
        // now actually update it in config, if all forums were fixed
        $STH = $DBH->prepare( "UPDATE config SET `value` = ? WHERE `key` = 'forum' AND `subkey` = 'forum_order'" );
        $STH->execute( array( $qdata ) );
    } catch ( PDOException $e ) {
        return $e->getMessage();
    }

    return true;
}

$result = null;
switch ($query) {
case "grp_ord":
    $result = upd_group_order( $DBH, $qdata );
    break;
case "frm_ord":
    $result = upd_forum_order( $DBH, $qdata );
    break;
default:
    exit;
}
print json_encode( $result );
