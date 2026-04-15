<?php

class LevelManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserLevel(int $userId): array
    {
        $stmt = $this->pdo->prepare("SELECT usr_xp FROM userss WHERE usr_id = ?");
        $stmt->execute([$userId]);
        $xp = $stmt->fetchColumn();

        if ($xp === false) {
            return ['status' => 'error', 'message' => 'Utilizador não encontrado.'];
        }

        $xp = (int) $xp;

        $stmt = $this->pdo->prepare(
            "SELECT lvl_number, lvl_xp_required
             FROM xp_level
             WHERE lvl_xp_required <= ?
             ORDER BY lvl_xp_required DESC
             LIMIT 1"
        );
        $stmt->execute([$xp]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $this->pdo->prepare(
            "SELECT lvl_number, lvl_xp_required
             FROM xp_level
             WHERE lvl_xp_required > ?
             ORDER BY lvl_xp_required ASC
             LIMIT 1"
        );
        $stmt->execute([$xp]);
        $next = $stmt->fetch(PDO::FETCH_ASSOC);

        $progress = 0;
        $xpToNext = 0;

        if ($next) {
            $range    = (int) $next['lvl_xp_required'] - (int) $current['lvl_xp_required'];
            $gained   = $xp - (int) $current['lvl_xp_required'];
            $progress = $range > 0 ? round(($gained / $range) * 100, 1) : 0;
            $xpToNext = (int) $next['lvl_xp_required'] - $xp;
        } else {
            $progress = 100;
        }

        return [
            'status'         => 'success',
            'user_id'        => $userId,
            'current_xp'     => $xp,
            'current_level'  => (int) $current['lvl_number'],
            'next_level'     => $next ? (int) $next['lvl_number'] : null,
            'xp_to_next'     => $xpToNext,
            'progress'       => $progress
        ];
    }

    public function getLeaderboard(int $limit = 10): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT u.usr_id, u.usr_name, u.usr_xp, u.usr_photo,
                    (SELECT lvl_number FROM xp_level WHERE lvl_xp_required <= u.usr_xp ORDER BY lvl_xp_required DESC LIMIT 1) AS level
             FROM userss u
             WHERE u.usr_role = 'normaluser'
             ORDER BY u.usr_xp DESC
             LIMIT $limit"
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}