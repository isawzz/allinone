<?php
include 'common.php';

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);
$data['last_modified'] = time();
file_put_contents($stateFile, json_encode($data));
echo json_encode(["status" => "ok", "last_modified" => $data['last_modified']]);
