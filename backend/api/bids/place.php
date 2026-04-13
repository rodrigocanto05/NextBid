<?php

header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/BidManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(['status' => 'error', 'message' => 'Método POST exigido.']));
}

/** @var PDO $pdo */

// Validação de tonkes caroxos
$userId    = (int)($_POST['user_id'] ?? 0);
$productId = (int)($_POST['product_id'] ?? 0);
$amount    = (float)($_POST['amount'] ?? 0);

if ($userId <= 0 || $productId <= 0 || $amount <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'Dados de licitação inválidos.']));
}

$bidMgr = new BidManager($pdo);
$resultado = $bidMgr->placeBid($userId, $productId, $amount);

echo json_encode($resultado);