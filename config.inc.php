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
    private $db;
    private $ramble, $forum;

    public function __construct($dba) {
        $this->db = $dba;
        $this->ramble = new stdClass();
        $this->forum = new stdClass();
    }

    public function get($keyid) {
        $keyids = explode('.', $keyid);
        $key = $keyids[0];
        $subkey = $keyids[1];

        return $this->{$key}->{$subkey};
    }

    public function set($key, $subkey, $value) {
        $this->{$key}->{$subkey} = $value;
    }
}

$_config = new Config($dba);

/* Connect to database */

// Get DB information from config
$host = $_config->get("db.hostname");
$db = $_config->get("db.database");
$user = $_config->get("db.username");
$pass = $_config->get("db.password");

// Connect to DB using PDO
$DBH = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
$DBH->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get database-stored configuration information
try {
    $STH = $DBH->prepare("SELECT `key`, `subkey`, `value`, `type` FROM config");
    $STH->execute();
    $RES = $STH->fetchAll(PDO::FETCH_OBJ);
    foreach($RES as $row) {
        $val = ($row->type == "json") ? json_decode($row->value) : $row->value;
        $_config->set($row->key, $row->subkey, $val);
    }
} catch(PDOException $e) {
    echo $e->getMessage();
    exit;
}
?>