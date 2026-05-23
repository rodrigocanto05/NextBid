<?php

class ReviewManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function create(int $reviewerId, int $productId, int $rating): array
    {
        if ($rating < 1 || $rating > 5) {
            return ['status' => 'error', 'message' => 'A avaliação tem de ser entre 1 e 5.'];
        }

        $stmt = $this->pdo->prepare(
            "SELECT prd_usr_id, prd_winner_usr_id, prd_status FROM product WHERE prd_id = ?"
        );
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        if (!$product) {
            return ['status' => 'error', 'message' => 'Leilão inexistente.'];
        }

        if (!in_array($product['prd_status'], ['sold', 'ended'])) {
            return ['status' => 'error', 'message' => 'Só podes avaliar leilões concluídos.'];
        }

        if ((int) $product['prd_winner_usr_id'] !== $reviewerId) {
            return ['status' => 'error', 'message' => 'Só o vencedor pode avaliar o vendedor.'];
        }

        $sellerId = (int) $product['prd_usr_id'];

        $stmt = $this->pdo->prepare("SELECT rev_id FROM review WHERE rev_usr_id = ? AND rev_prd_id = ?");
        $stmt->execute([$reviewerId, $productId]);
        if ($stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Já avaliaste este vendedor para este leilão.'];
        }

        try {
            $this->pdo->prepare(
                "INSERT INTO review (rev_usr_id, rev_reviewed_usr_id, rev_prd_id, rev_rating)
                 VALUES (?, ?, ?, ?)"
            )->execute([$reviewerId, $sellerId, $productId, $rating]);

            return ['status' => 'success', 'message' => 'Avaliação registada.'];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => 'Erro ao gravar avaliação.'];
        }
    }

}