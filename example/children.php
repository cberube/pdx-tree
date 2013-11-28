<?php

$id = $_GET['nodeId'];

$children = array(
    array('name' => "$id child 1"),
    array('name' => "$id child 2"),
    array('name' => "$id child 3"),
);

header('Content-type: application/json');
echo json_encode($children);