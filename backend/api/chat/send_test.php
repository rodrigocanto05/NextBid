<?php
require_once '../../includes/cors.php';
require_once '../../config/db.php';
require_once '../../includes/ChatManager.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
}

$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($remote, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit(json_encode(['status' => 'error', 'message' => 'Acesso restrito a localhost.']));
}

$body = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$productId = (int) ($body['product_id'] ?? 0);
$content   = trim((string) ($body['content'] ?? ''));
$userId    = (int) ($body['user_id'] ?? 0);

if ($productId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'product_id inválido.']));
}

if ($content === '') {
    exit(json_encode(['status' => 'error', 'message' => 'Mensagem vazia.']));
}

if ($userId <= 0) {
    $stmt = $pdo->query('SELECT usr_id FROM userss LIMIT 1');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(500);
        exit(json_encode(['status' => 'error', 'message' => 'Não existe utilizador na base de dados.']));
    }
    $userId = (int) $row['usr_id'];
}

try {
    $chat = new ChatManager($pdo);
    $result = $chat->send($userId, $productId, $content);
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erro de BD: ' . $e->getMessage()]);
}
