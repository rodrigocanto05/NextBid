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

NB.defaultAvatarUrl = function () {
    const match = location.pathname.match(/\/hmtl\/(.*)$/);
    const depth = match ? match[1].split('/').length - 1 : 0;
    return '../'.repeat(depth + 1) + 'img/avatar-placeholder.png';
};

NB.avatarUrl = function (user) {
    return user?.avatar || NB.defaultAvatarUrl();
};
