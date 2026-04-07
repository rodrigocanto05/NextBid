<?php

class GamificationManager {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
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
        return $stmt->fetchAll();
    }

    public function claimPoint(int $userId, int $pointId, float $userLat, float $userLng): array {
        // Verifica primeiro se o ponto existe e se o mesmo está ativo
        $stmt = $this->pdo->prepare("SELECT * FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        $point = $stmt->fetch();

        if (!$point) {
            return ['status' => 'error', 'message' => 'Ponto de recompensa inválido ou expirado.'];
        }

        $stmt = $this->pdo->prepare("SELECT gcl_id FROM gamification_claims WHERE gme_id = ? AND usr_id = ?");
        $stmt->execute([$pointId, $userId]);
        if ($stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Já recolheste esta recompensa!'];
        }

        $distancia = $this->calculateDistance($userLat, $userLng, $point['gme_latitude'], $point['gme_longitude']);

        if ($distancia > ($point['gme_radius'] / 1000)) { // gme_radius está em metros, convertemos para KM
            return ['status' => 'error', 'message' => 'Estás demasiado longe. Aproxima-te mais ' . round(($distancia * 1000) - $point['gme_radius']) . ' metros.'];
        }

        $this->pdo->beginTransaction();
        try {

            $stmt = $this->pdo->prepare("INSERT INTO gamification_claims (gme_id, usr_id) VALUES (?, ?)");
            $stmt->execute([$pointId, $userId]);

            $stmt = $this->pdo->prepare("UPDATE users SET usr_xp = usr_xp + ? WHERE usr_id = ?");
            $stmt->execute([$point['gme_xp_reward'], $userId]);

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Parabéns! Ganhaste ' . $point['gme_xp_reward'] . ' XP.', 'xp_ganho' => $point['gme_xp_reward']];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar a recompensa.'];
        }
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2) {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }
}
