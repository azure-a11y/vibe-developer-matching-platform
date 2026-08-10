const portfolioDialog = document.querySelector('#project-modal');
const builderProfiles = {
  Flowdesk:{name:'김도윤',position:'B2B Product Builder',experience:'10년',projects:'02건',location:'Busan · Remote',photo:'0 0',summary:'분산된 견적·발주 업무를 하나의 흐름으로 연결한 B2B 운영 SaaS',details:['업무 흐름을 기준으로 견적·발주·승인 단계를 재설계했습니다.','권한과 프로젝트 상태를 반영하는 운영 대시보드를 구현했습니다.','GA4 전환 이벤트와 검색 유입 구조를 함께 설계했습니다.']},
  'Classroom OS':{name:'박서연',position:'Education Experience Builder',experience:'6년',projects:'07건',location:'Seoul · Hybrid',photo:'100% 0',summary:'수강·결제·콘텐츠 운영을 통합한 교육 브랜드 플랫폼',details:['교육 콘텐츠와 결제 흐름을 하나의 운영 화면으로 통합했습니다.','강좌별 편집·발행 과정을 관리자 워크플로로 정리했습니다.','수강 전환과 유튜브 유입을 측정할 수 있도록 연결했습니다.']},
  'Local Table':{name:'이준호',position:'Commerce & Platform Builder',experience:'8년',projects:'12건',location:'Seoul · Remote',photo:'0 100%',summary:'지역 생산자와 레스토랑을 정밀 매칭하는 커머스 플랫폼',details:['생산자·구매자 여정을 나누어 매칭의 기준을 화면에 담았습니다.','재고와 주문 상태를 한눈에 보는 운영 흐름을 구축했습니다.','SEO와 검색 유입의 기본 구조를 초기부터 적용했습니다.']},
  'Morrow Care':{name:'최하늘',position:'Healthcare Service Builder',experience:'7년',projects:'05건',location:'Seoul · Hybrid',photo:'100% 100%',summary:'상담부터 사후관리까지 이어지는 웰니스 고객 경험',details:['상담 이후 고객의 다음 행동까지 연결되는 여정을 설계했습니다.','리드 관리와 콘텐츠 운영이 함께 가능한 운영 화면을 만들었습니다.','문의 전환과 고객 이탈 구간을 확인할 수 있도록 측정했습니다.']}
};
const coverPositions = ['0 0','100% 0','0 100%','100% 100%','0 0','100% 0','0 100%','100% 100%','0 0','100% 0','0 100%','100% 100%'];
const coverLabels = ['B2B Dashboard','Brand Site','Landing Page','Admin System','Commerce','Education','Mobile Service','Data Tool','Member Portal','CMS','Campaign','Product Site'];

function renderPortfolioModal(projectName) {
  const profile = builderProfiles[projectName];
  const thumbnails = coverLabels.map((label,index) => `<button class="portfolio-thumb ${index === 0 ? 'active' : ''}" type="button" data-label="${label}" style="background-position:${coverPositions[index]}"></button>`).join('');
  portfolioDialog.innerHTML = `<div class="portfolio-modal"><button class="portfolio-close" type="button" aria-label="상세 화면 닫기">×</button><p class="portfolio-overline">SELECTED BUILDER / PORTFOLIO DETAIL</p><section class="portfolio-profile"><div class="portfolio-photo" style="background-position:${profile.photo}" role="img" aria-label="${profile.name} 빌더 사진"></div><div><span class="portfolio-overline">${profile.position}</span><h2>${profile.name} 빌더</h2><p>${profile.summary}</p></div><button class="portfolio-cta" type="button">프로젝트 문의하기 ↗</button><div class="portfolio-meta"><span><b>${profile.experience}</b>EXPERIENCE</span><span><b>${profile.projects}</b>PROJECTS</span><span><b>${profile.location}</b>LOCATION</span><span><b>Available</b>STATUS</span></div></section><section class="portfolio-summary"><h3>${projectName}를 만든<br>빌더의 작업 방식입니다.</h3><ul>${profile.details.map((detail) => `<li>${detail}</li>`).join('')}</ul></section><section class="portfolio-gallery"><div class="portfolio-gallery-head"><h3>BUILDER PORTFOLIO / 12 SELECTED COVERS</h3><div class="gallery-controls"><button class="gallery-prev" type="button" aria-label="이전 포트폴리오">←</button><button class="gallery-next" type="button" aria-label="다음 포트폴리오">→</button></div></div><div class="gallery-viewport"><div class="gallery-track">${thumbnails}</div></div></section></div>`;
  const close = portfolioDialog.querySelector('.portfolio-close');
  close.addEventListener('click', () => portfolioDialog.close());
  portfolioDialog.querySelector('.portfolio-cta').addEventListener('click', () => { portfolioDialog.close(); document.querySelector('.nav-cta').click(); });
  const track = portfolioDialog.querySelector('.gallery-track');
  const previous = portfolioDialog.querySelector('.gallery-prev');
  const next = portfolioDialog.querySelector('.gallery-next');
  let page = 0;
  const maxPage = Math.ceil(coverLabels.length / 5) - 1;
  const updateGallery = () => { track.style.transform = `translateX(${-page * 102}%)`; previous.disabled = page === 0; next.disabled = page === maxPage; };
  previous.addEventListener('click', () => { page = Math.max(page - 1, 0); updateGallery(); });
  next.addEventListener('click', () => { page = Math.min(page + 1, maxPage); updateGallery(); });
  portfolioDialog.querySelectorAll('.portfolio-thumb').forEach((thumb) => thumb.addEventListener('click', () => { portfolioDialog.querySelectorAll('.portfolio-thumb').forEach((item) => item.classList.remove('active')); thumb.classList.add('active'); }));
  updateGallery();
}

document.querySelectorAll('.project').forEach((project) => {
  // Capture the click before the original lightweight modal handler. This
  // keeps the complete dialog reusable after it has been closed.
  project.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    renderPortfolioModal(project.dataset.project);
    if (!portfolioDialog.open) portfolioDialog.showModal();
  }, true);
});
