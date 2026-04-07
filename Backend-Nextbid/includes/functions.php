<?php
function executarLazyCron(PDO $pdo): void
{
    $sql = "UPDATE products SET prd_status = 'expired' 
            WHERE prd_ends_at < NOW() AND prd_status = 'active'";
    $pdo->query($sql);
}


function atribuirXPAleatorio(PDO $pdo, int $userId): void
{
    $xp = rand(5, 15);
    $sql = "UPDATE users SET usr_xp = usr_xp + :xp WHERE usr_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['xp' => $xp, 'id' => $userId]);
}
