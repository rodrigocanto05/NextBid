<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

$totalUsers     = $pdo->query("SELECT COUNT(*) FROM userss")->fetchColumn();
$activeAuctions = $pdo->query("SELECT COUNT(*) FROM product WHERE prd_status = 'active'")->fetchColumn();
$soldAuctions   = $pdo->query("SELECT COUNT(*) FROM product WHERE prd_status = 'sold'")->fetchColumn();
$totalBids      = $pdo->query("SELECT COUNT(*) FROM bid")->fetchColumn();
$catStats       = $pdo->query("SELECT c.cat_name, COUNT(p.prd_id) as total FROM product p JOIN category c ON p.prd_cat_id = c.cat_id GROUP BY c.cat_name")->fetchAll();
$topUsers       = $pdo->query("SELECT usr_name, usr_xp FROM userss ORDER BY usr_xp DESC LIMIT 5")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - NextBid Admin</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: white; }
        .navbar { background: #16213e; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; }
        .navbar a { color: white; text-decoration: none; margin-left: 20px; }
        .navbar a:hover { color: #C9A84C; }
        .logo { height: 50px; mix-blend-mode: lighten; }
        .container { padding: 30px; }
        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .card { background: #16213e; padding: 20px; border-radius: 10px; text-align: center; }
        .card h3 { font-size: 14px; color: #aaa; margin-bottom: 10px; }
        .card p { font-size: 36px; font-weight: bold; color: #C9A84C; }
        .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .chart-box { background: #16213e; padding: 20px; border-radius: 10px; }
        .chart-box h3 { margin-bottom: 15px; color: #aaa; }
        .logout { background: #C9A84C; padding: 8px 15px; border-radius: 5px; color: white !important; }
    </style>
</head>
<body>
    <div class="navbar">
<img src="nextbid_logo.png" alt="NextBid" class="logo" style="height: 70px; mix-blend-mode: lighten;">
        <div>
            <a href="users.php">Utilizadores</a>
            <a href="auctions.php">Leilões</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <div class="cards">
            <div class="card"><h3>Total Utilizadores</h3><p><?= $totalUsers ?></p></div>
            <div class="card"><h3>Leilões Ativos</h3><p><?= $activeAuctions ?></p></div>
            <div class="card"><h3>Leilões Vendidos</h3><p><?= $soldAuctions ?></p></div>
            <div class="card"><h3>Total Licitações</h3><p><?= $totalBids ?></p></div>
        </div>
        <div class="charts">
            <div class="chart-box"><h3>Leilões por Categoria</h3><canvas id="catChart"></canvas></div>
            <div class="chart-box"><h3>Top 5 Utilizadores por XP</h3><canvas id="xpChart"></canvas></div>
        </div>
    </div>
    <script>
        new Chart(document.getElementById('catChart'), {
            type: 'doughnut',
            data: {
                labels: <?= json_encode(array_column($catStats, 'cat_name')) ?>,
                datasets: [{ data: <?= json_encode(array_column($catStats, 'total')) ?>, backgroundColor: ['#C9A84C', '#0f3460', '#16213e', '#533483'] }]
            }
        });
        new Chart(document.getElementById('xpChart'), {
            type: 'bar',
            data: {
                labels: <?= json_encode(array_column($topUsers, 'usr_name')) ?>,
                datasets: [{ label: 'XP', data: <?= json_encode(array_column($topUsers, 'usr_xp')) ?>, backgroundColor: '#C9A84C' }]
            },
            options: { scales: { y: { ticks: { color: 'white' }, grid: { color: '#333' } }, x: { ticks: { color: 'white' } } }, plugins: { legend: { labels: { color: 'white' } } } }
        });
    </script>
</body>
</html>