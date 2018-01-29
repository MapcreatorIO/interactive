<?php

$id = $_GET['id'];

header("Access-Control-Allow-Origin: *");

$valid = str_replace("/", "", $id);
// Checks for attacks or non valid ID
if (preg_match('/\W/', $valid) || strlen($valid) !== 32) {
	//header('HTTP/1.1 400 Bad Request'); die;
}

// $path = "/mnt/data/output/";

$path = "https://s3-eu-west-1.amazonaws.com/m4n-production/";

if(preg_match("/bleeding\\.online\\.maps4news\\.com$/i", $_SERVER['HTTP_HOST'])) {
	$path = "/var/ace/output/";
}

$data = file_get_contents($path . trim($id, '/') . '/map.json');

header("Content-type: application/javascript; charset=utf-8");

print($data);
