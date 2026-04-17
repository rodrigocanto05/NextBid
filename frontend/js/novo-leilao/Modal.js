// Open/close logic for the "Criar Leilão" modal
window.NB = window.NB || {};
NB.NovoLeilao = NB.NovoLeilao || {};

NB.NovoLeilao.openModal = function () {
    if (!NB.requireAuth()) {
        alert('Precisas de iniciar sessão para criar um leilão.');
        window.location.href = NB._authPath('login');
        return;
    }
    const overlay = document.getElementById('modal-novo-leilao');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
};

NB.NovoLeilao.closeModal = function () {
    document.getElementById('modal-novo-leilao')?.classList.remove('open');
    document.body.style.overflow = '';
};

NB.NovoLeilao.bindModalTriggers = function () {
    document.getElementById('btn-novo-leilao')?.addEventListener('click', NB.NovoLeilao.openModal);
    document.getElementById('modal-close')?.addEventListener('click', NB.NovoLeilao.closeModal);

    document.getElementById('modal-novo-leilao')?.addEventListener('click', e => {
        if (e.target.id === 'modal-novo-leilao') NB.NovoLeilao.closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') NB.NovoLeilao.closeModal();
    });
};

NB.NovoLeilao.setDatetimeLimits = function () {
    const input = document.getElementById('nl-fim');
    if (!input) return;
    const now = new Date();
    const min = new Date(now.getTime() + 60 * 60 * 1000);
    const max = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const def = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const fmt = d => {
        const p = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    input.min = fmt(min);
    input.max = fmt(max);
    input.value = fmt(def);
};
