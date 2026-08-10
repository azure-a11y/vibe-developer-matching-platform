const faqItems = document.querySelectorAll('.faq-list details');
faqItems.forEach((item, index) => {
  // All answers start collapsed; visitors choose the question they want to read.
  item.open = false;
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => { if (other !== item) other.open = false; });
    }
    item.querySelector('summary i').textContent = item.open ? '−' : '+';
  });
});

const projectDialog = document.querySelector('#project-modal');
const dialogCopy = document.querySelector('#modal-copy');
const dialogList = document.createElement('ul');
dialogList.innerHTML = '<li>요구사항과 사용자 흐름을 기준으로 설계했습니다.</li><li>검증된 제작 루틴과 전환 데이터 측정을 적용했습니다.</li>';
dialogCopy.after(dialogList);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && projectDialog.open) projectDialog.close();
});

document.querySelectorAll('.related a').forEach((link) => {
  link.target = '_blank';
  link.rel = 'noreferrer';
});

const insightSection = document.querySelector('.insight');
const insightPosts = insightSection.querySelectorAll('.card-stack article');
let insightPostSelected = false;

insightPosts.forEach((post) => {
  post.addEventListener('pointerenter', () => insightSection.classList.add('is-question-paused'));
  post.addEventListener('pointerleave', () => {
    if (!insightPostSelected) insightSection.classList.remove('is-question-paused');
  });
  post.addEventListener('click', () => {
    insightPostSelected = true;
    insightPosts.forEach((item) => item.classList.remove('is-selected'));
    post.classList.add('is-selected');
    insightSection.classList.add('is-question-paused');
  });
});
