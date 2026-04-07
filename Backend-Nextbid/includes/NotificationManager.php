<?php

class  NotificationManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo){
        $this-> pdo = $pdo;
    }

    public function createNotification( int $userId, string $message): bool{
        $sql = "INSERT INTO notifications (user_id, ntf_message, ntf_status) VALUES (?, ?, 'Por ler')";
        return $this->pdo->prepare($sql)->execute([$userId, $message]);
    }

    Public function getUnread(int $usr_id): array{
        $sql = "SELECT * FROM notifications
                WHERE usr_id= ? AND ntf_status = 'unread'
                ORDER BY ntf_created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$usr_id]);
        return $stmt->fetchAll();
    }

    public function getRead(int $ntf_id): bool{
        $sql = "UPDATE notifications SET ntf_status = 'read' WHERE ntf_id = ?";
        return $this->pdo->prepare($sql)->execute([$ntf_id]);
    }

}
