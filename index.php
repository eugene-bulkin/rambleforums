<?php
require 'config.inc.php';
require 'dbapi.php';
session_start();

$SQL = new RambleDB($DBH, $_config);

function logged_in()
{
    return array_key_exists("user_id", $_SESSION);
}

function print_login_links()
{
    if (logged_in()) {
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

function print_profile_info($SQL)
{
    if (logged_in()) {
        $options = new stdClass();
        $options->type = "indiv";
        $options->query = "users";
        $options->keys = array("id", "username");
        $options->where = array("id", $_SESSION["user_id"]);
        $options->each = array();
        $query = $SQL->query(array($options));
        $user = $query[0];
        ?>
        <ul>
            <li><a class="user_link" href="user_<?php echo $user["id"]; ?>"><?php echo $user["username"]; ?></a></li>
            <li><a class="edit_prof" id="ep_<?php echo $user["id"]; ?>">Edit Profile</a></li>
        </ul>
    <?php
    } else {
        ?>
        Not logged in. Please login or register to participate.
    <?php
    }
}
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
<div id="header">
    <div id="title">
        <a><?php echo $_config->get('ramble.forum_name'); ?></a>
    </div>
    <div id="userinfo">
        <div id="proflinks">
            <?php print_profile_info($SQL); ?>
        </div>
        <div id="loginlinks">
            <ul>
                <?php print_login_links(); ?>
            </ul>
        </div>
    </div>
</div>
<div id="page"></div>
</body>
</html>
