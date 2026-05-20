<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

if (isset($_GET['delete'])) {
    $pdo->prepare("DELETE FROM product WHERE prd_id = ?")->execute([(int)$_GET['delete']]);
    header('Location: auctions.php');
    exit;
}

if (isset($_GET['toggle_status'])) {
    $id = (int)$_GET['toggle_status'];
    $stmt = $pdo->prepare("SELECT prd_status FROM product WHERE prd_id = ?");
    $stmt->execute([$id]);
    $status = $stmt->fetchColumn();
    $newStatus = $status === 'active' ? 'ended' : 'active';
    $pdo->prepare("UPDATE product SET prd_status = ? WHERE prd_id = ?")->execute([$newStatus, $id]);
    header('Location: auctions.php');
    exit;
}

$auctions = $pdo->query("
    SELECT p.prd_id, p.prd_name, p.prd_status, p.prd_start_price, p.prd_ends_at,
           p.prd_location, c.cat_name, u.usr_name AS seller_name,
           w.usr_name AS winner_name,
           COUNT(b.bid_id) as total_bids,
           MAX(b.bid_amount) as highest_bid
    FROM product p
    JOIN category c ON p.prd_cat_id = c.cat_id
    JOIN userss u ON p.prd_usr_id = u.usr_id
    LEFT JOIN userss w ON p.prd_winner_usr_id = w.usr_id
    LEFT JOIN bid b ON p.prd_id = b.bid_prd_id
    GROUP BY p.prd_id
    ORDER BY p.prd_created_at DESC
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Leilões - NextBid Admin</title>
    <link rel="icon" href="../../frontend/img/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="../../frontend/img/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../../frontend/img/favicon-192.png">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: white; }
        .navbar { background: #16213e; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C9A84C; }
        .navbar a { color: #ccc; text-decoration: none; margin-left: 20px; padding: 5px 10px; border-radius: 5px; transition: all 0.2s; }
        .navbar a:hover, .navbar a.active { color: white; background: #0f3460; }
        .container { padding: 30px; max-width: 1400px; margin: 0 auto; }
        h2 { margin-bottom: 20px; color: #aaa; }
        table { width: 100%; border-collapse: collapse; background: #16213e; border-radius: 10px; overflow: hidden; }
        th { background: #0f3460; padding: 12px; text-align: left; color: #aaa; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #0f3460; font-size: 13px; }
        tr:hover { background: #0f3460; }
        .badge { padding: 3px 8px; border-radius: 12px; font-size: 11px; }
        .badge-active { background: #28a745; }
        .badge-ended { background: #6c757d; }
        .badge-sold { background: #C9A84C; color: #1a1a2e; }
        .badge-expired { background: #856404; }
        .btn { padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; margin-right: 3px; }
        .btn-danger { background: #e74c3c; color: white; }
        .btn-info { background: #533483; color: white; }
        .logout { background: #C9A84C; padding: 8px 15px; border-radius: 5px; color: #1a1a2e !important; font-weight: bold; }
        .winner { color: #C9A84C; font-weight: bold; }
    </style>
</head>
<body>
    <div class="navbar">
        <img src="../../frontend/img/logo-NextBid.png" alt="NextBid" class="logo" style="height: 70px; mix-blend-mode: lighten;">
        <div>
            <a href="dashboard.php">Dashboard</a>
            <a href="users.php">Utilizadores</a>
            <a href="auctions.php" class="active">Leilões</a>
            <a href="categories.php">Categorias</a>
            <a href="gamification.php">Gamificação</a>
            <a href="reviews.php">Reviews</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <h2>Gestão de Leilões (<?= count($auctions) ?>)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Nome</th><th>Vendedor</th><th>Categoria</th><th>Local</th>
                    <th>Preço</th><th>Maior Bid</th><th>Bids</th><th>Vencedor</th>
                    <th>Estado</th><th>Termina</th><th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($auctions as $a): ?>
                <tr>
                    <td><?= $a['prd_id'] ?></td>
                    <td><?= htmlspecialchars($a['prd_name']) ?></td>
                    <td><?= htmlspecialchars($a['seller_name']) ?></td>
                    <td><?= htmlspecialchars($a['cat_name']) ?></td>
                    <td><?= htmlspecialchars($a['prd_location'] ?? '-') ?></td>
                    <td><?= number_format($a['prd_start_price'], 2) ?>€</td>
                    <td><?= $a['highest_bid'] ? number_format($a['highest_bid'], 2) . '€' : '-' ?></td>
                    <td><?= $a['total_bids'] ?></td>
                    <td class="winner"><?= $a['winner_name'] ? htmlspecialchars($a['winner_name']) : '-' ?></td>
                    <td><span class="badge badge-<?= $a['prd_status'] ?>"><?= $a['prd_status'] ?></span></td>
                    <td><?= date('d/m H:i', strtotime($a['prd_ends_at'])) ?></td>
                    <td>
                        <a href="?toggle_status=<?= $a['prd_id'] ?>" class="btn btn-info">Estado</a>
                        <a href="?delete=<?= $a['prd_id'] ?>" class="btn btn-danger" onclick="return confirm('Tens a certeza?')">Apagar</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>