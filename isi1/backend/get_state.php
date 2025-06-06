<?php
include 'common.php';

if (!file_exists($stateFile)) {
  $initial = [
    'message' => 'Initial state',
    'version' => 0,
    'claimed_sets' => [],
    'scores' => [],
    'last_modified' => time()
  ];
  file_put_contents($stateFile, json_encode($initial));
}
header('Content-Type: application/json');
echo file_get_contents($stateFile);

?>