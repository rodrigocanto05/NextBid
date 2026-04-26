const BASE_URL = 'http://localhost/backend';

document.getElementById('RegisterPage').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('Nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const gender = document.getElementById('genero').value;
    const birthdate = document.getElementById('birthdate').value;
    const bio = '';

    if (password.length < 8) {
        mostrarErro('A password deve ter pelo menos 8 caracteres');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, gender, birthdate, bio })
        });

        const data = await res.json();

        if (data.status === 'success') {
            localStorage.setItem('welcome', name);
            window.location.href = '../index.html';
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
