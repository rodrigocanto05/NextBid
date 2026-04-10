<?php

header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/NotificationManager.php';

/** @var PDO $pdo */

$userId = (int)($_GET['userId'] ?? 0);

if ($userId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'ID de utilizador inválido.']));
}

$notifMgr = new NotificationManager($pdo);
$lista = $notifMgr->getUnread($userId);

echo json_encode([
    'status' => 'success',
    'count' => count($lista),
    'notifications' => $lista
]);