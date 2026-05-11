<?php
/**
 * Server-Sent Events endpoint for real-time auction chat.
 *
 * GET params:
 *   product_id  - auction id (required)
 *   last_id     - last seen message id; only newer messages will be pushed (default 0)
 *
 * The script:
 *  1. Sends all existing messages as an "init" event (when last_id == 0)
 *     OR sends messages since last_id as a "new" event.
 *  2. Loops for up to 28 seconds, polling every 2 s for new messages.
 *  3. Closes. The browser's EventSource reconnects automatically.
 */

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/ChatManager.php';

// — SSE headers —
header('Content-Type: text/event-stream; charset=UTF-8');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');      // disable nginx proxy buffering
header('Access-Control-Allow-Origin: *');

// Stop PHP output buffering so events reach the client immediately
while (ob_get_level() > 0) {
    ob_end_flush();
}

$productId = intval($_GET['product_id'] ?? 0);
$lastId    = intval($_GET['last_id']    ?? 0);

if ($productId <= 0) {
    echo "event: error\ndata: {\"message\":\"product_id invalido\"}\n\n";
    flush();
    exit;
}

$chatMgr = new ChatManager($pdo);

// Release the session lock so other requests aren't blocked
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

ignore_user_abort(true);

// ── Initial payload ──────────────────────────────────────────────────────────
if ($lastId === 0) {
    $messages = $chatMgr->getByProduct($productId, 100);
} else {
    $messages = $chatMgr->getNewMessages($productId, $lastId);
}

$newLastId = $lastId;
if (!empty($messages)) {
    $newLastId = (int) end($messages)['cht_id'];
}

$event = $lastId === 0 ? 'init' : 'new';
sendEvent($event, ['messages' => $messages, 'last_id' => $newLastId]);
$lastId = $newLastId;

// ── Polling loop (~28 s, then browser reconnects) ────────────────────────────
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
        // Heartbeat — keeps the connection alive through proxies
        echo ": heartbeat\n\n";
        flush();
    }
}

// Helper function to send an SSE event with JSON payload 
function sendEvent(string $name, array $payload): void
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    echo "event: {$name}\n";
    echo "data: {$json}\n\n";
    flush();
}
