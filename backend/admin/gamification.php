<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

if (isset($_GET['delete'])) {
    $pdo->prepare("DELETE FROM gamification WHERE gme_id = ?")->execute([(int)$_GET['delete']]);
    header('Location: gamification.php');
    exit;
}

if (isset($_GET['expire'])) {
    $pdo->prepare("UPDATE gamification SET gme_status = 'expired' WHERE gme_id = ?")->execute([(int)$_GET['expire']]);
    header('Location: gamification.php');
    exit;
}

$events = $pdo->query("
    SELECT g.*, p.prd_name, w.usr_name AS winner_name,
           (SELECT COUNT(*) FROM gamification_claim WHERE gcl_gme_id = g.gme_id) as total_claims
    FROM gamification g
    JOIN product p ON g.gme_prd_id = p.prd_id
    LEFT JOIN userss w ON g.gme_winner_usr_id = w.usr_id
    ORDER BY g.gme_created_at DESC
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Gamificação - NextBid Admin</title>
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
        .badge-scheduled { background: #3498db; }
        .badge-claimed { background: #C9A84C; color: #1a1a2e; }
        .badge-expired { background: #856404; }
        .btn { padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; margin-right: 3px; }
        .btn-danger { background: #e74c3c; color: white; }
        .btn-warning { background: #856404; color: white; }
        .logout { background: #C9A84C; padding: 8px 15px; border-radius: 5px; color: #1a1a2e !important; font-weight: bold; }
        .winner { color: #C9A84C; font-weight: bold; }
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
            <a href="gamification.php" class="active">Gamificação</a>
            <a href="reviews.php">Reviews</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <h2>Gestão de Gamificação (<?= count($events) ?>)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Nome</th><th>Produto</th><th>XP</th><th>Raio</th>
                    <th>Participações</th><th>Vencedor</th><th>Estado</th>
                    <th>Início</th><th>Fim</th><th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($events as $e): ?>
                <tr>
                    <td><?= $e['gme_id'] ?></td>
                    <td><?= htmlspecialchars($e['gme_name']) ?></td>
                    <td><?= htmlspecialchars($e['prd_name']) ?></td>
                    <td><?= $e['gme_xp_reward'] ?></td>
                    <td><?= $e['gme_radius'] ?>m</td>
                    <td><?= $e['total_claims'] ?></td>
                    <td class="winner"><?= $e['winner_name'] ? htmlspecialchars($e['winner_name']) : '-' ?></td>
                    <td><span class="badge badge-<?= $e['gme_status'] ?>"><?= $e['gme_status'] ?></span></td>
                    <td><?= date('d/m H:i', strtotime($e['gme_starts_at'])) ?></td>
                    <td><?= date('d/m H:i', strtotime($e['gme_ends_at'])) ?></td>
                    <td>
                        <?php if (in_array($e['gme_status'], ['active', 'scheduled'])): ?>
                            <a href="?expire=<?= $e['gme_id'] ?>" class="btn btn-warning">Expirar</a>
                        <?php endif; ?>
                        <a href="?delete=<?= $e['gme_id'] ?>" class="btn btn-danger" onclick="return confirm('Apagar evento e todos os claims?')">Apagar</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>