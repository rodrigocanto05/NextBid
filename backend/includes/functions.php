<?php
require_once __DIR__ . '/NotificationManager.php';
require_once __DIR__ . '/TransactionManager.php';

function executarLazyCron(PDO $pdo): void
{
    $notif = new NotificationManager($pdo);
    $tx    = new TransactionManager($pdo);

    $stmt = $pdo->query("SELECT prd_id, prd_name, prd_usr_id FROM product WHERE prd_ends_at < NOW() AND prd_status = 'active'");
    $expiredAuctions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredAuctions as $auction) {
        $id       = (int) $auction['prd_id'];
        $name     = $auction['prd_name'];
        $sellerId = (int) $auction['prd_usr_id'];

        $pdo->beginTransaction();
        try {
            $stmtBid = $pdo->prepare(
                "SELECT bid_usr_id, bid_amount FROM bid WHERE bid_prd_id = ? ORDER BY bid_amount DESC LIMIT 1"
            );
            $stmtBid->execute([$id]);
            $winner = $stmtBid->fetch(PDO::FETCH_ASSOC);

            if ($winner) {
                $winnerId = (int) $winner['bid_usr_id'];
                $amount   = (float) $winner['bid_amount'];

                $pdo->prepare(
                    "UPDATE product SET prd_status = 'sold', prd_winner_usr_id = ? WHERE prd_id = ?"
                )->execute([$winnerId, $id]);

                $pdo->commit();

                $transfer = $tx->transfer($winnerId, $sellerId, $amount, "Leilão #$id - $name");

                if ($transfer['status'] === 'success') {
                    $notif->create($winnerId, "Parabéns! Ganhaste o leilão de $name por " . number_format($amount, 2) . "€!");
                    $notif->create($sellerId, "O teu leilão de $name foi vendido por " . number_format($amount, 2) . "€!");
                    atribuirXPAleatorio($pdo, $winnerId, "Vitória no leilão #$id");
                } else {
                    $notif->create($winnerId, "Ganhaste o leilão de $name mas não tens saldo suficiente. Carrega a carteira e contacta o vendedor.");
                    $notif->create($sellerId, "O leilão de $name terminou mas o vencedor não tem saldo suficiente.");
                }
            } else {
                $pdo->prepare("UPDATE product SET prd_status = 'expired' WHERE prd_id = ?")->execute([$id]);
                $pdo->commit();
            }
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("Erro ao fechar leilão $id: " . $e->getMessage());
        }
    }
}

function atribuirXPAleatorio(PDO $pdo, int $userId, string $reason = "Atividade no NextBid"): void
{
    $xp = rand(5, 15);

    $pdo->prepare("UPDATE userss SET usr_xp = usr_xp + :xp WHERE usr_id = :id")
        ->execute(['xp' => $xp, 'id' => $userId]);

    $pdo->prepare("INSERT INTO xp_logs (xpl_usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)")
        ->execute([$userId, $xp, $reason]);
}