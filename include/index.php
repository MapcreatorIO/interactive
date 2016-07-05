<?php

$id = $_GET['id'];

header("Access-Control-Allow-Origin: *");

$valid = str_replace("/", "", $id);
// Checks for attacks or non valid ID
if (preg_match('/\W/', $valid) || strlen($valid) !== 32) {
	header('HTTP/1.1 400 Bad Request'); die;
}

$path = "../../output/";
if(!!preg_match("/^(online|beta)\\.maps4news\\.com$/i", $_SERVER['HTTP_HOST'])) {
	$path = "/mnt/data/production/output/";
} else if("/^staging\\.maps4news\\.com$/i") {
	$path = "/mnt/data/staging/output/";
}

$data = file_get_contents($path . trim($id, '/') . '/map.json');

header("Content-type: application/javascript; charset=utf-8");

print($data);