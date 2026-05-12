<?php
require_once '../../includes/cors.php';

require_once '../../config/db.php';
require_once '../../includes/ChatManager.php';

$productId = intval($_GET['product_id'] ?? 0);
$lastId    = intval($_GET['last_id']    ?? 0);

if ($productId <= 0) {
    http_response_code(400);
    header('Content-Type: application/json');
    exit(json_encode(['status' => 'error', 'message' => 'product_id inválido']));
}

header('Content-Type: text/event-stream; charset=UTF-8');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');

while (ob_get_level() > 0) {
    ob_end_flush();
}

$pdo     = getDB();
$chatMgr = new ChatManager($pdo);

if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

ignore_user_abort(true);

if ($lastId === 0) {
    $messages = $chatMgr->getByProduct($productId, 100);
} else {
    $messages = $chatMgr->getNewMessages($productId, $lastId);
}

$newLastId = $lastId;
if (!empty($messages)) {
    $newLastId = (int) end($messages)['cht_id'];
}

$event = ($lastId === 0) ? 'init' : 'new';
sendEvent($event, ['messages' => $messages, 'last_id' => $newLastId]);
$lastId = $newLastId;

$deadline = time() + 28;

while (time() < $deadline) {
    if (connection_aborted()) break;

    sleep(2);

    if (connection_aborted()) break;

    $newMsgs = $chatMgr->getNewMessages($productId, $lastId);
    if (!empty($newMsgs)) {
        $lastId = (int) end($newMsgs)['cht_id'];
        sendEvent('new', ['messages' => $newMsgs, 'last_id' => $lastId]);
    } else {
        echo ": heartbeat\n\n";
        flush();
    }
}

function sendEvent(string $name, array $payload): void
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    echo "event: {$name}\n";
    echo "data: {$json}\n\n";
    flush();
}
