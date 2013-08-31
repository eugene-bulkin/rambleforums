<?php
require 'config.inc.php';
require 'dbapi.php';
session_start();

if (!array_key_exists("options", $_GET)) {
    die("NULL");
}

$options = json_decode($_GET['options']);

$SQL = new RambleDB($DBH, $_config);

echo json_encode($SQL->query($options));
