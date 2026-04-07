<?php

class BidManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function placeBid(int $userId, int $productId, float $amount): array {
        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare("SELECT prd_start_price, usr_id, prd_status FROM products WHERE prd_id = ? FOR UPDATE");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();

            if (!$product || $product['prd_status'] !== 'active') {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'Este leilão já não está ativo.'];
            }

            if ($product['usr_id'] == $userId) {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'Não podes licitar no teu próprio leilão.'];
            }

            $stmt = $this->pdo->prepare("SELECT MAX(bid_amount) as max_bid FROM bids WHERE prd_id = ?");
            $stmt->execute([$productId]);
            $currentMax = $stmt->fetch()['max_bid'];
            $minimoNecessario = $currentMax ?? $product['prd_start_price'];

            if ($amount <= $minimoNecessario) {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'A tua licitação deve ser superior a ' . number_format($minimoNecessario, 2) . '€'];
            }

            $stmt = $this->pdo->prepare("INSERT INTO bids (bid_amount, usr_id, prd_id) VALUES (?, ?, ?)");
            $stmt->execute([$amount, $userId, $productId]);

            $xpGanho = rand(5, 15);
            $this->pdo->prepare("UPDATE users SET usr_xp = usr_xp + ? WHERE usr_id = ?")->execute([$xpGanho, $userId]);

            $stmt = $this->pdo->prepare("INSERT INTO xp_logs (usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $xpGanho, "Licitação no produto #$productId"]);

            $this->pdo->commit();

            $stmt = $this->pdo->prepare("SELECT usr_id FROM bids WHERE prd_id = ? AND usr_id != ? ORDER BY bid_amount DESC LIMIT 1");
            $stmt->execute([$productId, $userId]);
            $previousBidder = $stmt->fetchColumn();

            if ($previousBidder) {
                require_once 'NotificationManager.php';


                $notif = new NotificationManager($this->pdo);

                $notif->create($previousBidder, "Alguém cobriu a tua oferta no produto #$productId! Licita já novamente.");
            }

            return ['status' => 'success', 'message' => 'Licitação aceite!', 'xp_ganho' => $xpGanho];

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            return ['status' => 'error', 'message' => 'Erro ao processar: ' . $e->getMessage()];
        }
    }
}


