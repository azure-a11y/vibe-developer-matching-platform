const workSectionLabel = document.querySelector('.mosaic-title footer span');
workSectionLabel.textContent = '01 SELECTED WORK';
const workTitle = document.querySelector('.mosaic-title h3');
const workTitleText = '일하는 방식과 검증된\n맞춤 개발자 매칭';
const mosaicCopy = document.createElement('div');
mosaicCopy.className = 'mosaic-copy';
mosaicCopy.append(document.querySelector('.mosaic-title small'), workTitle);
document.querySelector('.mosaic-title').prepend(mosaicCopy);

const rightBuilderNames = ['조유리','최성훈','한도균','홍영준'];
document.querySelectorAll('.project-grid .project').forEach((project, index) => {
  const name = rightBuilderNames[index];
  if (!name) return;
  project.dataset.builder = name;
  const profile = project.querySelector('.profile');
  if (profile) profile.className = `profile ${index === 0 ? 'p2' : index === 1 ? 'p1' : 'p3'}`;
  const nameNode = project.querySelector('small b');
  if (nameNode) nameNode.textContent = name;
});

// Left panel highlights two builders with their own projects (not shown on the right),
// using the exact same card markup/fields as the right-side .project buttons so sizing stays identical.
const featuredBuilders = [
  {name:'송인선',date:'2026.07',photo:'p2',title:'Fieldnote',summary:'현장 데이터를 실시간으로 정리해 의사결정 속도를 높이는 필드 운영 도구',cohort:'01',years:'9년',field:'B2B SaaS',cover:'c1'},
  {name:'명지홍',date:'2026.05',photo:'p1',title:'Brightline',summary:'브랜드 경험과 사용자 흐름을 하나의 제품 구조로 설계하는 커머스 UX 플랫폼',cohort:'01',years:'7년',field:'Brand Platform',cover:'c2'}
];
const builderPair = document.createElement('div');
builderPair.className = 'builder-pair';
builderPair.innerHTML = featuredBuilders.map((builder) => `<article class="project project-left-builder" data-project="${builder.title}" data-builder="${builder.name}" data-date="${builder.date}" data-field="${builder.field}" data-summary="${builder.summary}"><div class="profile ${builder.photo}"></div><div><small><b>${builder.name}</b> 빌더 · ${builder.date}</small><h3>${builder.title}</h3></div><p>${builder.summary}</p><div class="stats"><b>${builder.cohort}기<small>기수</small></b><b>${builder.years}<small>EXPERIENCE</small></b><i class="cover ${builder.cover}"></i></div><footer><span>${builder.field}</span><em>VIEW ↗</em></footer></article>`).join('');
document.querySelector('.mosaic-title footer').before(builderPair);

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
