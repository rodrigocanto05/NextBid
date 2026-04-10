<?php
header('Content-Type: application/json');
/** @var PDO $pdo */
require_once '../../config/db.php';
require_once '../../includes/UserManager.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Use POST.']));
}

$email = $_POST["email"] ?? '';
$password = $_POST["password"] ?? '';

$userMgr = new UserManager($pdo);
$resultado = $userMgr->login($email, $password);

if ($resultado['status'] === 'success') {
    echo json_encode($resultado);
} else {
    http_response_code(401);
    echo json_encode($resultado);
}