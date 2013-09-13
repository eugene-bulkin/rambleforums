<?php
require 'config.inc.php';
require 'dbapi.php';
session_start();
?>
<html>
<head>
    <title><?php echo $_config->get('ramble.forum_name'); ?></title>

    <!-- jQuery -->
    <script src="js/jquery.js" type="text/javascript"></script>

    <!-- jQuery UI -->
    <script src="js/jquery.ui.js" type="text/javascript"></script>
    <link href="css/cupertino/jquery-ui.min.css" rel="stylesheet"
          type="text/css"/>

    <!-- jQuery Form Plugin -->
    <script src="js/jquery.form.js" type="text/javascript"></script>

    <!-- jQuery Form Validation Plugin -->
    <script src="js/jquery.validate.js"></script>

    <!-- jQuery jScrollPane Plugin -->
    <script src="js/jquery.mousewheel.js"></script>
    <script src="js/jquery.scrollpane.js"></script>
    <link href="css/jquery.scrollpane.css" rel="stylesheet" type="text/css"/>

    <script src="js/mustache.js" type="text/javascript"></script>

    <script src="js/ramble.js" type="text/javascript"></script>
    <script src="js/ramble.login.js" type="text/javascript"></script>
    <script src="js/ramble.pages.js" type="text/javascript"></script>
    <script src="js/ramble.config.js" type="text/javascript"></script>
    <script src="js/ramble.template.js" type="text/javascript"></script>

    <link href="css/style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
<div id="header"></div>
<div id="page"></div>
</body>
</html>
