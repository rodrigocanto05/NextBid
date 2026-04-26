<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/LevelManager.php';

$userId = (int) ($_GET['user_id'] ?? 0);

if ($userId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'ID inválido.']));
}

$lvlMgr = new LevelManager($pdo);
echo json_encode($lvlMgr->getUserLevel($userId));