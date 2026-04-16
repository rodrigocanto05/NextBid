<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/UserManager.php';
require_once '../../includes/AuthMiddleware.php';

$user   = AuthMiddleware::requireAuth($pdo);
$userId = $user['id'];

$limit = (int) ($_GET['limit'] ?? 50);

$userMgr = new UserManager($pdo);
$history = $userMgr->getXpHistory($userId, $limit);

$totalEarned = 0;
foreach ($history as $entry) {
    $totalEarned += (int) $entry['xpl_amount'];
}

echo json_encode([
    'status'       => 'success',
    'count'        => count($history),
    'total_shown'  => $totalEarned,
    'history'      => $history
]);
