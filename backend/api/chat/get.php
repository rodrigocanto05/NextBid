<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/ChatManager.php';

$pdo = getDB();

$productId = (int) ($_GET['product_id'] ?? 0);
$limit     = (int) ($_GET['limit']      ?? 100);

if ($productId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'ID inválido.']));
}

$chat     = new ChatManager($pdo);
$messages = $chat->getByProduct($productId, $limit);

echo json_encode([
    'status'   => 'success',
    'count'    => count($messages),
    'messages' => $messages
]);
