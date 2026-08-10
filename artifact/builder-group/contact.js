const inquiryDialog = document.createElement('dialog');
inquiryDialog.className = 'inquiry-dialog';
inquiryDialog.innerHTML = `
  <div class="inquiry-wrap">
    <button class="inquiry-close" type="button" aria-label="문의하기 닫기">×</button>
    <small>PROJECT INQUIRY</small>
    <h2>프로젝트를<br>이야기해 주세요.</h2>
    <p>목적과 현재 상황을 남겨주시면, 프로젝트에 맞는 다음 단계를 함께 정리해 드립니다.</p>
    <form class="inquiry-form">
      <div class="inquiry-field"><label for="inquiry-name">NAME</label><input id="inquiry-name" name="name" required placeholder="담당자 이름" /></div>
      <div class="inquiry-field"><label for="inquiry-company">COMPANY</label><input id="inquiry-company" name="company" placeholder="회사 또는 브랜드명" /></div>
      <div class="inquiry-field"><label for="inquiry-contact">CONTACT</label><input id="inquiry-contact" name="contact" required placeholder="연락처 또는 이메일" /></div>
      <div class="inquiry-field"><label for="inquiry-type">PROJECT TYPE</label><select id="inquiry-type" name="type"><option>랜딩페이지 / 웹사이트</option><option>서비스 / 플랫폼 구축</option><option>운영 / 개선</option><option>기타</option></select></div>
      <div class="inquiry-field wide"><label for="inquiry-message">PROJECT NOTE</label><textarea id="inquiry-message" name="message" required placeholder="프로젝트의 목적, 일정, 필요한 기능을 자유롭게 남겨주세요."></textarea></div>
      <button type="submit">문의 내용 보내기 ↗</button>
    </form>
    <div class="inquiry-success"><strong>문의 내용을 받았습니다.</strong><br>담당 빌더 매칭을 위해 내용을 확인한 뒤 연락드리겠습니다.</div>
  </div>`;
document.body.append(inquiryDialog);

const openInquiry = (event) => {
  event.preventDefault();
  const projectDialog = document.querySelector('#project-modal');
  if (projectDialog.open) projectDialog.close();
  inquiryDialog.querySelector('form').reset();
  inquiryDialog.querySelector('form').classList.remove('sent');
  inquiryDialog.querySelector('.inquiry-success').classList.remove('visible');
  inquiryDialog.showModal();
};
document.querySelector('.nav-cta').textContent = '프로젝트 문의하기 ↗';
document.querySelector('.start').href = '#work';
document.querySelector('.start').innerHTML = 'VIEW WORK PORTFOLIO <b>↗</b>';
document.querySelectorAll('.nav-cta, #project-modal a').forEach((trigger) => trigger.addEventListener('click', openInquiry));
inquiryDialog.querySelector('.inquiry-close').addEventListener('click', () => inquiryDialog.close());
inquiryDialog.addEventListener('click', (event) => { if (event.target === inquiryDialog) inquiryDialog.close(); });
inquiryDialog.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  inquiryDialog.querySelector('form').classList.add('sent');
  inquiryDialog.querySelector('.inquiry-success').classList.add('visible');
});

const logos = {OpenAI:'openai/111111',Anthropic:'anthropic/111111',Vercel:'vercel/111111',GitHub:'github/111111',Figma:'figma/111111',YouTube:'youtube/FF0000',Notion:'notion/111111',Supabase:'supabase/3FCF8E'};
document.querySelectorAll('.related a').forEach((link) => {
  const name = link.querySelector('strong').textContent;
  const image = document.createElement('img');
  image.className = 'site-logo';
  image.src = `https://cdn.simpleicons.org/${logos[name]}`;
  image.alt = `${name} 로고`;
  link.prepend(image);
});
const relatedSection = document.querySelector('.related');
const relatedLinks = [...relatedSection.querySelectorAll('a')];
let relatedLightTimer;
let lastRelatedLight = -1;

function pulseRandomRelatedLink() {
  if (relatedSection.classList.contains('is-paused')) return;
  let nextLight;
  do { nextLight = Math.floor(Math.random() * relatedLinks.length); }
  while (relatedLinks.length > 1 && nextLight === lastRelatedLight);
  relatedLinks.forEach((link) => link.classList.remove('is-random-lit'));
  relatedLinks[nextLight].classList.add('is-random-lit');
  lastRelatedLight = nextLight;
}

function startRelatedLights() {
  window.clearInterval(relatedLightTimer);
  pulseRandomRelatedLink();
  relatedLightTimer = window.setInterval(pulseRandomRelatedLink, 820);
}

new IntersectionObserver((entries, observer) => {
  if (entries[0].isIntersecting) { relatedSection.classList.add('is-lit'); startRelatedLights(); observer.unobserve(relatedSection); }
}, {threshold:.25}).observe(relatedSection);
relatedSection.addEventListener('pointerenter', () => {
  relatedSection.classList.add('is-paused');
  window.clearInterval(relatedLightTimer);
});
relatedSection.addEventListener('pointerleave', () => {
  relatedSection.classList.remove('is-paused');
  startRelatedLights();
});
