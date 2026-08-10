const workSectionLabel = document.querySelector('.mosaic-title footer span');
workSectionLabel.textContent = '01 SELECTED WORK';
const workTitle = document.querySelector('.mosaic-title h3');
const workTitleText = '일하는 방식과 검증된\n맞춤 개발자 매칭';
const mosaicCopy = document.createElement('div');
mosaicCopy.className = 'mosaic-copy';
mosaicCopy.append(document.querySelector('.mosaic-title small'), workTitle);
document.querySelector('.mosaic-title').prepend(mosaicCopy);

const featuredBuilders = [
  {name:'송인선',role:'Product Builder',field:'B2B SaaS',photo:'p2',title:'Flowdesk',summary:'프로젝트의 맥락을 빠르게 정리하고 실행 가능한 화면으로 연결합니다.'},
  {name:'명지홍',role:'Experience Builder',field:'Brand Platform',photo:'p1',title:'Classroom OS',summary:'브랜드 경험과 사용자 흐름을 하나의 제품 구조로 설계합니다.'}
];
const builderPair = document.createElement('div');
builderPair.className = 'builder-pair';
builderPair.innerHTML = featuredBuilders.map((builder) => `<article class="project project-left-builder"><div class="profile ${builder.photo}"></div><div><small><b>${builder.name}</b> · BUILDER</small><h3>${builder.title}</h3></div><p>${builder.summary}</p><div class="stats"><b><strong>01</strong><small>기</small></b><b><strong>10</strong><small>YEARS</small></b><i class="cover c1"></i></div><footer><span>${builder.field}</span><em>VIEW ↗</em></footer></article>`).join('');
document.querySelector('.mosaic-title footer').before(builderPair);

const rightBuilderNames = ['조유리','최성훈','한도균','홍영준'];
document.querySelectorAll('.project-grid .project').forEach((project, index) => {
  const name = rightBuilderNames[index];
  if (!name) return;
  project.dataset.builder = name;
  const profile = project.querySelector('.profile');
  if (profile) profile.className = `profile ${index === 0 ? 'p2' : index === 1 ? 'p1' : index === 2 ? 'p3' : 'p4'}`;
  const nameNode = project.querySelector('small b');
  if (nameNode) nameNode.textContent = name;
  const firstStat = project.querySelector('.stats b');
  if (firstStat) firstStat.innerHTML = '<strong>01</strong><small>기</small>';
});

// Reuse the exact right-card structure for the two cards under the yellow panel.
const leftBuilderNames = ['송인선','명지홍'];
const rightCardTemplates = [...document.querySelectorAll('.project-grid .project')].slice(0, 2);
builderPair.innerHTML = rightCardTemplates.map((source, index) => {
  const card = source.cloneNode(true);
  card.classList.add('project-left-builder');
  card.dataset.builder = leftBuilderNames[index];
  const nameNode = card.querySelector('small b');
  if (nameNode) nameNode.textContent = leftBuilderNames[index];
  const profile = card.querySelector('.profile');
  if (profile) profile.className = `profile ${index === 0 ? 'p2' : 'p1'}`;
  const firstStat = card.querySelector('.stats b');
  if (firstStat) firstStat.innerHTML = '<strong>01</strong><small>기</small>';
  return card.outerHTML;
}).join('');

function typeWorkTitle() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    workTitle.innerHTML = workTitleText.replace('\n', '<br>');
    return;
  }
  workTitle.classList.add('is-typing');
  workTitle.textContent = '';
  let index = 0;
  const typeNext = () => {
    if (index >= workTitleText.length) return;
    const character = workTitleText[index++];
    workTitle.append(character === '\n' ? document.createElement('br') : document.createTextNode(character));
    window.setTimeout(typeNext, character === '\n' ? 240 : 108);
  };
  typeNext();
}

new IntersectionObserver((entries, observer) => {
  if (entries[0].isIntersecting) {
    typeWorkTitle();
    observer.unobserve(entries[0].target);
  }
}, {threshold:.4}).observe(workTitle);
