const heroArt = document.querySelector('.hero-art');
if (heroArt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroArt.addEventListener('pointermove', (event) => {
    const bounds = heroArt.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - .5;
    const vertical = (event.clientY - bounds.top) / bounds.height - .5;
    heroArt.style.setProperty('--hero-rx', `${-vertical * 5}deg`);
    heroArt.style.setProperty('--hero-ry', `${horizontal * 5}deg`);
    heroArt.style.setProperty('--hero-x', `${horizontal * 10}px`);
    heroArt.style.setProperty('--hero-y', `${vertical * 10}px`);
  });
  heroArt.addEventListener('pointerleave', () => {
    heroArt.style.setProperty('--hero-rx', '0deg');
    heroArt.style.setProperty('--hero-ry', '0deg');
    heroArt.style.setProperty('--hero-x', '0px');
    heroArt.style.setProperty('--hero-y', '0px');
  });
}
