<?php

class ChatManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getByProduct(int $productId, int $limit = 100): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT c.cht_id, c.cht_content, c.cht_created_at,
                    u.usr_id  AS user_id,
                    u.usr_name AS user_name,
                    u.usr_photo AS user_photo
             FROM chat_message c
             INNER JOIN userss u ON c.cht_usr_id = u.usr_id
             WHERE c.cht_prd_id = ?
             ORDER BY c.cht_created_at ASC, c.cht_id ASC
             LIMIT $limit"
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getNewMessages(int $productId, int $afterId, int $limit = 50): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT c.cht_id, c.cht_content, c.cht_created_at,
                    u.usr_id  AS user_id,
                    u.usr_name AS user_name,
                    u.usr_photo AS user_photo
             FROM chat_message c
             INNER JOIN userss u ON c.cht_usr_id = u.usr_id
             WHERE c.cht_prd_id = ? AND c.cht_id > ?
             ORDER BY c.cht_created_at ASC, c.cht_id ASC
             LIMIT $limit"
        );
        $stmt->execute([$productId, $afterId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function send(int $userId, int $productId, string $content): array
    {
        $content = trim($content);

        if ($content === '') {
            return ['status' => 'error', 'message' => 'Mensagem vazia.'];
        }

        if (mb_strlen($content) > 500) {
            return ['status' => 'error', 'message' => 'Mensagem demasiado longa (máx. 500).'];
        }

        $stmt = $this->pdo->prepare("SELECT prd_id FROM product WHERE prd_id = ?");
        $stmt->execute([$productId]);
        if (!$stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Leilão não encontrado.'];
        }

        $stmt = $this->pdo->prepare(
            "INSERT INTO chat_message (cht_prd_id, cht_usr_id, cht_content) VALUES (?, ?, ?)"
        );
        $stmt->execute([$productId, $userId, $content]);

        return [
            'status'  => 'success',
            'message' => 'Mensagem enviada.',
            'cht_id'  => (int) $this->pdo->lastInsertId()
        ];
    }
}
