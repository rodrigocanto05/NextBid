<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/LevelManager.php';

$limit = (int) ($_GET['limit'] ?? 10);

$lvlMgr = new LevelManager($pdo);
$top    = $lvlMgr->getLeaderboard($limit);

echo json_encode([
    'status'  => 'success',
    'count'   => count($top),
    'ranking' => $top
]);