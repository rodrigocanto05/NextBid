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
           c.cat_name, u.usr_name,
           COUNT(b.bid_id) as total_bids,
           MAX(b.bid_amount) as highest_bid
    FROM product p
    JOIN categorie c ON p.prd_cat_id = c.cat_id
    JOIN userss u ON p.prd_usr_id = u.usr_id
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
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: white; }
        .navbar { background: #16213e; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; }
        .navbar a { color: white; text-decoration: none; margin-left: 20px; }
        .navbar a:hover { color: #C9A84C; }
        .logo { height: 50px; mix-blend-mode: lighten; }
        .container { padding: 30px; }
        h2 { margin-bottom: 20px; color: #aaa; }
        table { width: 100%; border-collapse: collapse; background: #16213e; border-radius: 10px; overflow: hidden; }
        th { background: #0f3460; padding: 15px; text-align: left; color: #aaa; }
        td { padding: 15px; border-bottom: 1px solid #0f3460; font-size: 14px; }
        tr:hover { background: #0f3460; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; }
        .badge-active { background: #28a745; }
        .badge-ended { background: #6c757d; }
        .badge-sold { background: #C9A84C; }
        .badge-expired { background: #856404; }
        .btn { padding: 6px 12px; border-radius: 5px; text-decoration: none; font-size: 13px; margin-right: 5px; }
        .btn-danger { background: #C9A84C; color: white; }
        .btn-info { background: #533483; color: white; }
        .logout { background: #C9A84C; padding: 8px 15px; border-radius: 5px; color: white !important; }
    </style>
</head>
<body>
    <div class="navbar">
<img src="nextbid_logo.png" alt="NextBid" class="logo" style="height: 70px; mix-blend-mode: lighten;">
        <div>
            <a href="dashboard.php">Dashboard</a>
            <a href="users.php">Utilizadores</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <h2>Gestão de Leilões (<?= count($auctions) ?>)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Nome</th><th>Vendedor</th><th>Categoria</th>
                    <th>Preço Inicial</th><th>Maior Licitação</th><th>Licitações</th>
                    <th>Estado</th><th>Termina em</th><th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($auctions as $a): ?>
                <tr>
                    <td><?= $a['prd_id'] ?></td>
                    <td><?= htmlspecialchars($a['prd_name']) ?></td>
                    <td><?= htmlspecialchars($a['usr_name']) ?></td>
                    <td><?= htmlspecialchars($a['cat_name']) ?></td>
                    <td><?= number_format($a['prd_start_price'], 2) ?>€</td>
                    <td><?= $a['highest_bid'] ? number_format($a['highest_bid'], 2) . '€' : '-' ?></td>
                    <td><?= $a['total_bids'] ?></td>
                    <td><span class="badge badge-<?= $a['prd_status'] ?>"><?= $a['prd_status'] ?></span></td>
                    <td><?= $a['prd_ends_at'] ?></td>
                    <td>
                        <a href="?toggle_status=<?= $a['prd_id'] ?>" class="btn btn-info">Mudar Estado</a>
                        <a href="?delete=<?= $a['prd_id'] ?>" class="btn btn-danger" onclick="return confirm('Tens a certeza?')">Apagar</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>