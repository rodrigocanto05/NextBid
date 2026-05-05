<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
require_once '../config/db.php';

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $name     = trim($_POST['name'] ?? '');
    $desc     = trim($_POST['description'] ?? '');
    $prdId    = (int) ($_POST['prd_id'] ?? 0);
    $xp       = (int) ($_POST['xp_reward'] ?? 0);
    $lat      = (float) ($_POST['latitude'] ?? 0);
    $lng      = (float) ($_POST['longitude'] ?? 0);
    $radius   = (int) ($_POST['radius'] ?? 30);
    $code     = trim($_POST['verification_code'] ?? '');
    $startsAt = $_POST['starts_at'] ?? '';
    $revealAt = trim($_POST['reveal_at'] ?? '');
    $endsAt   = $_POST['ends_at'] ?? '';

    if ($name === '' || $prdId <= 0 || $lat == 0 || $lng == 0 || $startsAt === '' || $endsAt === '') {
        $msg = 'Preenche todos os campos obrigatórios.';
    } elseif ($lat < -90 || $lat > 90) {
        $msg = 'Latitude inválida (deve estar entre -90 e 90).';
    } elseif ($lng < -180 || $lng > 180) {
        $msg = 'Longitude inválida (deve estar entre -180 e 180).';
    } else {
        $startsTs = strtotime($startsAt);
        $endsTs   = strtotime($endsAt);

        if ($startsTs >= $endsTs) {
            $msg = 'Data de fim deve ser após a de início.';
        } else {
            $initialStatus = $startsTs <= time() ? 'active' : 'scheduled';

            try {
                $stmt = $pdo->prepare("INSERT INTO gamification (
                    gme_name, gme_description, gme_xp_reward, gme_prd_id,
                    gme_latitude, gme_longitude, gme_radius, gme_verification_code,
                    gme_status, gme_starts_at, gme_reveal_at, gme_ends_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                $stmt->execute([
                    $name, $desc ?: null, $xp, $prdId,
                    $lat, $lng, $radius, $code ?: null,
                    $initialStatus,
                    date('Y-m-d H:i:s', $startsTs),
                    $revealAt ? date('Y-m-d H:i:s', strtotime($revealAt)) : null,
                    date('Y-m-d H:i:s', $endsTs)
                ]);

                $msg = 'Evento criado com sucesso!';
            } catch (PDOException $e) {
                $msg = 'Erro ao criar: ' . $e->getMessage();
            }
        }
    }
}

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

$products = $pdo->query("SELECT prd_id, prd_name FROM product WHERE prd_status = 'active' ORDER BY prd_name")->fetchAll();
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
        h3 { margin-bottom: 15px; color: #C9A84C; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .form-box { background: #16213e; padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #0f3460; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-grid.three { grid-template-columns: 1fr 1fr 1fr; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .form-group input, .form-group select, .form-group textarea { padding: 10px; border: 1px solid #0f3460; background: #0f3460; color: white; border-radius: 5px; font-size: 13px; }
        .form-group textarea { resize: vertical; min-height: 60px; }
        .form-group input:focus, .form-group select:focus { border-color: #C9A84C; outline: none; }
        .form-full { grid-column: 1 / -1; }
        .form-actions { margin-top: 15px; display: flex; gap: 10px; }
        .form-actions button { padding: 10px 25px; background: #C9A84C; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; }
        .form-actions button:hover { background: #a8893e; }
        .toggle-btn { background: none; border: 1px solid #C9A84C; color: #C9A84C; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 13px; margin-bottom: 15px; }
        .toggle-btn:hover { background: #C9A84C; color: #1a1a2e; }
        .hidden { display: none; }
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
        .msg { padding: 12px 20px; border-radius: 5px; margin-bottom: 15px; font-size: 14px; }
        .msg-success { background: #28a745; color: white; }
        .msg-error { background: #e74c3c; color: white; }
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

        <?php if ($msg): ?>
            <div class="msg <?= str_contains($msg, 'sucesso') ? 'msg-success' : 'msg-error' ?>"><?= $msg ?></div>
        <?php endif; ?>

        <button class="toggle-btn" onclick="document.getElementById('create-form').classList.toggle('hidden')">+ Criar novo evento</button>

        <div id="create-form" class="form-box hidden">
            <h3>Novo evento de caça ao tesouro</h3>
            <form method="POST">
                <input type="hidden" name="action" value="create">

                <div class="form-grid">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="name" placeholder="Ex: Tesouro do Rossio" required>
                    </div>
                    <div class="form-group">
                        <label>Produto associado *</label>
                        <select name="prd_id" required>
                            <option value="">Seleciona um produto</option>
                            <?php foreach ($products as $p): ?>
                                <option value="<?= $p['prd_id'] ?>"><?= htmlspecialchars($p['prd_name']) ?> (ID: <?= $p['prd_id'] ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="form-grid" style="margin-top: 12px;">
                    <div class="form-group form-full">
                        <label>Descrição</label>
                        <textarea name="description" placeholder="Descrição do evento (opcional)"></textarea>
                    </div>
                </div>

                <div class="form-grid three" style="margin-top: 12px;">
                    <div class="form-group">
                        <label>Latitude *</label>
                        <input type="number" step="0.0000001" min="-90" max="90" name="latitude" placeholder="38.7169" required>
                    </div>
                    <div class="form-group">
                        <label>Longitude *</label>
                        <input type="number" step="0.0000001" min="-180" max="180" name="longitude" placeholder="-9.1399" required>
                    </div>
                    <div class="form-group">
                        <label>Raio (metros)</label>
                        <input type="number" name="radius" value="30" min="5" max="5000">
                    </div>
                </div>

                <div class="form-grid three" style="margin-top: 12px;">
                    <div class="form-group">
                        <label>XP de recompensa</label>
                        <input type="number" name="xp_reward" value="100" min="0" max="10000">
                    </div>
                    <div class="form-group">
                        <label>Código de verificação</label>
                        <input type="text" name="verification_code" placeholder="Ex: 9999 (opcional)" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label>&nbsp;</label>
                    </div>
                </div>

                <div class="form-grid three" style="margin-top: 12px;">
                    <div class="form-group">
                        <label>Data início *</label>
                        <input type="datetime-local" name="starts_at" required>
                    </div>
                    <div class="form-group">
                        <label>Data revelação</label>
                        <input type="datetime-local" name="reveal_at">
                    </div>
                    <div class="form-group">
                        <label>Data fim *</label>
                        <input type="datetime-local" name="ends_at" required>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit">Criar evento</button>
                </div>
            </form>
        </div>

        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Nome</th><th>Produto</th><th>XP</th><th>Raio</th>
                    <th>Código</th><th>Participações</th><th>Vencedor</th><th>Estado</th>
                    <th>Início</th><th>Revelação</th><th>Fim</th><th>Ações</th>
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
                    <td><?= $e['gme_verification_code'] ? htmlspecialchars($e['gme_verification_code']) : '-' ?></td>
                    <td><?= $e['total_claims'] ?></td>
                    <td class="winner"><?= $e['winner_name'] ? htmlspecialchars($e['winner_name']) : '-' ?></td>
                    <td><span class="badge badge-<?= $e['gme_status'] ?>"><?= $e['gme_status'] ?></span></td>
                    <td><?= date('d/m H:i', strtotime($e['gme_starts_at'])) ?></td>
                    <td><?= $e['gme_reveal_at'] ? date('d/m H:i', strtotime($e['gme_reveal_at'])) : '-' ?></td>
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