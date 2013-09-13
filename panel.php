<?php
require 'verify.php';

if (!array_key_exists("mode", $_GET)) {
    die();
}

function edit_profile($DBH, $pdata)
{
    if (!verify_edit_profile($pdata["uid"])) {
        return array("success" => false);
    }
    try {
        $query = "UPDATE user_info SET `email`=? WHERE `user_id`=?";
        $STH = $DBH->prepare($query);
        $STH->execute(array($pdata["email"], $pdata["uid"]));
    } catch(PDOException $e) {
        return $e->getMessage();
    }
    return true;
}

$result = null;
switch ($_GET["mode"]) {
    case "user":
        $result = edit_profile($DBH, $_POST);
        break;
    default:
        die();
}
print json_encode($result);