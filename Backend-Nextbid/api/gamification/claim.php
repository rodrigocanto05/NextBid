<?php
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/GamificationManager.php';

/** @var PDO $pdo */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
}

$userId = (int)($_POST['user_id'] ?? 0);
$pointId = (int)($_POST['point_id'] ?? 0);
$userLat = (float)($_POST['lat'] ?? 0);
$userLng = (float)($_POST['lng'] ?? 0);

if ($userId <= 0 || $pointId <= 0 || $userLat == 0) {
    exit(json_encode(['status' => 'error', 'message' => 'Dados de localização incompletos.']));
}

$gamifyMgr = new GamificationManager($pdo);
$resultado = $gamifyMgr->claimPoint($userId, $pointId, $userLat, $userLng);

echo json_encode($resultado);