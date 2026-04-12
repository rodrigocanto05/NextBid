<?php
header('Content-Type: application/json');
/** @var PDO $pdo */
require_once "../../config/db.php";
require_once '../../includes/UserManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['status' => 'error', 'message' => 'Método não autorizado.']));
}

$userId   = (int)($_POST['user_id'] ?? 0);
$newEmail = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL) ?? '';
$newPass  = $_POST['password'] ?? '';
$newBio   = filter_input(INPUT_POST, 'bio', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';

if ($userId <= 0) {
    exit(json_encode(['status' => 'error', 'message' => 'Por favor preenche todos os campos.']));
}

if (empty($newEmail) && empty($newPass) && empty($newBio)) {
    exit(json_encode(['status' => 'error', 'message' => 'Indica pelo menos um campo para atualizar.']));
}

if (!empty($newPass) && strlen($newPass) < 8) {
    exit(json_encode(['status' => 'error', 'message' => 'A password deve ter no mínimo 8 caracteres.']));
}

try {
    $fields = [];
    $params = [];

    if (!empty($newEmail)) {
        $fields[] = 'usr_email = :email';
        $params['email'] = $newEmail;
    }

    if (!empty($newPass)) {
        $fields[] = 'usr_password = :password';
        $params['password'] = password_hash($newPass, PASSWORD_BCRYPT);
    }

    if (!empty($newBio)) {
        $fields[] = 'usr_bio = :bio';
        $params['bio'] = $newBio;
    }

    $params['id'] = $userId;
    $sql = "UPDATE userss SET " . implode(', ', $fields) . " WHERE usr_id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['status' => 'success', 'message' => 'Dados atualizados com sucesso!']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Este email já está em uso.']);
}