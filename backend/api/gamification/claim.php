<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/GamificationManager.php';
require_once '../../includes/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
}

$user   = AuthMiddleware::requireAuth($pdo);
$userId = $user['id'];

$body    = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$pointId = (int) ($body['point_id'] ?? 0);
$userLat = (float) ($body['lat'] ?? 0);
$userLng = (float) ($body['lng'] ?? 0);

if ($pointId <= 0 || $userLat == 0) {
    exit(json_encode(['status' => 'error', 'message' => 'Dados de localização incompletos.']));
}

$gamifyMgr = new GamificationManager($pdo);
echo json_encode($gamifyMgr->claimPoint($userId, $pointId, $userLat, $userLng));