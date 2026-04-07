<?php
function executarLazyCron(PDO $pdo): void
{
    require_once 'NotificationManager.php';
    $notif = new NotificationManager($pdo);

    $stmt = $pdo->query("SELECT prd_id, prd_name FROM products WHERE prd_ends_at < NOW() AND prd_status = 'active'");
    $expiredAuctions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredAuctions as $auction) {
        $id = $auction['prd_id'];
        $name = $auction['prd_name'];

        $pdo->beginTransaction();
        try {
            $stmtBid = $pdo->prepare("SELECT usr_id, bid_amount FROM bids WHERE prd_id = ? ORDER BY bid_amount DESC LIMIT 1");
            $stmtBid->execute([$id]);
            $winner = $stmtBid->fetch(PDO::FETCH_ASSOC);

            if ($winner) {
                $pdo->prepare("UPDATE products SET prd_status = 'sold' WHERE prd_id = ?")->execute([$id]);
                $notif->create($winner['usr_id'], "Parabéns! Ganhaste o leilão do produto: $name por " . number_format($winner['bid_amount'], 2) . "€!");

                atribuirXPAleatorio($pdo, $winner['usr_id'], "Vitória no leilão #$id");
            } else {
                $pdo->prepare("UPDATE products SET prd_status = 'expired' WHERE prd_id = ?")->execute([$id]);
            }
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Erro ao fechar leilão $id: " . $e->getMessage());
        }
    }

    $sqlGme = "SELECT gme_id, gme_name FROM gamification 
               WHERE gme_reveal_at <= NOW() 
               AND gme_is_revealed = FALSE 
               AND gme_status = 'active'";

    $stmtGme = $pdo->query($sqlGme);
    $treasuresToReveal = $stmtGme->fetchAll(PDO::FETCH_ASSOC);

    foreach ($treasuresToReveal as $treasure) {
        $gmeId = $treasure['gme_id'];

        $pdo->beginTransaction();
        try {
            $pdo->prepare("UPDATE gamification SET gme_is_revealed = TRUE WHERE gme_id = ?")->execute([$gmeId]);

            $stmtPart = $pdo->prepare("SELECT usr_id FROM gamification_participants WHERE gme_id = ?");
            $stmtPart->execute([$gmeId]);
            $participants = $stmtPart->fetchAll(PDO::FETCH_COLUMN);

            foreach ($participants as $pUserId) {
                $notif->create($pUserId, "A caça começou! O item '{$treasure['gme_name']}' já está visível no mapa. Sê o primeiro a chegar!");
            }

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Erro ao revelar tesouro $gmeId: " . $e->getMessage());
        }
    }
}

function atribuirXPAleatorio(PDO $pdo, int $userId, string $reason = "Atividade no NextBid"): void
{
    $xp = rand(5, 15);

    $sql = "UPDATE users SET usr_xp = usr_xp + :xp WHERE usr_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['xp' => $xp, 'id' => $userId]);

    $logSql = "INSERT INTO xp_logs (usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)";
    $pdo->prepare($logSql)->execute([$userId, $xp, $reason]);
}