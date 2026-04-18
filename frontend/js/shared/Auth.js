// Auth helpers
window.NB = window.NB || {};

NB.getCurrentUser = function () {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) return null;
        const token = localStorage.getItem('token');
        if (token) user.token = token;
        return user;
    } catch (e) {
        return null;
    }
};

NB.logout = function () {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
};

NB.requireAuth = function (redirectUrl) {
    const user = NB.getCurrentUser();
    if (!user) {
        if (redirectUrl) window.location.href = redirectUrl;
        return null;
    }
    return user;
};

NB.avatarUrl = function (user) {
    return user?.avatar || null;
};
