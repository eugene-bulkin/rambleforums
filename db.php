<?php
require 'config.inc.php';
session_start();

if (!array_key_exists("options", $_GET)) {
    die("NULL");
}

$options = json_decode($_GET['options']);

class RambleDB
{
    private $special_keys;
    private $DBH;
    private $CONF;
    private $tables;

    public function __construct($DBH, $CONF)
    {
        $this->DBH = $DBH;
        $this->CONF = $CONF;
        $this->special_keys = array(
            "threads" => array(
                "num_replies" => "SELECT COUNT(*) FROM posts WHERE posts.thread_id = threads.id",
                "pages" => "SELECT CEIL(COUNT(*) / ?) FROM posts WHERE posts.thread_id = threads.id"
            ),
            "posts" => array(),
            "forums" => array(
                "num_threads" => "SELECT COUNT(*) FROM threads WHERE threads.forum_id = forums.id",
                "pages" => "SELECT CEIL(COUNT(*) / ?) FROM threads WHERE threads.forum_id = forums.id"
            ),
            "users" => array(
                "num_posts" => "(SELECT COUNT(*) FROM posts WHERE users.id = posts.user_id) + (SELECT COUNT(*) FROM threads WHERE users.id = threads.user_id)"
            ),
            "forum_groups" => array()
        );

        $this->tables = array("threads", "posts", "forums", "forum_groups", "users");

        $this->key_types = array(
            "numbers" => array("id", "pages", "num_replies", "num_threads", "num_posts"),
            "dates" => array("date_posted", "date_joined")
        );
    }

    private function process_type($key, $value)
    {
        if (in_array($key, $this->key_types["numbers"])) {
            return intval($value);
        }
        if (in_array($key, $this->key_types["dates"])) {
            return date_format(date_create_from_format("Y-m-d H:i:s", $value), "F d, Y h:i:s A");
        }

        return $value;
    }

    private function to_singular($table)
    {
        return substr($table, 0, -1);
    }

    private function key_to_sql($table, $key)
    {
        if (array_key_exists($key, $this->special_keys[$table])) {
            return sprintf("(%s) AS `%s.%s`", $this->special_keys[$table][$key], $table, $key);
        } else {
            return sprintf("%s.%s AS `%s.%s`", $table, $key, $table, $key);
        }
    }

    // construct a query given some options
    public function construct($options)
    {
        if (!in_array($options->query, $this->tables)) {
            die("NULL");
        }
        $selects = array();
        foreach ($options->keys as $key) {
            $selects[] = $this->key_to_sql($options->query, $key);
        }
        $joins = array();
        foreach ($options->each as $table => $keys) {
            if ($table === "last_post") { // skip because processed separately
                continue;
            }
            $joins[] = sprintf("INNER JOIN %s ON %s.id=%s.%s_id", $table, $table, $options->query, $this->to_singular($table));
            foreach ($keys as $key) {
                $selects[] = $this->key_to_sql($table, $key);
            }
        }
        $result = "SELECT " . implode(", ", $selects) . " FROM " . $options->query . " " . implode(" ", $joins);
        if (array_key_exists("where", $options)) {
            if (count(explode(".", $options->where[0])) > 1) {
                $wheretable = "";
            } else {
                $wheretable = $options->query . ".";
            }
            $result .= sprintf(" WHERE %s%s=?", $wheretable, $options->where[0]);
        }
        if (array_key_exists("order", $options) && $options->order) {
            $result .= sprintf(" ORDER BY %s %s", $options->order[0], $options->order[1]);
        }
        if ($options->type === "list" && array_key_exists("paginate", $options)) {
            $page = $options->paginate[0];
            $pp = $options->paginate[1];

            $result .= sprintf(" LIMIT %s, %s", $pp * ($page - 1), $pp);
        } elseif ($options->type === "indiv") {
            $result .= " LIMIT 1";
        }

        return $result;
    }

    // perform query
    public function query($queries)
    {
        $results = array();
        foreach ($queries as $options) {
            $result = null;

            if ($options->query === "config") {
                $result = array();
                foreach ($options->keys as $key) {
                    $keyexp = explode(".", $key);
                    $result[$keyexp[1]] = $this->CONF->get($key);
                }
                $results[] = $result;
                continue;
            }

            $sqlquery = $this->construct($options);
            $STH = $this->DBH->prepare($sqlquery);
            $data = array();
            // pages requires per-page data
            if (in_array("pages", $options->keys)) {
                $data[] = $options->paginate[1];
            }
            if (array_key_exists("where", $options)) {
                $data[] = $options->where[1];
            }
            try {
                $STH->execute($data);
            } catch (PDOException $e) {
                echo $e->getMessage();
                echo "\nThe query was: '$sqlquery'";
                die();
            }

            if ($options->type === "indiv") {
                $RES = $STH->fetch(PDO::FETCH_OBJ);
                if ($RES && $RES->{$options->query . ".id"} !== null) {
                    foreach ($RES as $fullkey => $value) {
                        $keyexp = explode(".", $fullkey);
                        $table = $keyexp[0];
                        $key = $keyexp[1];
                        if ($table === $options->query) {
                            $result[$key] = $this->process_type($key, $value);
                        } else {
                            $result[$this->to_singular($table)][$key] = $this->process_type($key, $value);
                        }
                    }
                }
            } elseif ($options->type === "list") {
                $RES = $STH->fetchAll(PDO::FETCH_OBJ);

                $result = array();

                foreach ($RES as $row) {
                    $row_result = array();
                    foreach ($row as $fullkey => $value) {
                        $keyexp = explode(".", $fullkey);
                        $table = $keyexp[0];
                        $key = $keyexp[1];
                        if ($table === $options->query) {
                            $row_result[$key] = $this->process_type($key, $value);
                        } else {
                            $row_result[$this->to_singular($table)][$key] = $this->process_type($key, $value);
                        }
                    }

                    // process last_post
                    if (array_key_exists("last_post", $options->each)) {
                        if ($options->query === "threads") {
                            // process last post in thread
                            $opts = new stdClass();
                            $opts->type = "indiv";
                            $opts->query = "posts";
                            $opts->keys = array("id", "date_posted");
                            $opts->each = array("users" => array("id", "username"));
                            $opts->where = array("thread_id", $row_result["id"]);
                            $opts->order = array("posts.date_posted", "DESC");
                            $q = $this->query(array($opts));
                            $row_result["last_post"] = $q[0];
                        } elseif ($options->query === "forums") {
                            $opts = new stdClass();
                            $opts->type = "indiv";
                            $opts->query = "posts";
                            $opts->keys = array("id", "date_posted");
                            $opts->each = array("users" => array("id", "username"));
                            $opts->where = array("threads.forum_id", $row_result["id"]);
                            $opts->order = array("posts.date_posted", "DESC");
                            $opts->each["threads"] = array("id", "title");
                            $q = $this->query(array($opts));
                            $lastpost = $q[0];
                            $lpdate = DateTime::createFromFormat("F d, Y h:i:s A", $lastpost["date_posted"]);
                            // also find last thread
                            $opts = new stdClass();
                            $opts->type = "indiv";
                            $opts->query = "threads";
                            $opts->keys = array("id", "title", "date_posted");
                            $opts->each = array("users" => array("id", "username"));
                            $opts->where = array("forum_id", $row_result["id"]);
                            $opts->order = array("threads.date_posted", "DESC");
                            $q = $this->query(array($opts));
                            $lastthread = $q[0];
                            $ltdate = DateTime::createFromFormat("F d, Y h:i:s A", $lastthread["date_posted"]);
                            // check if both dates are available
                            if ($ltdate && $lpdate) {
                                if ($ltdate > $lpdate) {
                                    $row_result["last_post"] = $lastthread;
                                    $row_result["last_post"]["is_post"] = false;
                                } else {
                                    $row_result["last_post"] = $lastpost;
                                    $row_result["last_post"]["is_post"] = true;
                                }
                            } else {
                                // otherwise return the one that exists
                                if ($ltdate) {
                                    $row_result["last_post"] = $lastthread;
                                    $row_result["last_post"]["is_post"] = false;
                                } elseif ($lpdate) {
                                    $row_result["last_post"] = $lastpost;
                                    $row_result["last_post"]["is_post"] = true;
                                } else {
                                    $row_result["last_post"] = null;
                                }
                            }
                        }
                    }

                    $result[] = $row_result;
                }
            }
            $results[] = $result;
        }

        return $results;
    }
}

$SQL = new RambleDB($DBH, $_config);

echo json_encode($SQL->query($options));
