<?php

class UserManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function register(string $name, string $email, string $password, string $gender, int $age, string $bio, int $xp)
    {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $role = 'user';

        $sql = "INSERT INTO users (usr_name, usr_email, usr_password, usr_gender, usr_age, usr_bio, usr_xp, usr_role)
                VALUES (:name, :email, :password, :gender, :age, :bio, :xp, :role)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            'name'     => $name,
            'email'    => $email,
            'password' => $hash,
            'gender'   => $gender,
            'age'      => $age,
            'bio'      => $bio,
            'xp'       => $xp,
            'role'     => $role
        ]);
    }

    public function login(string $email, string $password)
    {
        $sql = "SELECT * FROM users WHERE usr_email = :email";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['usr_password'])) {
            try {
                $token = bin2hex(random_bytes(32));
                return [
                    "status" => 'success',
                    "token"  => $token,
                    'user'   => [
                        'id'   => $user['usr_id'],
                        'name' => $user['usr_name'],
                        'xp'   => $user['usr_xp']
                    ]
                ];
            } catch (\Exception $e) {
                return ['status' => 'error', 'message' => 'Erro ao gerar Token'];
            }
        }

        return ['status' => 'error', 'message' => 'Credenciais inválidas'];
    }

    public function getUserProfile(int $userId): array|bool
    {
        $sql = "SELECT usr_id, usr_name, usr_email, usr_xp, usr_photo, usr_bio, usr_age 
                FROM users WHERE usr_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();

        if ($user) {
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM products WHERE usr_id = ? AND prd_status = 'active'");
            $stmt->execute([$userId]);
            $user['active_auctions'] = $stmt->fetchColumn();

            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM bids WHERE usr_id = ?");
            $stmt->execute([$userId]);
            $user['total_bids'] = $stmt->fetchColumn();
        }

        return $user;
    }
}
