const footer = document.querySelector('.footer');

footer.classList.add('footer-upgraded');
footer.innerHTML = `
  <div class="footer-grid">
    <section class="footer-brand">
      <a class="footer-brand-logo" href="#top"><b>AI</b><strong>AI Builder Group</strong></a>
      <p>AI \uC2DC\uB300\uC5D0 \uCD5C\uC801\uD654\uB41C \uC815\uBC00 \uBE4C\uB354 \uB9E4\uCE6D\uACFC \uC81C\uC791 \uC6B4\uC601\uC744 \uC5F0\uACB0\uD569\uB2C8\uB2E4.</p>
      <dl class="footer-company">
        <dt>\uD68C\uC0AC\uBA85</dt><dd>\uADF8\uB9BC\uC5D0\uB3C4\uBD88\uAD6C\uD558\uACE0</dd>
        <dt>\uB300\uD45C\uC790</dt><dd>\uAE40\uB3D9\uD654</dd>
        <dt>\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638</dt><dd>194-38-01608</dd>
      </dl>
    </section>
    <section class="footer-sitemap">
      <h3>SITEMAP</h3>
      <nav aria-label="Footer sitemap">
        <a href="#about">About</a><a href="#work">Work</a><a href="#insight">Insight</a><a href="#eduinfo">Eduinfo</a><a href="#faq">FAQ</a>
      </nav>
    </section>
  </div>
  <div class="footer-bottom"><span>\u00A9 2026 AI Builder Group</span><span>OPERATED BY \uB611\uB611\uD55C\uAC1C\uBC1C\uC790</span></div>
  <a class="footer-top" href="#top" aria-label="\uD398\uC774\uC9C0 \uC704\uB85C \uC774\uB3D9">TOP <i>\u2191</i></a>
`;
