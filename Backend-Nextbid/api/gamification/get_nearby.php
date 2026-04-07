<?php

header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/GamificationManager.php';

/** @var PDO $pdo */

$lat = isset($_GET['lat']) ? (float)$_GET['lat'] : null;
$lng = isset($_GET['lng']) ? (float)$_GET['lng'] : null;
$raio = isset($_GET['radius']) ? (int)$_GET['radius'] : 10;

if (!$lat || !$lng) {
    exit(json_encode(['status' => 'error', 'message' => 'Coordenadas GPS necessárias.']));
}

$gamificationMgr = new GamificationManager($pdo);
$pontos = $gamificationMgr->getNearbyPoints($lat, $lng, $raio);

echo json_encode([
    'status' => 'success',
    'count' => count($pontos),
    'data' => $pontos
]);
