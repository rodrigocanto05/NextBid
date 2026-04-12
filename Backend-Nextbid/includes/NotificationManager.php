<?php
class NotificationManager {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(int $userId, string $message): bool {
        $sql = "INSERT INTO notifications (usr_id, ntf_message, ntf_status) VALUES (?, ?, 'unread')";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$userId, $message]);
    }

    public function getUnread(int $userId): array {
        $sql = "SELECT * FROM notifications 
                WHERE usr_id = ? AND ntf_status = 'unread' 
                ORDER BY ntf_created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead(int $ntfId): bool {
        $sql = "UPDATE notifications SET ntf_status = 'read' WHERE ntf_id = ?";
        return $this->pdo->prepare($sql)->execute([$ntfId]);
    }
}
