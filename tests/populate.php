<?php
require_once '../config/db.php';

/** @var PDO $pdo */

try {
    echo "<h1>🚀 A iniciar o povoamento do NextBid...</h1>";

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE xp_logs;");
    $pdo->exec("TRUNCATE TABLE notifications;");
    $pdo->exec("TRUNCATE TABLE bids;");
    $pdo->exec("TRUNCATE TABLE product_images;");
    $pdo->exec("TRUNCATE TABLE products;");
    $pdo->exec("TRUNCATE TABLE categories;");
    $pdo->exec("TRUNCATE TABLE gamification_participants;");
    $pdo->exec("TRUNCATE TABLE gamification;");
    $pdo->exec("TRUNCATE TABLE users;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    $pdo->exec("INSERT INTO categories (cat_name) VALUES ('Eletrónica'), ('Colecionáveis'), ('Veículos')");
    $catId = $pdo->lastInsertId();


    $pass = password_hash('123456', PASSWORD_BCRYPT);

    $sqlUser = "INSERT INTO users (usr_name, usr_email, usr_password, usr_gender, usr_age, usr_xp, usr_role) VALUES (?, ?, ?, ?, ?, ?, ?)";

    $pdo->prepare($sqlUser)->execute(['User Alpha', 'alpha@test.com', $pass, 'M', 25, 100, 'buyer']);
    $userA = $pdo->lastInsertId();

    $pdo->prepare($sqlUser)->execute(['User Beta', 'beta@test.com', $pass, 'F', 30, 50, 'seller']);
    $userB = $pdo->lastInsertId();

    $sqlPrd = "INSERT INTO products (
                prd_name, prd_description, prd_cat_id, prd_usr_id, 
                prd_condition, prd_start_price, prd_latitude, prd_longitude, 
                prd_ends_at, prd_status
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";


    $pdo->prepare($sqlPrd)->execute([
        'iPhone Clássico', 'Item de colecionador em bom estado.', $catId, $userB,
        'used', 150.00, 38.7369, -9.1426, date('Y-m-d H:i:s', strtotime('+7 days')), 'active'
    ]);


    $pdo->prepare($sqlPrd)->execute([
        'Moeda Rara 1900', 'Moeda de ouro antiga.', $catId, $userB,
        'used', 500.00, 38.7400, -9.1500, date('Y-m-d H:i:s', strtotime('+2 minutes')), 'active'
    ]);


    $sqlGme = "INSERT INTO gamification (
                gme_name, gme_latitude, gme_longitude, gme_radius, 
                gme_xp_reward, gme_verification_code, gme_reveal_at, 
                gme_is_revealed, gme_status
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $pdo->prepare($sqlGme)->execute([
        'Tesouro do Chiado', 38.7100, -9.1400, 50, 500, '9999',
        date('Y-m-d H:i:s', strtotime('+1 hour')), 0, 'active'
    ]);

    echo "<h2 style='color: green;'>✅ Base de dados NextBid populada com sucesso!</h2>";
    echo "<p>Agora já podes testar os teus endpoints e o mapa.</p>";

} catch (Exception $e) {
    echo "<h2 style='color: red;'>❌ Erro ao povoar: " . $e->getMessage() . "</h2>";
}