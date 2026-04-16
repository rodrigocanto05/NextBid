<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

if (isset($_GET['delete'])) {
    $pdo->prepare("DELETE FROM review WHERE rev_id = ?")->execute([(int)$_GET['delete']]);
    header('Location: reviews.php');
    exit;
}

$reviews = $pdo->query("
    SELECT r.rev_id, r.rev_rating, r.rev_created_at,
           buyer.usr_name AS buyer_name,
           seller.usr_name AS seller_name,
           p.prd_name
    FROM review r
    INNER JOIN userss buyer ON r.rev_usr_id = buyer.usr_id
    INNER JOIN userss seller ON r.rev_reviewed_usr_id = seller.usr_id
    INNER JOIN product p ON r.rev_prd_id = p.prd_id
    ORDER BY r.rev_created_at DESC
")->fetchAll();

$avgRating = $pdo->query("SELECT ROUND(AVG(rev_rating), 2) FROM review")->fetchColumn();
$totalReviews = count($reviews);

$distribution = $pdo->query("SELECT rev_rating, COUNT(*) as total FROM review GROUP BY rev_rating ORDER BY rev_rating DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Reviews - NextBid Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: white; }
        .navbar { background: #16213e; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C9A84C; }
        .navbar a { color: #ccc; text-decoration: none; margin-left: 20px; padding: 5px 10px; border-radius: 5px; transition: all 0.2s; }
        .navbar a:hover, .navbar a.active { color: white; background: #0f3460; }
        .container { padding: 30px; max-width: 1200px; margin: 0 auto; }
        h2 { margin-bottom: 20px; color: #aaa; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #16213e; padding: 20px; border-radius: 10px; text-align: center; flex: 1; border: 1px solid #0f3460; }
        .stat-card h3 { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 8px; }
        .stat-card p { font-size: 28px; color: #C9A84C; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; background: #16213e; border-radius: 10px; overflow: hidden; }
        th { background: #0f3460; padding: 12px; text-align: left; color: #aaa; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #0f3460; font-size: 13px; }
        tr:hover { background: #0f3460; }
        .stars { color: #C9A84C; }
        .btn { padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; }
        .btn-danger { background: #e74c3c; color: white; }
        .logout { background: #C9A84C; padding: 8px 15px; border-radius: 5px; color: #1a1a2e !important; font-weight: bold; }
    </style>
</head>
<body>
    <div class="navbar">
        <img src="nextbid_logo.png" alt="NextBid" class="logo" style="height: 70px; mix-blend-mode: lighten;">
        <div>
            <a href="dashboard.php">Dashboard</a>
            <a href="users.php">Utilizadores</a>
            <a href="auctions.php">Leilões</a>
            <a href="categories.php">Categorias</a>
            <a href="gamification.php">Gamificação</a>
            <a href="reviews.php" class="active">Reviews</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <h2>Reviews (<?= $totalReviews ?>)</h2>
        <div class="stats">
            <div class="stat-card"><h3>Total</h3><p><?= $totalReviews ?></p></div>
            <div class="stat-card"><h3>Média</h3><p><?= $avgRating ?: '0' ?> ★</p></div>
            <?php foreach ($distribution as $d): ?>
            <div class="stat-card"><h3><?= $d['rev_rating'] ?> ★</h3><p><?= $d['total'] ?></p></div>
            <?php endforeach; ?>
        </div>
        <table>
            <thead><tr><th>ID</th><th>Comprador</th><th>Vendedor</th><th>Produto</th><th>Avaliação</th><th>Data</th><th>Ações</th></tr></thead>
            <tbody>
                <?php foreach ($reviews as $r): ?>
                <tr>
                    <td><?= $r['rev_id'] ?></td>
                    <td><?= htmlspecialchars($r['buyer_name']) ?></td>
                    <td><?= htmlspecialchars($r['seller_name']) ?></td>
                    <td><?= htmlspecialchars($r['prd_name']) ?></td>
                    <td class="stars"><?= str_repeat('★', $r['rev_rating']) . str_repeat('☆', 5 - $r['rev_rating']) ?></td>
                    <td><?= date('d/m/Y H:i', strtotime($r['rev_created_at'])) ?></td>
                    <td><a href="?delete=<?= $r['rev_id'] ?>" class="btn btn-danger" onclick="return confirm('Apagar review?')">Apagar</a></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>