// Hero background carousel
window.NB = window.NB || {};

NB.HERO_IMAGES = [
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1600&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1600&q=80',
    'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=1600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1600&q=80'
];

NB.initHeroCarousel = function () {
    const bg   = document.getElementById('hero-bg');
    const dots = document.getElementById('hero-dots');
    if (!bg) return;

    let index = 0;

    if (dots) {
        dots.innerHTML = NB.HERO_IMAGES.map((_, i) =>
            `<button class="hero__dot${i === 0 ? ' hero__dot--active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>`
        ).join('');
        dots.addEventListener('click', e => {
            const btn = e.target.closest('[data-index]');
            if (btn) goTo(parseInt(btn.dataset.index));
        });
    }

    function goTo(i) {
        index = i;
        bg.style.backgroundImage = `url('${NB.HERO_IMAGES[i]}')`;
        document.querySelectorAll('.hero__dot').forEach((d, j) =>
            d.classList.toggle('hero__dot--active', j === i));
    }

    goTo(0);
    setInterval(() => goTo((index + 1) % NB.HERO_IMAGES.length), 5000);
};
