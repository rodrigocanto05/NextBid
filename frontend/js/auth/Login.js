const BASE_URL = 'http://localhost/backend';

document.getElementById('LoginPage').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${BASE_URL}/api/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.status === 'success') {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/frontend/hmtl/index.html';
        } else {
            mostrarErro(data.message || 'Credenciais inválidas');
        }
    } catch (err) {
        mostrarErro('Erro de ligação ao servidor');
    }
});

function mostrarErro(msg) {
    let el = document.getElementById('login-erro');
    if (!el) {
        el = document.createElement('p');
        el.id = 'login-erro';
        el.style.color = 'red';
        document.getElementById('LoginPage').appendChild(el);
    }
    el.textContent = msg;
}
