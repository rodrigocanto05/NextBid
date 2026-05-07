// Countdown timer — updates a DOM element with "Xd Yh Zm Ws" until endsAt
window.NB = window.NB || {};

NB.iniciarCronometro = function (endsAt, element) {
    if (!endsAt || !element) return;
    const endTime = new Date(endsAt.replace(' ', 'T')).getTime();

    function tick() {
        const diff = endTime - Date.now();
        if (diff <= 0) {
            element.textContent = 'Terminado';
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        element.textContent = d > 0
            ? `${d}d ${h}h ${m}m`
            : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
        requestAnimationFrame(() => setTimeout(tick, 1000));
    }

    tick();
};

// Back-compat global
window.iniciarCronometro = NB.iniciarCronometro;
