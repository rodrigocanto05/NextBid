<?php

class UserManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function register(string $name, string $email, string $password, string $gender, string $birthdate, string $bio, int $xp): bool
    {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $role = 'normaluser';

        $sql = "INSERT INTO userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_bio, usr_xp, usr_role)
                VALUES (:name, :email, :password, :gender, :birthdate, :bio, :xp, :role)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            'name'      => $name,
            'email'     => $email,
            'password'  => $hash,
            'gender'    => $gender,
            'birthdate' => $birthdate,
            'bio'       => $bio,
            'xp'        => $xp,
            'role'      => $role
        ]);
    }

    public function login(string $email, string $password): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM userss WHERE usr_email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['usr_password'])) {
            return ['status' => 'error', 'message' => 'Credenciais inválidas. Tente novamente.'];
        }

        try {
            $token     = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

            $this->pdo->prepare(
                "INSERT INTO auth_tokens (tok_usr_id, tok_token, tok_expires_at) VALUES (?, ?, ?)"
            )->execute([$user['usr_id'], $token, $expiresAt]);

            return [
                'status'     => 'success',
                'token'      => $token,
                'expires_at' => $expiresAt,
                'user'       => [
                    'id'    => (int) $user['usr_id'],
                    'name'  => $user['usr_name'],
                    'email' => $user['usr_email'],
                    'role'  => $user['usr_role'],
                    'xp'    => (int) $user['usr_xp']
                ]
            ];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => 'Erro ao gerar sessão.'];
        }
    }

    public function logout(string $token): bool
    {
        return $this->pdo->prepare("DELETE FROM auth_tokens WHERE tok_token = ?")->execute([$token]);
    }

    public function logoutAll(int $userId): bool
    {
        return $this->pdo->prepare("DELETE FROM auth_tokens WHERE tok_usr_id = ?")->execute([$userId]);
    }

    public function getUserProfile(int $userId): array|bool
    {
        $sql = "SELECT usr_id, usr_name, usr_email, usr_xp, usr_photo, usr_bio, usr_birthdate, usr_balance
                FROM userss
                WHERE usr_id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();

        if ($user) {
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM product WHERE prd_usr_id = ? AND prd_status = 'active'");
            $stmt->execute([$userId]);
            $user['active_auctions'] = (int) $stmt->fetchColumn();

            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM bid WHERE bid_usr_id = ?");
            $stmt->execute([$userId]);
            $user['total_bids'] = (int) $stmt->fetchColumn();
        }

        return $user;
    }

    public function cleanExpiredTokens(): int
    {
        return (int) $this->pdo->exec("DELETE FROM auth_tokens WHERE tok_expires_at < NOW()");
    }
}