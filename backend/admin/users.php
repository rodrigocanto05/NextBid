<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

if (isset($_GET['delete'])) {
    $pdo->prepare("DELETE FROM userss WHERE usr_id = ?")->execute([(int)$_GET['delete']]);
    header('Location: users.php');
    exit;
}

if (isset($_GET['toggle_role'])) {
    $id = (int)$_GET['toggle_role'];
    $stmt = $pdo->prepare("SELECT usr_role FROM userss WHERE usr_id = ?");
    $stmt->execute([$id]);
    $role = $stmt->fetchColumn();
    $newRole = $role === 'admin' ? 'normaluser' : 'admin';
    $pdo->prepare("UPDATE userss SET usr_role = ? WHERE usr_id = ?")->execute([$newRole, $id]);
    header('Location: users.php');
    exit;
}

$users = $pdo->query("SELECT usr_id, usr_name, usr_email, usr_role, usr_xp, usr_created_at FROM userss ORDER BY usr_created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Utilizadores - NextBid Admin</title>
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
        td { padding: 15px; border-bottom: 1px solid #0f3460; }
        tr:hover { background: #0f3460; }
        .badge-admin { background: #C9A84C; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
        .badge-user { background: #0f3460; border: 1px solid #aaa; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
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
            <a href="auctions.php">Leilões</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <h2>Gestão de Utilizadores (<?= count($users) ?>)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Nome</th><th>Email</th><th>Role</th>
                    <th>XP</th><th>Registado em</th><th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $u): ?>
                <tr>
                    <td><?= $u['usr_id'] ?></td>
                    <td><?= htmlspecialchars($u['usr_name']) ?></td>
                    <td><?= htmlspecialchars($u['usr_email']) ?></td>
                    <td><span class="badge-<?= $u['usr_role'] === 'admin' ? 'admin' : 'user' ?>"><?= $u['usr_role'] ?></span></td>
                    <td><?= $u['usr_xp'] ?> XP</td>
                    <td><?= $u['usr_created_at'] ?></td>
                    <td>
                        <a href="?toggle_role=<?= $u['usr_id'] ?>" class="btn btn-info">Mudar Role</a>
                        <a href="?delete=<?= $u['usr_id'] ?>" class="btn btn-danger" onclick="return confirm('Tens a certeza?')">Apagar</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>