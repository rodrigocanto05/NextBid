<?php
require_once '../../includes/cors.php';
header('Content-Type: application/json');
require_once '../../config/db.php';
require_once '../../includes/AuctionManager.php';
require_once '../../includes/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
}

$user   = AuthMiddleware::requireAuth($pdo);
$userId = $user['id'];

if (!isset($_FILES['image'])) {
    exit(json_encode(['status' => 'error', 'message' => 'Imagem obrigatória.']));
}

$uploadDir = '../../uploads/products/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$imageName  = time() . '_' . basename($_FILES['image']['name']);
$uploadFile = $uploadDir . $imageName;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
    exit(json_encode(['status' => 'error', 'message' => 'Erro ao carregar imagem.']));
}

$auctionMgr = new AuctionManager($pdo);

$data = [
    'uid'         => $userId,
    'name'        => $_POST['name'] ?? '',
    'description' => $_POST['description'] ?? '',
    'condition'   => $_POST['condition'] ?? 'used',
    'price'       => (float) ($_POST['startPrice'] ?? 0),
    'location'    => $_POST['location'] ?? '',
    'lat'         => (float) ($_POST['latitude'] ?? 0),
    'long'        => (float) ($_POST['longitude'] ?? 0),
    'category'    => (int) ($_POST['categoryId'] ?? 0),
    'ends'        => $_POST['ends_at'] ?? ''
];

$productId = $auctionMgr->createAuction($data);

if ($productId) {
    $auctionMgr->addImage($productId, 'uploads/products/' . $imageName);
    echo json_encode(['status' => 'success', 'message' => 'Leilão criado!', 'id' => $productId]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Falha ao criar leilão.']);
}