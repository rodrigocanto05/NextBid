<?php
/**
 * Chat Debug Test - allows sending messages without auth (localhost only)
 */
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/ChatManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
}

// Restrict to localhost
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($remote, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit(json_encode(['status' => 'error', 'message' => 'Acesso restrito a localhost.']));
}

$body = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$productId = (int) ($body['product_id'] ?? 0);
$content = trim((string) ($body['content'] ?? ''));
$userId = (int) ($body['user_id'] ?? 0);

// Validation
if ($productId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'product_id inválido.']));
}

if ($content === '') {
    exit(json_encode(['status' => 'error', 'message' => 'Mensagem vazia.']));
}

// Get first user if not provided
if ($userId <= 0) {
    try {
        $stmt = $pdo->query('SELECT usr_id FROM userss LIMIT 1');
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(500);
            exit(json_encode(['status' => 'error', 'message' => 'Não existe utilizador na base de dados.']));
        }
        $userId = (int) $row['usr_id'];
    } catch (Exception $e) {
        http_response_code(500);
        exit(json_encode(['status' => 'error', 'message' => 'Erro BD: ' . $e->getMessage()]));
    }
}

// Send message
try {
    $chat = new ChatManager($pdo);
    $result = $chat->send($userId, $productId, $content);
    http_response_code($result['status'] === 'success' ? 200 : 400);
    exit(json_encode($result));
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode(['status' => 'error', 'message' => 'Erro: ' . $e->getMessage()]));
}
