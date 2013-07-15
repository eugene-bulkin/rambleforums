<?php
require 'config.inc.php';

function logged_in() {
    return array_key_exists("user_id", $_SESSION);
}

function print_login_links() {
    if(logged_in()) {
?>
<li><a id="logoutlink">Logout</a></li>
<?php
    } else {
?>
<li><a id="loginlink">Login</a></li>
<li><a id="registerlink">Register</a></li>
<?php
    }
}

function print_profile_info() {
    if(logged_in()) {
?>
<ul>
    <li><a>Username</a></li>
    <li><a>Edit Profile</a></li>
</ul>
<?php
    } else {
?>
Not logged in. Please login or register to participate.
<?php
    }
}

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

        <script src="js/ramble.login.js" type="text/javascript"></script>
        <script src="js/ramble.pages.js" type="text/javascript"></script>
        <script src="js/ramble.js" type="text/javascript"></script>

        <link href="css/style.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
        <div id="header">
            <div id="title">
                <span>Forum title</span>
            </div>
            <div id="userinfo">
                <span id="proflinks">
                    <?php print_profile_info(); ?>
                </span>
                <span id="loginlinks">
                    <ul>
                        <?php print_login_links(); ?>
                    </ul>
                </span>
            </div>
        </div>
        <div id="page"></div>
    </body>
</html>