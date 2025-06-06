<?php
include 'common.php';

$incoming = json_decode(file_get_contents("php://input"), true);
$clientVersion = $incoming['version'];
$claimedSet = $incoming['claimed_set'];
$player = $incoming['player'];

$state = json_decode(file_get_contents($stateFile), true);
$currentVersion = $state['version'];

if ($clientVersion !== $currentVersion) {
  echo json_encode(['success' => false, 'reason' => 'Stale version']);
  exit;
}

// Check for duplicate claim
foreach ($state['claimed_sets'] as $c) {
  if (json_encode(array_values($c['set'])) === json_encode(array_values($claimedSet))) {
    echo json_encode(['success' => false, 'reason' => 'Set already claimed']);
    exit;
  }
}

$state['claimed_sets'][] = [
  'set' => $claimedSet,
  'player' => $player,
  'time' => time()
];
$state['scores'][$player] = ($state['scores'][$player] ?? 0) + 1;
$state['version'] += 1;
$state['last_modified'] = time();

file_put_contents($stateFile, json_encode($state));
echo json_encode(['success' => true, 'new_version' => $state['version'], 'last_modified' => $state['last_modified']]);
?>