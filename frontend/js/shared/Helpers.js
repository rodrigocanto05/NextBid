// Shared helpers (API, formatting, escaping)
window.NB = window.NB || {};
NB.BASE_URL = (function () {
    const { protocol, host, pathname } = window.location;
    const idx = pathname.indexOf('/frontend/');
    const root = idx >= 0 ? pathname.substring(0, idx) : '';
    return `${protocol}//${host}${root}/backend`;
})();

NB.formatCurrency = function (amount) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

NB.escHtml = function (str) {
    return String(str || '').replace(/[&<>"']/g, c => (
        { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
    ));
};

NB.apiGet = async function (path) {
    const headers = {};
    const token = (NB.getCurrentUser && NB.getCurrentUser()?.token);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${NB.BASE_URL}${path}`, { headers });
    return res.json();
};

NB.apiPost = async function (path, body, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (opts.auth && NB.getCurrentUser()?.token) {
        headers['Authorization'] = `Bearer ${NB.getCurrentUser().token}`;
    }
    const isFormData = body instanceof FormData;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${NB.BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: isFormData ? body : JSON.stringify(body)
    });
    return res.json();
};

NB.truncate = function (str, n = 80) {
    str = String(str || '');
    return str.length > n ? str.slice(0, n) + '…' : str;
};
