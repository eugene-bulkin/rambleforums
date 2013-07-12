<?php
require 'config.inc.php';
session_start();

function process_error($e) {
    $error_msg = "";
    switch($e->getCode()) {
        case "42000":
            $error_msg = "ERROR: MySQL syntax error on line {$e->getLine()}.";
            break;
        case "23000":
            $error_msg = "ERROR: Username already in use.";
            break;
        default:
            $error_msg = $e->getMessage();
    }

    return $error_msg;
}

$mode = array_key_exists('mode', $_GET) ? $_GET['mode'] : null;

// Processing a registration
function process_registration($DBH) {
    /* Generate strong hash.
     * See http://alias.io/2010/01/store-passwords-safely-with-php-and-mysql/
     */
    $cost = 10;
    // generate salt
    $salt = strtr(base64_encode(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM)), '+', '.');
    $salt = sprintf("$2a$%02d$", $cost) . $salt;
    // make hash
    $hash = crypt($_POST['password'], $salt);

    // add user to table
    try {
        $DBH->beginTransaction();

        // Add entry into `users` table
        $STH = $DBH->prepare("INSERT INTO users (username, hash) VALUES (:username, :hash)");
        $data = array('username' => $_POST['username'], 'hash' => $hash);

        $STH->execute($data);
        $user_id = $DBH->lastInsertId(); // get the id of just added user

        // Add entry into `users_info` table
        $STH = $DBH->prepare("INSERT INTO users_info (users_id) VALUES (?)");
        $STH->execute(array($user_id));

        // Add entry into `users_lastlogins` table
        $STH = $DBH->prepare("INSERT INTO users_lastlogins (users_id, lastlogin) VALUES (?, NOW())");
        $STH->execute(array($user_id));

        $DBH->commit();

        // Start login session
        $_SESSION['user_id'] = $user_id;

        return true;

    } catch (PDOException $e) {
        $DBH->rollback();

        return process_error($e);
    }
}

// Process login
function process_login($DBH) {
    try {
        // get user's hash
        $STH = $DBH->prepare("SELECT id, hash FROM users WHERE username = ? LIMIT 1");
        $data = array($_POST["username"]);
        $STH->execute($data);
        // no such username!
        if($STH->rowCount() == 0) {
            return 'no_username';
        }
        $user = $STH->fetch(PDO::FETCH_OBJ);

        // check password with hash; if it doesn't match, return
        if(crypt($_POST['password'], $user->hash) != $user->hash) {
            return 'wrong_pass';
        }

        // Start login session
        $_SESSION['user_id'] = $user->id;

        // Update last login
        $STH = $DBH->prepare("UPDATE users_lastlogins SET lastlogin=NOW() WHERE users_id=?");
        $STH->execute(array($user->id));

        return true;

    } catch (PDOException $e) {
        return process_error($e);
    }
}

switch($mode) {
    case "register":
        print json_encode(process_registration($DBH));
        break;
    case "login":
        print json_encode(process_login($DBH));
        break;
    case "logout":
        session_destroy();
        print json_encode(true);
        break;
    default:
        break;
}
?>