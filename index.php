<?php
require 'config.inc.php';

session_start();
?>
<html>
    <head>
        <title>Ramble Forums</title>

        <!-- jQuery -->
        <script src="js/jquery.js" type="text/javascript"></script>

        <!-- jQuery UI -->
        <script src="js/jquery.ui.js" type="text/javascript"></script>
        <link href="css/cupertino/jquery-ui.min.css" rel="stylesheet"
            type="text/css" />

        <!-- jQuery Form Plugin -->
        <script src="js/jquery.form.js" type="text/javascript"></script>

        <!-- jQuery Form Validation Plugin -->
        <script src="js/jQuery.validate.js"></script>

        <script src="js/ramble.js" type="text/javascript"></script>
    </head>
    <body>
    <?php
    // Logged in
    if(array_key_exists("user_id", $_SESSION)) {
    ?>
        <button id="logout">Logout</button>
    <?php
    } else {
    ?>
        <button id="login">Login</button>
        <button id="register">Register</button>
    <?php
    }
    ?>
    </body>
</html>