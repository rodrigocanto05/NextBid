<?php
header('Content-Type: application/json');
/** @var PDO $pdo */
require_once "../../config/db.php";
require_once '../../includes/UserManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Método não auto.']));
}

$userMgr = new UserManager($pdo);
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';
$gender = $_POST['gender'] ?? 'Não especificado';
$age = (int)($_POST['age'] ?? 0);
$bio = filter_input(INPUT_POST, 'bio', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';
$xpInicial = rand(10, 50);

if (!$name || !$email || strlen($password) < 8) {
    echo json_encode(['status' => 'error', 'message' => 'Dados inválidos ou password fraca (mínimo 8 caracteres).']);
    exit;
}

try {
    $success = $userMgr->register($name, $email, $password, $gender, $age, $bio, $xpInicial);

    if ($success) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Bem vindo a NextBid! Ganhaste ' . $xpInicial . ' XP de bónus.'
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Falha ao registar.']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Erro: Verifique se o email já está em uso.']);
}