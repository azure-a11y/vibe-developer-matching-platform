const mainContent = document.querySelector('main.abg');
const aboutSection = mainContent?.querySelector('#about');
const eduSection = mainContent?.querySelector('#eduinfo');
if (aboutSection && eduSection) aboutSection.before(eduSection);
if (eduSection) eduSection.querySelector('header > p').textContent = '03 · EDUINFO';
if (aboutSection) aboutSection.querySelector('header > p').textContent = '04 · BUILDER GROUP ABOUT';
