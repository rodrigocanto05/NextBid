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

   
    public function joinHunt(int $userId, int $pointId): array
    {
        $stmt = $this->pdo->prepare("SELECT gme_id FROM gamification WHERE gme_id = ? AND gme_status = 'active'");
        $stmt->execute([$pointId]);
        if (!$stmt->fetch()) {
            return ['status' => 'error', 'message' => 'Esta caça ao tesouro já não está disponível.'];
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
            $notif->create($userId, "Inscrição confirmada! Aproxima-te do local indicado para reclamar a recompensa.");

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Inscrição realizada! Boa caça.'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar inscrição.'];
        }
    }

   
    public function getNearbyPoints(float $lat, float $lng, int $radius = 5): array
    {
        $sql = "SELECT *,
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

            $this->pdo->commit();
            return ['status' => 'success', 'message' => 'Código validado! O produto é oficialmente teu.'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['status' => 'error', 'message' => 'Erro ao processar a coleta.'];
        }
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
