const workSectionLabel = document.querySelector('.mosaic-title footer span');
workSectionLabel.textContent = '01 SELECTED WORK';
const mosaicTitle = document.querySelector('.mosaic-title');
const mosaicSmall = mosaicTitle.querySelector('small');
mosaicTitle.querySelector('h3').remove();
mosaicSmall.textContent = 'BUILDER SPOTLIGHT';
const mosaicCopy = document.createElement('div');
mosaicCopy.className = 'mosaic-copy';
mosaicCopy.append(mosaicSmall);
mosaicTitle.prepend(mosaicCopy);

// Simple builder search sitting in the panel's top-right, unused space next to the label.
const spotlightSearch = document.createElement('form');
spotlightSearch.className = 'spotlight-search';
spotlightSearch.innerHTML = `<input type="search" name="q" placeholder="빌더 검색" aria-label="빌더 이름으로 검색" /><button type="submit" aria-label="검색">↗</button>`;
mosaicCopy.append(spotlightSearch);

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

// Yellow panel rotates through every builder shown in the grid (left highlights + right grid),
// reusing each card's own data-* attributes so the spotlight never drifts out of sync with the cards.
const spotlight = document.createElement('div');
spotlight.className = 'mosaic-spotlight';
mosaicCopy.append(spotlight);

const spotlightCovers = [
  {label: 'B2B Dashboard', pos: '0% 0%'},
  {label: 'Brand Site', pos: '100% 0%'},
  {label: 'Landing Page', pos: '0% 100%'},
  {label: 'Admin System', pos: '100% 100%'},
];

function renderSpotlight(builder) {
  spotlight.innerHTML = `<div class="spotlight-top"><div class="spotlight-copy"><p class="spotlight-name"><b>${builder.name}</b> 빌더</p><p class="spotlight-summary">${builder.summary}</p></div><button class="spotlight-more" type="button">더 알아보기 ↗</button></div><div class="spotlight-portfolio">${spotlightCovers.map((c) => `<i style="background-position:${c.pos}" aria-label="${builder.title} · ${c.label}"></i>`).join('')}</div>`;
  spotlight.querySelector('.spotlight-more').addEventListener('click', () => builder.card.click());
}

function collectBuilders() {
  const cards = [...document.querySelectorAll('.builder-pair .project-left-builder'), ...document.querySelectorAll('.project-grid .project')];
  return cards.map((card) => ({name: card.dataset.builder, title: card.dataset.project, summary: card.dataset.summary, card}));
}

const spotlightBuilders = collectBuilders();
let spotlightIndex = 0;
if (spotlightBuilders[0]) renderSpotlight(spotlightBuilders[0]);

// Pin the yellow spotlight panel AND the two left builder cards to exactly one
// right-grid row's height, measured live, since the rows no longer force a fixed
// aspect-ratio and can drift apart from each other with content.
let spotlightResizeTimer;
function syncSpotlightHeight() {
  const referenceCard = document.querySelector('.project-grid .project');
  if (!referenceCard) return;
  const targetHeight = `${referenceCard.getBoundingClientRect().height}px`;
  mosaicCopy.style.height = targetHeight;
  builderPair.style.height = targetHeight;
  document.querySelectorAll('.builder-pair .project-left-builder').forEach((card) => {
    card.style.height = targetHeight;
  });
}
syncSpotlightHeight();
window.addEventListener('load', syncSpotlightHeight);
window.setTimeout(syncSpotlightHeight, 500);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncSpotlightHeight);
window.addEventListener('resize', () => {
  window.clearTimeout(spotlightResizeTimer);
  spotlightResizeTimer = window.setTimeout(syncSpotlightHeight, 150);
});

let spotlightInterval;
const showSpotlight = (builder) => {
  spotlight.classList.add('is-swapping');
  window.setTimeout(() => {
    renderSpotlight(builder);
    spotlight.classList.remove('is-swapping');
  }, 400);
};

if (spotlightBuilders.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const advanceSpotlight = () => {
    spotlightIndex = (spotlightIndex + 1) % spotlightBuilders.length;
    showSpotlight(spotlightBuilders[spotlightIndex]);
  };
  new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting) {
      spotlightInterval = window.setInterval(advanceSpotlight, 4200);
      observer.unobserve(entries[0].target);
    }
  }, {threshold: .4}).observe(mosaicTitle);
}

// Searching a builder by name hands control over from the auto-rotation to the visitor.
spotlightSearch.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = spotlightSearch.querySelector('input').value.trim();
  if (!query) return;
  const match = spotlightBuilders.find((b) => b.name.includes(query));
  if (!match) return;
  window.clearInterval(spotlightInterval);
  spotlightIndex = spotlightBuilders.indexOf(match);
  showSpotlight(match);
});
