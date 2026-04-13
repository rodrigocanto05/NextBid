const BASE_URL = 'http://localhost/NextBid';

document.getElementById('RegisterPage').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('Nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const gender = document.getElementById('gênero').value;

    if (password.length < 8) {
        mostrarErro('A password deve ter pelo menos 8 caracteres');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, gender })
        });

        const data = await res.json();

        if (data.status === 'success') {
            alert('Registo efetuado com sucesso! Podes fazer login.');
            window.location.href = 'Login.html';
        } else {
            mostrarErro(data.message || 'Erro ao registar');
        }
    } catch (err) {
        mostrarErro('Erro de ligação ao servidor');
    }
});

function mostrarErro(msg) {
    let el = document.getElementById('register-erro');
    if (!el) {
        el = document.createElement('p');
        el.id = 'register-erro';
        el.style.color = 'red';
        document.getElementById('RegisterPage').appendChild(el);
    }
    el.textContent = msg;
}
