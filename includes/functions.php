<?php
function executarLazyCron(PDO $pdo): void
{
    require_once 'NotificationManager.php';
    $notif = new NotificationManager($pdo);

    $stmt = $pdo->query("SELECT prd_id, prd_name FROM product WHERE prd_ends_at < NOW() AND prd_status = 'active'");
    $expiredAuctions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredAuctions as $auction) {
        $id = $auction['prd_id'];
        $name = $auction['prd_name'];

        $pdo->beginTransaction();
        try {
            $stmtBid = $pdo->prepare("SELECT bid_usr_id, bid_amount FROM bid WHERE bid_prd_id = ? ORDER BY bid_amount DESC LIMIT 1");
            $stmtBid->execute([$id]);
            $winner = $stmtBid->fetch(PDO::FETCH_ASSOC);

            if ($winner) {
                $pdo->prepare("UPDATE product SET prd_status = 'sold' WHERE prd_id = ?")->execute([$id]);
                $notif->create($winner['bid_usr_id'], "Parabéns! Ganhaste o leilão do produto: $name por " . number_format($winner['bid_amount'], 2) . "€!");

                atribuirXPAleatorio($pdo, $winner['bid_usr_id'], "Vitória no leilão #$id");
            } else {
                $pdo->prepare("UPDATE product SET prd_status = 'expired' WHERE prd_id = ?")->execute([$id]);
            }
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Erro ao fechar leilão $id: " . $e->getMessage());
        }
    }

}

function atribuirXPAleatorio(PDO $pdo, int $userId, string $reason = "Atividade no NextBid"): void
{
    $xp = rand(5, 15);

    $sql = "UPDATE userss SET usr_xp = usr_xp + :xp WHERE usr_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['xp' => $xp, 'id' => $userId]);

    $logSql = "INSERT INTO xp_logs (xpl_usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)";
    $pdo->prepare($logSql)->execute([$userId, $xp, $reason]);
}