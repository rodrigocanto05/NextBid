<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/GamificationManager.php';
require_once '../../includes/functions.php';

executarLazyCron($pdo);

$gamificationMgr = new GamificationManager($pdo);

$lat  = isset($_GET['lat']) ? (float) $_GET['lat'] : null;
$lng  = isset($_GET['lng']) ? (float) $_GET['lng'] : null;
$raio = isset($_GET['radius']) ? (int) $_GET['radius'] : 10;

if (!$lat || !$lng) {
    exit(json_encode(['status' => 'error', 'message' => 'GPS necessário para a caça ao tesouro.']));
}

try {
    $points = $gamificationMgr->getNearbyPoints($lat, $lng, $raio);
    echo json_encode(['status' => 'success', 'count' => count($points), 'data' => $points]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erro ao carregar caça ao tesouro.']);
}