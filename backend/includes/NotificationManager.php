<?php
class NotificationManager {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(int $userId, string $message): bool {
        $sql = "INSERT INTO notifications (not_usr_id, not_message) VALUES (?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$userId, $message]);
    }

    public function getUnread(int $userId): array {
        $sql = "SELECT * FROM notifications 
                WHERE not_usr_id = ? AND not_read = 0
                ORDER BY not_created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead(int $ntfId): bool {
        $sql = "UPDATE notifications SET not_read = 1 WHERE not_id = ?";
        return $this->pdo->prepare($sql)->execute([$ntfId]);
    }
}