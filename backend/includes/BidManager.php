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

            $stmt = $this->pdo->prepare("SELECT prd_start_price, prd_usr_id, prd_status, prd_ends_at FROM product WHERE prd_id = ? FOR UPDATE");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();

            if (!$product || $product['prd_status'] !== 'active') {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'Este leilão já não está ativo.'];
            }

            // FIX: rejeitar licitações em leilões cuja data de fim já passou
            if (strtotime($product['prd_ends_at']) < time()) {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'Este leilão já terminou.'];
            }

            if ($product['prd_usr_id'] == $userId) {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'Não podes licitar no teu próprio leilão.'];
            }

            $stmt = $this->pdo->prepare("SELECT MAX(bid_amount) as max_bid FROM bid WHERE bid_prd_id = ?");
            $stmt->execute([$productId]);
            $currentMax = $stmt->fetch()['max_bid'];
            $minimoNecessario = $currentMax ?? $product['prd_start_price'];

            if ($amount <= $minimoNecessario) {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'A tua licitação deve ser superior a ' . number_format($minimoNecessario, 2) . '€'];
            }

            $stmt = $this->pdo->prepare("INSERT INTO bid (bid_amount, bid_usr_id, bid_prd_id) VALUES (?, ?, ?)");
            $stmt->execute([$amount, $userId, $productId]);

            // FIX: usa a função partilhada em vez de duplicar lógica de XP
            require_once __DIR__ . '/functions.php';
            atribuirXPAleatorio($this->pdo, $userId, "Licitação no produto #$productId");

            $this->pdo->commit();

            $stmt = $this->pdo->prepare("SELECT bid_usr_id FROM bid WHERE bid_prd_id = ? AND bid_usr_id != ? ORDER BY bid_amount DESC LIMIT 1");
            $stmt->execute([$productId, $userId]);
            $previousBidder = $stmt->fetchColumn();

            if ($previousBidder) {
                require_once __DIR__ . '/NotificationManager.php';
                $notif = new NotificationManager($this->pdo);
                $notif->create($previousBidder, "Alguém cobriu a tua oferta no produto #$productId! Licita já novamente.");
            }

            return ['status' => 'success', 'message' => 'Licitação aceite!'];

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            return ['status' => 'error', 'message' => 'Erro ao processar: ' . $e->getMessage()];
        }
    }
}