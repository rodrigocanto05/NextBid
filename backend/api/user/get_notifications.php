<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/NotificationManager.php';
require_once '../../includes/AuthMiddleware.php';

$user   = AuthMiddleware::requireAuth($pdo);
$userId = $user['id'];

$notifMgr = new NotificationManager($pdo);
$lista    = $notifMgr->getUnread($userId);

echo json_encode(['status' => 'success', 'count' => count($lista), 'notifications' => $lista]);