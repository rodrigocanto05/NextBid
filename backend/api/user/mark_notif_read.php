<?php

header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/NotificationManager.php';

/** @var PDO $pdo */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Método não permitido.']));
}

$notificationId = (int)($_POST['notificationId'] ?? 0);

if ($notificationId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'ID de notificação inválido.']));
}

$notifMgr = new NotificationManager($pdo);

if ($notifMgr->markAsRead($notificationId)) {
    echo json_encode(['status' => 'success', 'message' => 'Notificação lida.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar estado.']);
}