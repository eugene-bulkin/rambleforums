<?php
require 'config.inc.php';
session_start();

class RambleDB {
    public function __construct( $DBH ) {
        $this->DBH = $DBH;
    }

    // construct a query given some options
    public function construct($options) {
    }

    // perform query
    public function query($options) {
    }
}

$SQL = new RambleDB($DBH);
?>
