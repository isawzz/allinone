
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");


$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('../state.json', json_encode($data));
echo json_encode(["success" => true]);

