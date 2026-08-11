const mainContent = document.querySelector('main.abg');
const aboutSection = mainContent?.querySelector('#about');
const eduSection = mainContent?.querySelector('#eduinfo');
const faqSection = mainContent?.querySelector('#faq');
if (aboutSection && eduSection) aboutSection.before(eduSection);
if (aboutSection && faqSection) aboutSection.before(faqSection);
if (eduSection) eduSection.querySelector('header > p').textContent = '03 · EDUINFO';
if (faqSection) faqSection.querySelector('header > p').textContent = '04 · FAQ';
if (aboutSection) aboutSection.querySelector('header > p').textContent = '05 · BUILDER GROUP ABOUT';
