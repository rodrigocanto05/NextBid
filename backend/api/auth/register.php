<?php
header('Content-Type: application/json');
/** @var PDO $pdo */
require_once "../../config/db.php";
require_once '../../includes/UserManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Método não autorizado.']));
}

$body      = json_decode(file_get_contents('php://input'), true) ?? [];
$name      = trim($body['name'] ?? '');
$email     = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password  = $body['password'] ?? '';
$gender    = $body['gender'] ?? '';
$birthdate = $body['birthdate'] ?? '';
$bio       = trim($body['bio'] ?? '');
$xpInicial = rand(10, 50);

if (!$name || !$email || empty($birthdate) || empty($gender)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor preenche todos os campos.']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['status' => 'error', 'message' => 'A password deve ter no mínimo 8 caracteres.']);
    exit;
}

$userMgr = new UserManager($pdo);

try {
    $success = $userMgr->register($name, $email, $password, $gender, $birthdate, $bio, $xpInicial);

    if ($success) {
        echo json_encode([
            'status'  => 'success',
            'message' => 'Bem vindo a NextBid! Ganhaste ' . $xpInicial . ' XP de bónus.'
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Falha ao registar.']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Este email já está em uso.']);
}
