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

$name        = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$condition   = $_POST['condition'] ?? 'used';
$price       = (float) ($_POST['startPrice'] ?? 0);
$location    = $_POST['location'] ?? '';
$lat         = (float) ($_POST['latitude'] ?? 0);
$lng         = (float) ($_POST['longitude'] ?? 0);
$categoryId  = (int) ($_POST['categoryId'] ?? 0);
$endsAt      = $_POST['ends_at'] ?? '';

if ($name === '' || $description === '' || $categoryId <= 0 || empty($endsAt)) {
    exit(json_encode(['status' => 'error', 'message' => 'Preenche todos os campos obrigatórios.']));
}

$validConditions = ['new', 'like new', 'good', 'used'];
if (!in_array($condition, $validConditions)) {
    exit(json_encode(['status' => 'error', 'message' => 'Condição inválida.']));
}

if ($price < 1) {
    exit(json_encode(['status' => 'error', 'message' => 'O preço inicial tem de ser no mínimo 1,00 €.']));
}

if ($price > 1000000) {
    exit(json_encode(['status' => 'error', 'message' => 'O preço inicial não pode exceder 1.000.000 €.']));
}

$endsTimestamp = strtotime($endsAt);
if ($endsTimestamp === false) {
    exit(json_encode(['status' => 'error', 'message' => 'Data de fim inválida.']));
}

$minEnd = time() + 3600;
$maxEnd = time() + (7 * 24 * 3600);

if ($endsTimestamp < $minEnd) {
    exit(json_encode(['status' => 'error', 'message' => 'O leilão tem de durar pelo menos 1 hora.']));
}

if ($endsTimestamp > $maxEnd) {
    exit(json_encode(['status' => 'error', 'message' => 'O leilão não pode durar mais de 7 dias.']));
}

$uploadDir = '../../uploads/products/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($_FILES['image']['type'], $allowedTypes)) {
    exit(json_encode(['status' => 'error', 'message' => 'Formato de imagem inválido. Usa JPG, PNG ou WebP.']));
}

if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
    exit(json_encode(['status' => 'error', 'message' => 'Imagem demasiado grande (máx 5 MB).']));
}

$imageName  = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', basename($_FILES['image']['name']));
$uploadFile = $uploadDir . $imageName;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
    exit(json_encode(['status' => 'error', 'message' => 'Erro ao carregar imagem.']));
}

$auctionMgr = new AuctionManager($pdo);

$data = [
    'uid'         => $userId,
    'name'        => $name,
    'description' => $description,
    'condition'   => $condition,
    'price'       => $price,
    'location'    => $location,
    'lat'         => $lat,
    'long'        => $lng,
    'category'    => $categoryId,
    'ends'        => date('Y-m-d H:i:s', $endsTimestamp)
];

$productId = $auctionMgr->createAuction($data);

if ($productId) {
    $auctionMgr->addImage($productId, 'uploads/products/' . $imageName);
    echo json_encode(['status' => 'success', 'message' => 'Leilão criado!', 'id' => $productId]);
} else {
    @unlink($uploadFile);
    echo json_encode(['status' => 'error', 'message' => 'Falha ao criar leilão.']);
}