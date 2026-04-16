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

            $stmt = $this->pdo->prepare("SELECT prd_start_price, prd_usr_id, prd_status, prd_ends_at, prd_name FROM product WHERE prd_id = ? FOR UPDATE");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();

            if (!$product || $product['prd_status'] !== 'active') {
                $this->pdo->rollBack();
                return ['status' => 'error', 'message' => 'Este leilão já não está ativo.'];
            }

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

            require_once __DIR__ . '/functions.php';
            atribuirXPAleatorio($this->pdo, $userId, "Licitação no produto #$productId");

            $this->pdo->commit();

            $stmt = $this->pdo->prepare("SELECT bid_usr_id FROM bid WHERE bid_prd_id = ? AND bid_usr_id != ? ORDER BY bid_amount DESC LIMIT 1 OFFSET 1");
            $stmt->execute([$productId, $userId]);
            $previousBidder = $stmt->fetchColumn();

            if ($previousBidder) {
                require_once __DIR__ . '/NotificationManager.php';
                $notif = new NotificationManager($this->pdo);
                $notif->create(
                    (int) $previousBidder,
                    "Alguém cobriu a tua oferta em '{$product['prd_name']}'! Nova licitação de " . number_format($amount, 2) . "€.",
                    'bid_outbid'
                );
            }

            return ['status' => 'success', 'message' => 'Licitação aceite!'];

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            return ['status' => 'error', 'message' => 'Erro ao processar: ' . $e->getMessage()];
        }
    }

    public function getByProduct(int $productId, int $limit = 20): array {
        $stmt = $this->pdo->prepare(
            "SELECT b.bid_id, b.bid_amount, b.bid_created_at,
                    u.usr_id AS bidder_id, u.usr_name AS bidder_name, u.usr_photo AS bidder_photo
             FROM bid b
             INNER JOIN userss u ON b.bid_usr_id = u.usr_id
             WHERE b.bid_prd_id = ?
             ORDER BY b.bid_amount DESC, b.bid_created_at DESC
             LIMIT $limit"
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByUser(int $userId, int $limit = 50): array {
        $stmt = $this->pdo->prepare(
            "SELECT b.bid_id, b.bid_amount, b.bid_created_at,
                    p.prd_id, p.prd_name, p.prd_status, p.prd_ends_at,
                    (SELECT MAX(bid_amount) FROM bid WHERE bid_prd_id = p.prd_id) AS current_highest,
                    (SELECT img_path FROM product_image 
                     WHERE img_prd_id = p.prd_id 
                     ORDER BY img_is_primary DESC, img_id ASC LIMIT 1) AS main_image
             FROM bid b
             INNER JOIN product p ON b.bid_prd_id = p.prd_id
             WHERE b.bid_usr_id = ?
             ORDER BY b.bid_created_at DESC
             LIMIT $limit"
        );
        $stmt->execute([$userId]);
        $bids = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($bids as &$bid) {
            $bid['is_winning'] = (float) $bid['bid_amount'] >= (float) $bid['current_highest'];
        }

        return $bids;
    }
}