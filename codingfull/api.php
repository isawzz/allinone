<?php
// require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$result = (object)[];
$path = '../coding/cb2/';
$all = file_get_contents($path . 'z_all.yaml');
$allcode = file_get_contents($path . 'z_allcode.yaml');
$allhistory = file_get_contents($path . 'z_allhistory.yaml');
$path = '../base/assets/';
$c52 = file_get_contents($path . 'c52.yaml');
$syms = file_get_contents($path . 'allSyms.yaml');
$symGSG = file_get_contents($path . 'symGSG.yaml');
$cinno = file_get_contents($path . 'fe/inno.yaml');
$info = file_get_contents($path . 'lists/info.yaml');
$sayings = file_get_contents($path . 'games/wise/sayings.yaml');
$result = (object) ['all' => $all, 'allcode' => $allcode, 'allhistory' => $allhistory, 'sayings' => $sayings, 'info' => $info, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG];
echo json_encode($result); 




















