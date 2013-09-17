<?php
require 'config.inc.php';
require 'dbapi.php';
session_start();

function verify_edit_profile($given_id)
{
    return $_SESSION["user_id"] === $given_id;
}

function verify_admin_panel($SQL)
{
    $uid = $_SESSION["user_id"];

    $opts = new stdClass();
    $opts->type = "indiv";
    $opts->query = "users";
    $opts->keys = array("id", "ugid");
    $opts->each = array();
    $opts->where = array("users.id", $uid);
    $q = $SQL->query(array($opts));
    $ugid = $q[0]["ugid"];

    $opts = new stdClass();
    $opts->type = "indiv";
    $opts->query = "user_groups";
    $opts->keys = array("id", "perm_admin_panel");
    $opts->each = array();
    $opts->where = array("user_groups.id", $ugid);
    $q = $SQL->query(array($opts));
    $result = $q[0];

    return $result["perm_admin_panel"] === "1";
}

function is_logged_in()
{
    if (array_key_exists("user_id", $_SESSION)) {
        return $_SESSION["user_id"];
    } else {
        return false;
    }
}

$SQL = new RambleDB($DBH, $_config);

if (array_key_exists("process", $_POST)) {

    $process = $_POST["process"];

    if ($process === "edit_profile") {
        if (!array_key_exists("id", $_POST)) {
            die("false");
        }
        die(json_encode(verify_edit_profile($_POST["id"])));
    } elseif ($process === "header") {
        $modes = explode(";", $_POST["vmodes"]);
        $results = array();
        foreach ($modes as $mode) {
            if ($mode === "logged_in") {
                $results["logged_in"] = is_logged_in();
            }
            if ($mode === "admin_panel") {
                $results["admin_panel"] = verify_admin_panel($SQL);
            }
        }
        die(json_encode($results));
    }
}