<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/TransactionManager.php';
require_once '../../includes/AuthMiddleware.php';

$user   = AuthMiddleware::requireAuth($pdo);
$userId = $user['id'];

$limit = (int) ($_GET['limit'] ?? 50);

$txMgr   = new TransactionManager($pdo);
$history = $txMgr->getHistory($userId, $limit);

echo json_encode([
    'status'       => 'success',
    'count'        => count($history),
    'transactions' => $history
]);