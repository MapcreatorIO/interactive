<?php

$id = $_GET['id'];

header("Access-Control-Allow-Origin: *");

$valid = str_replace("/", "", $id);
// Checks for attacks or non valid ID
if (preg_match('/\W/', $valid) || strlen($valid) !== 32) {
	header('HTTP/1.1 400 Bad Request'); die;
}

$data = file_get_contents('../../output/' . trim($id, '/') . '/map.json');

header("Content-type: application/javascript; charset=utf-8");

print($data);