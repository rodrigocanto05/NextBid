<?php
/**
 * Chat Test Endpoint - Debug only (localhost only)
 * Tests the complete chat flow: send message and retrieve it
 */

require_once __DIR__ . '/../../includes/cors.php';
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/ChatManager.php';

$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($remote, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit(json_encode(['status' => 'error', 'message' => 'Acesso restrito a localhost.']));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
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
    
    // Send message
    $sendResult = $chat->send($userId, $productId, $content);
    
    if ($sendResult['status'] !== 'success') {
        http_response_code(400);
        exit(json_encode($sendResult));
    }
    
    // Retrieve messages to verify
    $messages = $chat->getByProduct($productId);
    
    exit(json_encode([
        'status' => 'success',
        'message' => 'Teste completo com sucesso!',
        'send_result' => $sendResult,
        'total_messages' => count($messages),
        'messages' => $messages
    ]));
} catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode([
        'status' => 'error',
        'message' => 'Erro de BD: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]));
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode([
        'status' => 'error',
        'message' => 'Erro: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]));
}
