const heroArt = document.querySelector('.hero-art');
const heroUnfoldCopy = document.querySelector('.hero-unfold-copy');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroArt && heroUnfoldCopy && !reduceMotion) {
  const PANEL_DURATION = 900;
  const READ_HOLD = 2800;
  const CLOSED_HOLD = 2000;

  const runCycle = () => {
    heroArt.classList.add('is-revealed');
    window.setTimeout(() => {
      heroArt.classList.remove('is-revealed');
      window.setTimeout(runCycle, PANEL_DURATION + CLOSED_HOLD);
    }, PANEL_DURATION + READ_HOLD);
  };

  new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting) {
      runCycle();
      observer.unobserve(entries[0].target);
    }
  }, {threshold:.4}).observe(heroArt);
}

if (heroArt && !reduceMotion) {
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
