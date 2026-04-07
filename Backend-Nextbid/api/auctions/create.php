<?php
header('Content-Type: application/json');
/** @var PDO $pdo */
require_once '../../config/db.php';
require_once '../../includes/AuctionManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Não autorizado']));
}

$userId = (int)($_POST['userId'] ?? 0);
$token = $_POST['token'] ?? '';

if ($userId <= 0 || empty($token)) {
    exit(json_encode(['status' => 'error', 'message' => 'Utilizador não autenticado']));
}

$uploadDir = '../../uploads/products/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$imageName = time() . '_' . basename($_FILES['image']['name']);
$uploadFile = $uploadDir . $imageName;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
    exit(json_encode(['status' => 'error', 'message' => 'Erro ao carregar imagem.']));
}

$auctionMgr = new AuctionManager($pdo);

$data = [
    'uid'         => $userId,
    'name'        => $_POST['name'],
    'description' => $_POST['description'],
    'condition'   => $_POST['condition'],
    'price'       => (float)$_POST['startPrice'],
    'location'    => $_POST['location'],
    'lat'         => (float)$_POST['latitude'],
    'long'        => (float)$_POST['longitude'],
    'category'    => (int)$_POST['categoryId'],
    'ends'        => $_POST['ends_at']
];

$productId = $auctionMgr->createAuction($data);

if ($productId) {
    $auctionMgr->addImage($productId, 'uploads/products/' . $imageName);
    echo json_encode(['status' => 'success', 'message' => 'Leilão criado!', 'id' => $productId]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Falha ao criar leilão na base de dados.']);
}
