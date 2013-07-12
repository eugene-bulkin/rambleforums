<?php
/*
 * Enter your database connection information here.
 *
 * Make sure you use an account that does not have too much access! Use one that
 * has restricted privileges.
 */
$dba = (object) array (
    "hostname" => "localhost",  // The hostname of your MySQL server
                                // (usually localhost)
    "database" => "ramble",     // The name of the database Ramble should be
                                // installed on.
    "username" => "ramble",     // The username to access the database
    "password" => "ramble"      // The accompanying password
);

// ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
// DO NOT MODIFY BELOW THIS LINE !
// ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
class Config {
    public $db;
    public $forum;

    public function __construct($dba) {
        $this->db = $dba;
    }
}

$_config = new Config($dba);

/* Connect to database */

// Get DB information from config
$host = $_config->db->hostname;
$db = $_config->db->database;
$user = $_config->db->username;
$pass = $_config->db->password;

// Connect to DB using PDO
$DBH = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
$DBH->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>