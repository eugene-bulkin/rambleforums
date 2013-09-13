<?php
require 'config.inc.php';
require 'dbapi.php';
session_start();

function verify_edit_profile($given_id)
{
    return $_SESSION["user_id"] === $given_id;
}

function is_logged_in()
{
    if(array_key_exists("user_id", $_SESSION))
    {
        return $_SESSION["user_id"];
    }
    else
    {
        return false;
    }
}

if (array_key_exists("process", $_POST)) {

    $process = $_POST["process"];

    if ($process === "edit_profile") {
        if (!array_key_exists("id", $_POST)) {
            die("false");
        }
        die(json_encode(verify_edit_profile($_POST["id"])));
    }

    if ($process === "logged_in") {
        die(json_encode(is_logged_in()));
    }
}