<?php

require_once __DIR__ . '/NotificationManager.php';
require_once __DIR__ . '/functions.php';

class GamificationManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function createEvent(array $data): int|array
    {
        $required = ['name', 'prd_id', 'latitude', 'longitude', 'starts_at', 'ends_at'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return ['status' => 'error', 'message' => "Campo '$field' obrigatório."];
            }
        }

        $startsTs = strtotime($data['starts_at']);
        $endsTs   = strtotime($data['ends_at']);
        $revealTs = !empty($data['reveal_at']) ? strtotime($data['reveal_at']) : null;

        if ($startsTs >= $endsTs) {
            return ['status' => 'error', 'message' => 'Data de fim deve ser após a de início.'];
        }

        if ($revealTs !== null && ($revealTs < $startsTs || $revealTs > $endsTs)) {
            return ['status' => 'error', 'message' => 'Data de revelação deve estar dentro do período do evento.'];
        }

        $stmt = $this->pdo->prepare("SELECT prd_id FROM product WHERE prd_id = ?");
        $stmt->execute([$data['prd_id']]);
        if (!$stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Produto não encontrado.'];
        }

        $initialStatus = $startsTs <= time() ? 'active' : 'scheduled';

        $sql = "INSERT INTO gamification (
                    gme_name, gme_description, gme_xp_reward, gme_prd_id,
                    gme_latitude, gme_longitude, gme_radius, gme_verification_code,
                    gme_status, gme_starts_at, gme_reveal_at, gme_ends_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->pdo->prepare($sql);
        $ok = $stmt->execute([
            $data['name'],
            $data['description'] ?? null,
            (int) ($data['xp_reward'] ?? 0),
            (int) $data['prd_id'],
            (float) $data['latitude'],
            (float) $data['longitude'],
            (int) ($data['radius'] ?? 30),
            $data['verification_code'] ?? null,
            $initialStatus,
            date('Y-m-d H:i:s', $startsTs),
            $revealTs ? date('Y-m-d H:i:s', $revealTs) : null,
            date('Y-m-d H:i:s', $endsTs)
        ]);

        return $ok ? (int) $this->pdo->lastInsertId() : ['status' => 'error', 'message' => 'Erro ao criar evento.'];
    }

    public function joinHunt(int $userId, int $pointId): array
    {
        $stmt = $this->pdo->prepare("SELECT gme_id, gme_ends_at FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        $event = $stmt->fetch();

        if (!$event) {
            return ['status' => 'error', 'message' => 'Esta caça ao tesouro já não está disponível.'];
        }

        if (strtotime($event['gme_ends_at']) < time()) {
            return ['status' => 'error', 'message' => 'Esta caça ao tesouro já terminou.'];
        }

        $stmt = $this->pdo->prepare("SELECT gcl_id FROM gamification_claim WHERE gcl_gme_id = ? AND gcl_usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        if ($stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Já estás inscrito nesta caça!'];
        }

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare(
                "INSERT INTO gamification_claim (gcl_gme_id, gcl_usr_id, gcl_status) VALUES (?, ?, 'valid')"
            )->execute([$pointId, $userId]);

            $notif = new NotificationManager($this->pdo);
            $notif->create(
                $userId,
                "Inscrição confirmada! Aproxima-te do local indicado para reclamar a recompensa.",
                'gamification_joined'
            );

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Inscrição realizada! Boa caça.'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar inscrição.'];
        }
    }

    public function getNearbyPoints(float $lat, float $lng, int $radius = 5): array
    {
        $sql = "SELECT gme_id, gme_name, gme_description, gme_xp_reward,
                       gme_radius, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at,
                       CASE 
                           WHEN gme_reveal_at IS NULL OR gme_reveal_at <= NOW() THEN gme_latitude
                           ELSE NULL
                       END AS gme_latitude,
                       CASE 
                           WHEN gme_reveal_at IS NULL OR gme_reveal_at <= NOW() THEN gme_longitude
                           ELSE NULL
                       END AS gme_longitude,
                       CASE 
                           WHEN gme_reveal_at IS NOT NULL AND gme_reveal_at > NOW() THEN 1
                           ELSE 0
                       END AS is_hidden,
                       (6371 * acos(cos(radians(:lat)) * cos(radians(gme_latitude)) * cos(radians(gme_longitude) - radians(:lng2)) + sin(radians(:lat2)) * sin(radians(gme_latitude)))) AS distance
                FROM gamification
                WHERE gme_status = 'active'
                HAVING distance <= :radius
                ORDER BY distance ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'lat'    => $lat,
            'lat2'   => $lat,
            'lng2'   => $lng,
            'radius' => $radius
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function claimPoint(int $userId, int $pointId, float $userLat, float $userLng): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        $point = $stmt->fetch();

        if (!$point) {
            return ['status' => 'error', 'message' => 'Ponto de recompensa inválido ou já reclamado.'];
        }

        if ($point['gme_reveal_at'] && strtotime($point['gme_reveal_at']) > time()) {
            return ['status' => 'error', 'message' => 'Localização ainda não revelada. Aguarda até ' . $point['gme_reveal_at'] . '.'];
        }

        if (strtotime($point['gme_ends_at']) < time()) {
            return ['status' => 'error', 'message' => 'Esta caça ao tesouro já terminou.'];
        }

        $distanciaMetros = $this->calculateDistance($userLat, $userLng, $point['gme_latitude'], $point['gme_longitude']) * 1000;

        if ($distanciaMetros > $point['gme_radius']) {
            return [
                'status'  => 'error',
                'message' => 'Estás demasiado longe. Aproxima-te mais ' . round($distanciaMetros - $point['gme_radius']) . ' metros.'
            ];
        }

        $stmt = $this->pdo->prepare("SELECT gcl_id, gcl_status FROM gamification_claim WHERE gcl_gme_id = ? AND gcl_usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        $existing = $stmt->fetch();

        if ($existing && $existing['gcl_status'] === 'winner') {
            return ['status' => 'error', 'message' => 'Já reclamaste esta recompensa!'];
        }

        $this->pdo->beginTransaction();
        try {
            if ($existing) {
                $this->pdo->prepare("UPDATE gamification_claim SET gcl_status = 'winner' WHERE gcl_id = ?")
                    ->execute([$existing['gcl_id']]);
            } else {
                $this->pdo->prepare(
                    "INSERT INTO gamification_claim (gcl_gme_id, gcl_usr_id, gcl_status) VALUES (?, ?, 'winner')"
                )->execute([$pointId, $userId]);
            }

            $this->pdo->prepare(
                "UPDATE gamification SET gme_status = 'claimed', gme_winner_usr_id = ? WHERE gme_id = ?"
            )->execute([$userId, $pointId]);

            $this->pdo->prepare("UPDATE userss SET usr_xp = usr_xp + ? WHERE usr_id = ?")
                ->execute([$point['gme_xp_reward'], $userId]);

            $this->pdo->prepare("INSERT INTO xp_logs (xpl_usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)")
                ->execute([$userId, $point['gme_xp_reward'], "Recompensa da Caça ao Tesouro #" . $pointId]);

            $notif = new NotificationManager($this->pdo);
            $notif->create($userId, "Ganhaste {$point['gme_xp_reward']} XP na caça ao tesouro!", 'gamification_won');

            $this->pdo->commit();

            return [
                'status'   => 'success',
                'message'  => 'Parabéns! Ganhaste ' . $point['gme_xp_reward'] . ' XP.',
                'xp_ganho' => (int) $point['gme_xp_reward']
            ];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro interno ao processar a recompensa.'];
        }
    }

    public function claimPointWithCode(int $userId, int $pointId, float $userLat, float $userLng, string $inputCode): array
    {
        $stmt = $this->pdo->prepare("SELECT gcl_id, gcl_status FROM gamification_claim WHERE gcl_gme_id = ? AND gcl_usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        $claim = $stmt->fetch();

        if (!$claim) {
            return ['status' => 'error', 'message' => 'Não estás inscrito nesta caça ao tesouro.'];
        }

        if ($claim['gcl_status'] === 'winner') {
            return ['status' => 'error', 'message' => 'Já reclamaste esta recompensa.'];
        }

        $stmt = $this->pdo->prepare("SELECT * FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        $point = $stmt->fetch();

        if (!$point || $point['gme_verification_code'] !== $inputCode) {
            return ['status' => 'error', 'message' => 'Código de verificação incorreto ou tesouro já reclamado.'];
        }

        if (strtotime($point['gme_ends_at']) < time()) {
            return ['status' => 'error', 'message' => 'Este evento já terminou.'];
        }

        $distanciaMetros = $this->calculateDistance($userLat, $userLng, $point['gme_latitude'], $point['gme_longitude']) * 1000;
        if ($distanciaMetros > $point['gme_radius']) {
            return ['status' => 'error', 'message' => 'Estás no local errado!'];
        }

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare("UPDATE gamification_claim SET gcl_status = 'winner' WHERE gcl_id = ?")
                ->execute([$claim['gcl_id']]);

            $this->pdo->prepare(
                "UPDATE gamification SET gme_status = 'claimed', gme_winner_usr_id = ? WHERE gme_id = ?"
            )->execute([$userId, $pointId]);

            $this->pdo->prepare(
                "UPDATE gamification_claim SET gcl_status = 'invalid' WHERE gcl_gme_id = ? AND gcl_id != ?"
            )->execute([$pointId, $claim['gcl_id']]);

            $this->pdo->prepare("UPDATE userss SET usr_xp = usr_xp + ? WHERE usr_id = ?")
                ->execute([$point['gme_xp_reward'], $userId]);

            $this->pdo->prepare("INSERT INTO xp_logs (xpl_usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)")
                ->execute([$userId, $point['gme_xp_reward'], "Vencedor do item físico da Caça ao Tesouro #" . $pointId]);

            $notif = new NotificationManager($this->pdo);
            $notif->create($userId, "Código validado! O produto é oficialmente teu.", 'gamification_won');

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Código validado! O produto é oficialmente teu.'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar a coleta.'];
        }
    }

    /**
     * Lista os tesouros reclamados (ganhos) por um utilizador.
     * Faz JOIN com product para puxar o nome real do produto-prémio.
     */
    public function getClaimedByUser(int $userId): array
    {
        $sql = "SELECT g.gme_id, g.gme_name, g.gme_description, g.gme_xp_reward, g.gme_prd_id,
                       p.prd_name, c.gcl_claimed_at, c.gcl_status
                FROM gamification_claim c
                INNER JOIN gamification g ON g.gme_id = c.gcl_gme_id
                LEFT JOIN product p ON p.prd_id = g.gme_prd_id
                WHERE c.gcl_usr_id = :uid AND c.gcl_status = 'winner'
                ORDER BY c.gcl_claimed_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}