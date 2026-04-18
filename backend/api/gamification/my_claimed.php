<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/GamificationManager.php';
require_once '../../includes/AuthMiddleware.php';

$user   = AuthMiddleware::requireAuth($pdo);
$userId = $user['id'];

try {
    $mgr   = new GamificationManager($pdo);
    $items = $mgr->getClaimedByUser($userId);
    echo json_encode(['status' => 'success', 'count' => count($items), 'data' => $items]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erro ao carregar tesouros reclamados.']);
}
