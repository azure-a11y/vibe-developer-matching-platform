function moveAboutAfterEduinfo(container) {
  if (!container) return;
  const links = [...container.querySelectorAll('a')];
  const about = links.find((link) => link.textContent.trim().toLowerCase() === 'about');
  const eduinfo = links.find((link) => link.textContent.trim().toLowerCase() === 'eduinfo');
  const faq = links.find((link) => link.textContent.trim().toLowerCase() === 'faq');
  if (about && eduinfo) eduinfo.after(about);
  if (about && faq) about.before(faq);
}
moveAboutAfterEduinfo(document.querySelector('.nav-links'));
moveAboutAfterEduinfo(document.querySelector('.footer-sitemap nav'));
