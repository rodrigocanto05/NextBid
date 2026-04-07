<?php

class AuctionManager {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function createAuction(array $data): int|bool {
        $sql = "INSERT INTO products (
                    prd_name, prd_description, cat_id, prd_condition, 
                    prd_start_price, prd_location, prd_latitude, 
                    prd_longitude, prd_ends_at, usr_id
                ) VALUES (
                    :name, :desc, :cat, :cond, :price, :loc, :lat, :lng, :ends, :uid
                )";

        $stmt = $this->pdo->prepare($sql);
        $res = $stmt->execute([
            ':name'  => $data['name'],
            ':desc'  => $data['description'],
            ':cat'   => $data['category'],
            ':cond'  => $data['condition'],
            ':price' => $data['price'],
            ':loc'   => $data['location'],
            ':lat'   => $data['lat'],
            ':lng'   => $data['long'],
            ':ends'  => $data['ends'],
            ':uid'   => $data['uid']
        ]);

        return $res ? (int) $this->pdo->lastInsertId() : false;
    }

    public function addImage(int $productId, string $path): bool {
        $sql = "INSERT INTO product_images (img_path, prd_id) VALUES (?, ?)";
        return $this->pdo->prepare($sql)->execute([$path, $productId]);
    }


    public function getActiveAuctions(?float $userLat = null, ?float $userLng = null, int $raio = 50): array {
        $geoQuery = "";
        $params = ["raio" => $raio];

        if ($userLat !== null && $userLng !== null) {
            $geoQuery = ", (6371 * acos(cos(radians(:lat)) * cos(radians(prd_latitude)) * cos(radians(prd_longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(prd_latitude)))) AS distance";
            $params["lat"] = $userLat;
            $params["lng"] = $userLng;
        }

        $sql = "SELECT p.*, c.cat_name, MIN(i.img_path) as main_image $geoQuery
                FROM products p
                INNER JOIN categories c ON p.cat_id = c.cat_id
                LEFT JOIN product_images i ON p.prd_id = i.prd_id
                WHERE p.prd_status = 'active' 
                GROUP BY p.prd_id
                HAVING (distance IS NULL OR distance <= :raio)
                ORDER BY p.prd_id DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}

