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

AuthMiddleware::requireAdmin($pdo);

$body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$gamifyMgr = new GamificationManager($pdo);
$result    = $gamifyMgr->createEvent($body);

if (is_int($result)) {
    echo json_encode(['status' => 'success', 'id' => $result, 'message' => 'Evento criado.']);
} else {
    echo json_encode($result);
}
