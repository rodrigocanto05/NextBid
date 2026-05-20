<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'create' && !empty(trim($_POST['name']))) {
        try {
            $pdo->prepare("INSERT INTO category (cat_name) VALUES (?)")->execute([trim($_POST['name'])]);
            $msg = 'Categoria criada.';
        } catch (PDOException $e) {
            $msg = 'Erro: já existe uma categoria com esse nome.';
        }
    }
    if ($_POST['action'] === 'update' && !empty(trim($_POST['name']))) {
        try {
            $pdo->prepare("UPDATE category SET cat_name = ? WHERE cat_id = ?")->execute([trim($_POST['name']), (int)$_POST['cat_id']]);
            $msg = 'Categoria atualizada.';
        } catch (PDOException $e) {
            $msg = 'Erro ao atualizar.';
        }
    }
}

if (isset($_GET['delete'])) {
    $catId = (int)$_GET['delete'];
    $count = $pdo->prepare("SELECT COUNT(*) FROM product WHERE prd_cat_id = ?");
    $count->execute([$catId]);
    if ((int)$count->fetchColumn() > 0) {
        $msg = 'Não podes apagar: há produtos nesta categoria.';
    } else {
        $pdo->prepare("DELETE FROM category WHERE cat_id = ?")->execute([$catId]);
        header('Location: categories.php');
        exit;
    }
}

$categories = $pdo->query("
    SELECT c.cat_id, c.cat_name,
           (SELECT COUNT(*) FROM product WHERE prd_cat_id = c.cat_id) as total_products,
           (SELECT COUNT(*) FROM product WHERE prd_cat_id = c.cat_id AND prd_status = 'active') as active_products
    FROM category c
    ORDER BY c.cat_name
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Categorias - NextBid Admin</title>
    <link rel="icon" href="../../frontend/img/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="../../frontend/img/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../../frontend/img/favicon-192.png">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: white; }
        .navbar { background: #16213e; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C9A84C; }
        .navbar a { color: #ccc; text-decoration: none; margin-left: 20px; padding: 5px 10px; border-radius: 5px; transition: all 0.2s; }
        .navbar a:hover, .navbar a.active { color: white; background: #0f3460; }
        .container { padding: 30px; max-width: 1000px; margin: 0 auto; }
        h2 { margin-bottom: 20px; color: #aaa; }
        .form-box { background: #16213e; padding: 20px; border-radius: 10px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center; }
        .form-box input { padding: 10px; border: 1px solid #0f3460; background: #0f3460; color: white; border-radius: 5px; flex: 1; }
        .form-box button { padding: 10px 20px; background: #C9A84C; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; background: #16213e; border-radius: 10px; overflow: hidden; }
        th { background: #0f3460; padding: 12px; text-align: left; color: #aaa; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #0f3460; }
        tr:hover { background: #0f3460; }
        .btn { padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; margin-right: 3px; }
        .btn-danger { background: #e74c3c; color: white; }
        .btn-info { background: #533483; color: white; cursor: pointer; border: none; }
        .msg { background: #0f3460; padding: 10px 20px; border-radius: 5px; margin-bottom: 15px; color: #C9A84C; }
        .logout { background: #C9A84C; padding: 8px 15px; border-radius: 5px; color: #1a1a2e !important; font-weight: bold; }
    </style>
</head>
<body>
    <div class="navbar">
        <img src="../../frontend/img/logo-NextBid.png" alt="NextBid" class="logo" style="height: 70px; mix-blend-mode: lighten;">
        <div>
            <a href="dashboard.php">Dashboard</a>
            <a href="users.php">Utilizadores</a>
            <a href="auctions.php">Leilões</a>
            <a href="categories.php" class="active">Categorias</a>
            <a href="gamification.php">Gamificação</a>
            <a href="reviews.php">Reviews</a>
            <a href="logout.php" class="logout">Sair</a>
        </div>
    </div>
    <div class="container">
        <h2>Gestão de Categorias (<?= count($categories) ?>)</h2>
        <?php if ($msg): ?><div class="msg"><?= $msg ?></div><?php endif; ?>
        <form method="POST" class="form-box">
            <input type="hidden" name="action" value="create">
            <input type="text" name="name" placeholder="Nome da nova categoria" required>
            <button type="submit">Criar</button>
        </form>
        <table>
            <thead><tr><th>ID</th><th>Nome</th><th>Produtos</th><th>Ativos</th><th>Ações</th></tr></thead>
            <tbody>
                <?php foreach ($categories as $c): ?>
                <tr>
                    <td><?= $c['cat_id'] ?></td>
                    <td>
                        <form method="POST" style="display: flex; gap: 5px; align-items: center;">
                            <input type="hidden" name="action" value="update">
                            <input type="hidden" name="cat_id" value="<?= $c['cat_id'] ?>">
                            <input type="text" name="name" value="<?= htmlspecialchars($c['cat_name']) ?>" style="background:#0f3460;border:1px solid #333;color:white;padding:5px;border-radius:3px;width:200px;">
                            <button type="submit" class="btn btn-info">Guardar</button>
                        </form>
                    </td>
                    <td><?= $c['total_products'] ?></td>
                    <td><?= $c['active_products'] ?></td>
                    <td>
                        <?php if ($c['total_products'] == 0): ?>
                            <a href="?delete=<?= $c['cat_id'] ?>" class="btn btn-danger" onclick="return confirm('Apagar?')">Apagar</a>
                        <?php else: ?>
                            <span style="color:#666;font-size:12px;">Tem produtos</span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>