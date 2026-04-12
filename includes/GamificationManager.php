<?php

class GamificationManager {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // Isto é da caça ao tesouro ainda tou a fazer
    public function joinHunt(int $userId, int $pointId): array {
        $stmt = $this->pdo->prepare("SELECT gme_id, gme_status FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        if (!$stmt->fetch()) return ['status' => 'error', 'message' => 'Esta caça ao tesouro já não está disponível.'];

        $stmt = $this->pdo->prepare("SELECT gcl_id FROM gamification_claim WHERE gcl_gme_id = ? AND gcl_usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        if ($stmt->fetch()) return ['status' => 'error', 'message' => 'Já estás inscrito nesta caça!'];

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare("INSERT INTO gamification_claim (gcl_gme_id, gcl_usr_id) VALUES (?, ?)");
            $stmt->execute([$pointId, $userId]);

            require_once 'NotificationManager.php';
            $notif = new NotificationManager($this->pdo);
            $notif->create($userId, "Inscrição confirmada! O item está num raio de 10km. Fica atento ao mapa para a revelação exata.");

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Inscrição realizada! Boa caça.'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar inscrição.'];
        }
    }

    public function getNearbyPoints(float $lat, float $lng, int $radius = 5): array {
        $sql = "SELECT *,
            (6371 * acos(cos(radians(:lat)) * cos(radians(gme_latitude)) * cos(radians(gme_longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gme_latitude)))) AS distance 
            FROM gamification 
            WHERE gme_status = 'active'
            HAVING distance <= :radius 
            ORDER BY distance ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['lat' => $lat, 'lng' => $lng, 'radius' => $radius]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function claimPoint(int $userId, int $pointId, float $userLat, float $userLng): array {
        $stmt = $this->pdo->prepare("SELECT * FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        $point = $stmt->fetch();

        if (!$point) {
            return ['status' => 'error', 'message' => 'Ponto de recompensa inválido ou expirado.'];
        }

        $stmt = $this->pdo->prepare("SELECT gcl_id FROM gamification_claim WHERE gcl_gme_id = ? AND gcl_usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        if ($stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Já recolheste esta recompensa!'];
        }

        $distancia = $this->calculateDistance($userLat, $userLng, $point['gme_latitude'], $point['gme_longitude']);
        $raioEmKm = $point['gme_radius'] / 1000;

        if ($distancia > $raioEmKm) {
            return [
                'status' => 'error',
                'message' => 'Estás demasiado longe. Aproxima-te mais ' . round(($distancia * 1000) - $point['gme_radius']) . ' metros.'
            ];
        }

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare("INSERT INTO gamification_claim (gcl_gme_id, gcl_usr_id) VALUES (?, ?)");
            $stmt->execute([$pointId, $userId]);

            $stmt = $this->pdo->prepare("UPDATE userss SET usr_xp = usr_xp + ? WHERE usr_id = ?");
            $stmt->execute([$point['gme_xp_reward'], $userId]);

            $stmt = $this->pdo->prepare("INSERT INTO xp_logs (xpl_usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $point['gme_xp_reward'], "Recompensa da Caça ao Tesouro #" . $pointId]);

            $this->pdo->commit();

            return [
                'status' => 'success',
                'message' => 'Parabéns! Ganhaste ' . $point['gme_xp_reward'] . ' XP.',
                'xp_ganho' => $point['gme_xp_reward']
            ];

        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro interno ao processar a recompensa.'];
        }
    }

    public function claimPointWithCode(int $userId, int $pointId, float $userLat, float $userLng, string $inputCode): array {
        $stmt = $this->pdo->prepare("SELECT gcl_id FROM gamification_claim WHERE gcl_gme_id = ? AND gcl_usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        if (!$stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Não estás inscrito nesta caça ao tesouro.'];
        }

        $stmt = $this->pdo->prepare("SELECT * FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        $point = $stmt->fetch();

        if (!$point || $point['gme_verification_code'] !== $inputCode) {
            return ['status' => 'error', 'message' => 'Código de verificação incorreto ou tesouro já reclamado.'];
        }

        $distancia = $this->calculateDistance($userLat, $userLng, $point['gme_latitude'], $point['gme_longitude']);
        if ($distancia > ($point['gme_radius'] / 1000)) {
            return ['status' => 'error', 'message' => 'Estás no local errado!'];
        }

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare("UPDATE gamification SET gme_status = 'claimed' WHERE gme_id = ?")->execute([$pointId]);

            $this->pdo->prepare("INSERT INTO gamification_claim (gcl_gme_id, gcl_usr_id) VALUES (?, ?)")->execute([$pointId, $userId]);

            $this->pdo->prepare("INSERT INTO xp_logs (xpl_usr_id, xpl_amount, xpl_reason) VALUES (?, ?, ?)")
                ->execute([$userId, $point['gme_xp_reward'], "Vencedor do item físico da Caça ao Tesouro #" . $pointId]);

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Código validado! O produto é oficialmente teu.'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar a coleta.'];
        }
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float|int {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }
}