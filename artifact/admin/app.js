/* ---------- 로그인 / 현재 계정 ---------- */
const adminAccounts = {
  jo: {name:'조유리', email:'yuri@aibuildergroup.co', role:'최종 관리자', roleClass:'badge-green'},
  han: {name:'한도균', email:'dogyun@aibuildergroup.co', role:'최종 관리자', roleClass:'badge-green'},
  ops: {name:'운영 담당자', email:'ops@aibuildergroup.co', role:'콘텐츠 관리자', roleClass:'badge-blue'},
  review: {name:'검수 담당자', email:'review@aibuildergroup.co', role:'검수 담당', roleClass:'badge-gray'},
};

// 빌더별 로그인 권한(PRD FR-10 AC-10.3, "계정 · 권한" 화면의 표와 동일한 값). 표에 없는 빌더는 기본값(미부여) 적용.
const builderPermissions = {
  jo: {login:true, work:true, insightWrite:true, insightEdit:true, insightDelete:false},
  han: {login:true, work:true, insightWrite:true, insightEdit:true, insightDelete:false},
  choi: {login:true, work:true, insightWrite:true, insightEdit:false, insightDelete:false},
  song: {login:true, work:true, insightWrite:false, insightEdit:false, insightDelete:false},
  myeong: {login:false, work:false, insightWrite:false, insightEdit:false, insightDelete:false},
};
const defaultBuilderPermission = {login:false, work:true, insightWrite:false, insightEdit:false, insightDelete:false};

let currentAdmin = null;

const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const loginForm = document.getElementById('login-form');
const currentAdminName = document.getElementById('current-admin-name');
const currentAdminRole = document.getElementById('current-admin-role');
const builderScopeNote = document.getElementById('builder-scope-note');

function findByEmail(pool, email) {
  const key = Object.keys(pool).find((id) => (pool[id].email || '').toLowerCase() === email.toLowerCase());
  return key ? { id: key, ...pool[key] } : null;
}

function login(role, email) {
  if (role === 'admin') {
    const matched = findByEmail(adminAccounts, email);
    currentAdmin = matched || { id: null, name: email.split('@')[0] || '관리자', email, role: '관리자', roleClass: 'badge-gray' };
  } else {
    const matched = findByEmail(builders, email);
    currentAdmin = matched
      ? { id: matched.id, name: matched.name, email, role: '빌더', roleClass: 'badge-gray', builderId: matched.id }
      : { id: null, name: email.split('@')[0] || '빌더', email, role: '빌더', roleClass: 'badge-gray', builderId: null };
  }
  currentAdmin.type = role;
  currentAdminName.textContent = currentAdmin.name;
  currentAdminRole.textContent = currentAdmin.role;
  currentAdminRole.className = `badge ${currentAdmin.roleClass}`;
  document.body.classList.toggle('role-builder', role === 'builder');
  loginScreen.classList.add('is-hidden');
  appShell.classList.remove('is-hidden');
  showView(role === 'builder' ? 'insight' : 'dashboard');
  renderBuilderScopeNote();
}

function renderBuilderScopeNote() {
  if (!builderScopeNote) return;
  if (!currentAdmin || currentAdmin.type !== 'builder') { builderScopeNote.innerHTML = ''; return; }
  const perm = (currentAdmin.builderId && builderPermissions[currentAdmin.builderId]) || defaultBuilderPermission;
  const yn = (v) => (v ? '가능' : '불가');
  const warn = perm.login ? '' : ' — ⚠️ 이 계정은 아직 로그인 권한이 관리자에게서 활성화되지 않았습니다.';
  builderScopeNote.innerHTML = `<p class="hint builder-scope-note">빌더 로그인 상태(<b>${currentAdmin.name}</b>) — Insight 작성: ${yn(perm.insightWrite)} · 수정: ${yn(perm.insightEdit)} · 삭제: ${yn(perm.insightDelete)} · 본인 Work 업로드: ${yn(perm.work)}${warn}</p>`;
}

function logout() {
  currentAdmin = null;
  loginForm.reset();
  document.body.classList.remove('role-builder');
  builderScopeNote.innerHTML = '';
  appShell.classList.add('is-hidden');
  loginScreen.classList.remove('is-hidden');
  closeDrawer();
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const checked = loginForm.querySelector('input[name="login-role"]:checked');
  if (checked) login(checked.value, document.getElementById('login-email').value);
});
document.getElementById('role-admin').addEventListener('change', () => login('admin', document.getElementById('login-email').value));
document.getElementById('role-builder-radio').addEventListener('change', () => login('builder', document.getElementById('login-email').value));
document.getElementById('login-forgot').addEventListener('click', () => {
  alert('비밀번호 재설정 메일 발송은 시안 단계라 동작하지 않습니다. 실제로는 관리자가 §계정·권한에서 "비밀번호 초기화"를 대신 처리할 수 있습니다.');
});
document.getElementById('btn-logout').addEventListener('click', logout);
document.getElementById('btn-account-settings').addEventListener('click', renderAccountSettings);

const views = document.querySelectorAll('.view');
const sideLinks = document.querySelectorAll('.side-link');
const viewTitle = document.getElementById('view-title');
const titles = {
  dashboard: '대시보드',
  builders: 'Builder 관리',
  work: 'Work / Portfolio 관리',
  process: 'Work Process',
  insight: 'Insight 관리',
  settings: '설정',
  permissions: '계정 · 권한',
};

function showView(name) {
  views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));
  sideLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.view === name));
  viewTitle.textContent = titles[name] || name;
}

sideLinks.forEach((link) => link.addEventListener('click', () => showView(link.dataset.view)));

document.querySelectorAll('[data-goto]').forEach((row) => {
  row.addEventListener('click', () => {
    showView(row.dataset.goto);
    openDrawer(row.dataset.goto, row.dataset.id);
  });
});

/* ---------- 샘플 데이터 (목업 전용) ---------- */
const builders = {
  jo: {name:'조유리', email:'yuri@builder.aibuildergroup.co', position:'B2B Product Builder', location:'Busan · Remote', specialties:['B2B SaaS','운영 대시보드','GA 이벤트 설계'], intro:'분산된 업무 흐름을 하나의 구조로 재설계하는 것을 좋아하는 프로덕트 빌더입니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:['똑빌더 커뮤니티 스터디 리더'], verified:true, projects:[{name:'Flowdesk', role:'PM · Full-stack'}]},
  choi: {name:'최성훈', email:'choi@builder.aibuildergroup.co', position:'Education Experience Builder', location:'Seoul · Hybrid', specialties:['EdTech','결제 흐름','콘텐츠 운영'], intro:'교육 콘텐츠와 결제 흐름을 하나의 운영 화면으로 통합하는 데 강점이 있습니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:['크몽 파트너 인증'], verified:true, projects:[{name:'Classroom OS', role:'Lead Builder'}]},
  han: {name:'한도균', email:'han@builder.aibuildergroup.co', position:'Commerce & Platform Builder', location:'Seoul · Remote', specialties:['Marketplace','매칭 로직','SEO'], intro:'생산자·구매자 여정을 나눠 매칭 기준을 화면에 담는 커머스 빌더입니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:['똑빌더 커뮤니티 운영진'], verified:true, projects:[{name:'Local Table', role:'Full-stack Builder'}]},
  hong: {name:'홍영준', email:'hong@builder.aibuildergroup.co', position:'Healthcare Service Builder', location:'Seoul · Hybrid', specialties:['Healthcare','리드 관리','고객 여정'], intro:'상담 이후 고객의 다음 행동까지 이어지는 여정 설계를 전문으로 합니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:true, projects:[{name:'Morrow Care', role:'Product Builder'}]},
  song: {name:'송인선', email:'song@builder.aibuildergroup.co', position:'Product Builder', location:'Seoul · Remote', specialties:['B2B SaaS','실시간 데이터','알림 체계'], intro:'현장 데이터를 실시간으로 구조화해 의사결정 속도를 높이는 도구를 만듭니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:['똑빌더 커뮤니티 스터디 리더'], verified:true, projects:[{name:'Fieldnote', role:'Full-stack Builder'}]},
  myeong: {name:'명지홍', email:'myeong@builder.aibuildergroup.co', position:'Experience Builder', location:'Seoul · Hybrid', specialties:['Commerce UX','브랜드 경험'], intro:'브랜드 톤을 유지하면서도 전환에 최적화된 화면 구조를 설계합니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:false, projects:[{name:'Brightline', role:'Experience Builder'}]},
  kimsg: {name:'김상규', email:'kimsg@builder.aibuildergroup.co', position:'Backend Builder', location:'Seoul · Remote', specialties:['API 설계','DB 최적화'], intro:'서비스 이면의 데이터 구조와 API 설계를 안정적으로 잡는 백엔드 빌더입니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:true, projects:[]},
  kimsm: {name:'김성미', email:'kimsm@builder.aibuildergroup.co', position:'Frontend Builder', location:'Seoul · Hybrid', specialties:['React','UI 시스템'], intro:'일관된 UI 시스템으로 빠르게 화면을 조립하는 프론트엔드 빌더입니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:true, projects:[]},
  kimwg: {name:'김웅기', email:'kimwg@builder.aibuildergroup.co', position:'Full-stack Builder', location:'Incheon · Remote', specialties:['Next.js','Supabase'], intro:'기획부터 배포까지 혼자서도 끝까지 만들어보는 것을 선호하는 풀스택 빌더입니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:false, projects:[]},
  kwonjy: {name:'권지연', email:'kwonjy@builder.aibuildergroup.co', position:'Design Builder', location:'Seoul · Remote', specialties:['UX 리서치','디자인 시스템'], intro:'사용자 리서치를 바탕으로 화면 구조와 디자인 시스템을 함께 설계합니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:true, projects:[]},
  parkjs: {name:'박진선', email:'parkjs@builder.aibuildergroup.co', position:'Growth Builder', location:'Seoul · Hybrid', specialties:['GA4','전환 최적화'], intro:'데이터로 전환 지점을 찾아 다음 개선 우선순위를 정하는 그로스 빌더입니다.', education:['AI 빌더 스쿨 1기 (2026.03 수료)'], community:[], verified:false, projects:[]},
};

const works = {
  flowdesk: {name:'Flowdesk', builder:'조유리', period:'2026.05 – 2026.06', scope:'견적·발주 운영 SaaS 전체(기획~배포)', role:'PM · Full-stack', stack:['Next.js','Supabase','GA4'], problem:'분산된 견적·발주 업무가 여러 채널에 흩어져 있어 승인 지연이 잦았음', solution:'권한·상태를 반영한 단일 운영 대시보드로 견적→발주→승인 흐름을 재설계', result:'승인 리드타임 단축, 담당자별 처리 현황 실시간 확인 가능', status:'approval'},
  classroom: {name:'Classroom OS', builder:'최성훈', period:'2026.03 – 2026.04', scope:'수강·결제·콘텐츠 운영 통합 플랫폼', role:'Lead Builder', stack:['Next.js','Supabase'], problem:'수강 신청, 결제, 콘텐츠 발행이 각각 다른 도구로 관리돼 운영 부담이 큼', solution:'하나의 관리자 워크플로로 강좌 편집·발행·수강 전환 측정을 통합', result:'운영 인력 1인으로 콘텐츠·결제 관리 가능', status:'published'},
  localtable: {name:'Local Table', builder:'한도균', period:'2026.01 – 2026.02', scope:'지역 생산자–레스토랑 매칭 커머스', role:'Full-stack Builder', stack:['Next.js','Supabase','SEO'], problem:'생산자와 구매자를 정밀하게 매칭할 기준이 없어 신뢰도가 낮았음', solution:'여정을 나누어 매칭 기준을 화면에 명시하고 재고·주문 흐름을 구축', result:'초기 검색 유입 구조 확보', status:'published'},
  morrow: {name:'Morrow Care', builder:'홍영준', period:'2025.11 – 2025.12', scope:'상담~사후관리 헬스케어 고객 경험', role:'Product Builder', stack:['Next.js','CRM 연동'], problem:'상담 이후 고객과의 접점이 끊겨 이탈이 잦았음', solution:'상담 이후 다음 행동까지 연결되는 여정과 리드 관리 화면을 설계', result:'문의 전환·이탈 구간을 데이터로 확인 가능', status:'published'},
  fieldnote: {name:'Fieldnote', builder:'송인선', period:'2026.06 – 2026.07', scope:'현장 데이터 실시간 운영 도구', role:'Full-stack Builder', stack:['Next.js','Realtime DB'], problem:'현장에서 수집된 데이터가 본사에 늦게 전달돼 의사결정이 지연됨', solution:'실시간 구조화 + 우선순위 기반 알림 체계 구축', result:'현장–본사 커뮤니케이션 지연 감소', status:'approval'},
};

const insights = {
  interview: {title:'고객 인터뷰를 제품 언어로 바꾸는 법', author:'김도윤', category:'일하는 방식', status:'published', seoTitle:'고객 인터뷰를 제품 언어로 바꾸는 법 | AI Builder Group', seoDesc:'현장에서 들은 목소리를 기능 우선순위와 메시지로 정리하는 방법을 공유합니다.'},
  designsystem: {title:'AI와 함께 만드는 디자인 시스템', author:'박서연', category:'빌더가 쓴 글', status:'published', seoTitle:'AI와 함께 만드는 디자인 시스템 | AI Builder Group', seoDesc:'빠른 제작 과정에서도 제품의 일관성을 지키는 화면 규칙을 살펴봅니다.'},
  'landing-cta': {title:'전환을 확인하는 랜딩페이지 설계', author:'이준호', category:'일하는 방식', status:'in_review', seoTitle:'', seoDesc:''},
  mvp: {title:'일주일 안에 MVP 범위 정하기', author:'최하늘', category:'AI 활용 공유회', status:'draft', seoTitle:'', seoDesc:''},
};

/* ---------- 드로어 ---------- */
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerTitle = document.getElementById('drawer-title');
const drawerBody = document.getElementById('drawer-body');

function openDrawer(type, id) {
  if (type === 'builders') renderBuilder(id);
  else if (type === 'work') renderWork(id);
  else if (type === 'insight') renderInsight(id);
  else return;
  drawer.classList.add('is-open');
  drawerBackdrop.classList.add('is-open');
}
function closeDrawer() {
  drawer.classList.remove('is-open');
  drawerBackdrop.classList.remove('is-open');
}
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

document.querySelectorAll('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.open;
    const id = btn.closest('tr').dataset.id;
    openDrawer(type, id);
  });
});

function renderBuilder(id) {
  const b = builders[id];
  drawerTitle.textContent = `${b.name} · 빌더 프로필`;
  drawerBody.innerHTML = `
    <div class="field"><label>기본 프로필</label><input value="${b.name} · ${b.position} · ${b.location}" /></div>
    <div class="field"><label>전문 분야</label><div class="chips">${b.specialties.map((s) => `<span class="chip">${s}</span>`).join('')}</div></div>
    <div class="field"><label>소개</label><textarea rows="3">${b.intro}</textarea></div>
    <div class="detail-section"><h3>교육 이력</h3><ul class="detail-list">${(b.education.map((e) => `<li>${e}</li>`).join('')) || '<li>등록된 이력 없음</li>'}</ul></div>
    <div class="detail-section"><h3>커뮤니티 활동</h3><ul class="detail-list">${(b.community.map((c) => `<li>${c}</li>`).join('')) || '<li>등록된 활동 없음</li>'}</ul></div>
    <div class="detail-section"><h3>검증 정보</h3><span class="badge ${b.verified ? 'badge-green' : 'badge-amber'}">${b.verified ? '검증완료' : '검증 대기'}</span></div>
    <div class="detail-section"><h3>프로젝트 참여 이력</h3><ul class="detail-list">${b.projects.length ? b.projects.map((p) => `<li><span>${p.name}</span><span class="muted">${p.role}</span></li>`).join('') : '<li>등록된 참여 프로젝트 없음</li>'}</ul></div>
    <div class="detail-section"><h3>공개 여부</h3><span class="toggle ${b.verified ? 'is-on' : ''}"></span></div>
  `;
}

const statusLabel = { approval: '승인 대기', published: '공개' };
function renderWork(id) {
  const w = works[id];
  drawerTitle.textContent = `${w.name} · Work 상세`;
  drawerBody.innerHTML = `
    <div class="field"><label>프로젝트명</label><input value="${w.name}" /></div>
    <div class="field"><label>참여 빌더 · 빌더 역할</label><input value="${w.builder} · ${w.role}" /></div>
    <div class="field"><label>수행 범위</label><textarea rows="2">${w.scope}</textarea></div>
    <div class="field"><label>작업 기간</label><input value="${w.period}" /></div>
    <div class="field"><label>사용 기술</label><div class="chips">${w.stack.map((s) => `<span class="chip chip-yellow">${s}</span>`).join('')}</div></div>
    <div class="detail-section"><h3>문제 및 해결 과정</h3>
      <ul class="detail-list"><li><span><b>문제</b> — ${w.problem}</span></li><li><span><b>해결</b> — ${w.solution}</span></li></ul>
    </div>
    <div class="detail-section"><h3>결과</h3><p>${w.result}</p></div>
    <div class="detail-section"><h3>이미지 / 에셋</h3><p class="muted">업로드된 에셋 없음(시안 단계)</p></div>
    <div class="detail-section"><h3>공개 상태</h3>
      <div class="stepper">
        <span class="is-done">초안</span>
        <span class="is-done">검수중</span>
        <span class="${w.status === 'approval' ? 'is-current' : 'is-done'}">승인 대기</span>
        <span class="${w.status === 'published' ? 'is-current' : ''}">공개</span>
      </div>
    </div>
  `;
}

const insightStatusMeta = {
  draft: {label:'초안', badge:'badge-gray'},
  in_review: {label:'검수 중', badge:'badge-blue'},
  published: {label:'발행', badge:'badge-green'},
};
function renderInsight(id) {
  const p = insights[id];
  const meta = insightStatusMeta[p.status];
  drawerTitle.textContent = `${p.title}`;
  drawerBody.innerHTML = `
    <div class="field"><label>제목</label><input value="${p.title}" /></div>
    <div class="field"><label>본문</label><textarea rows="4" placeholder="tiptap 에디터 자리(시안)"></textarea></div>
    <div class="field"><label>작성자 · 카테고리</label><input value="${p.author} · ${p.category}" /></div>
    <div class="detail-section"><h3>SEO 정보</h3>
      <div class="field"><label>SEO 타이틀</label><input value="${p.seoTitle}" placeholder="미입력" /></div>
      <div class="field"><label>SEO 설명</label><textarea rows="2" placeholder="미입력">${p.seoDesc}</textarea></div>
    </div>
    <div class="detail-section"><h3>공개 상태</h3>
      <span class="badge ${meta.badge}">${meta.label}</span>
      <div class="lock-note">🔒 <span><b>발행 전환은 이 화면에서 할 수 없습니다.</b> 하드 룰 2에 따라 에이전트는 in_review까지만 올리고, published 전환은 사람이 검수 화면에서 직접 처리합니다.</span></div>
    </div>
  `;
}

/* ---------- 관리자 생성 ---------- */
function renderCreateAdmin() {
  drawerTitle.textContent = '관리자 생성';
  drawerBody.innerHTML = `
    <div class="field"><label>이름</label><input placeholder="담당자 이름" /></div>
    <div class="field"><label>이메일</label><input placeholder="name@aibuildergroup.co" /></div>
    <div class="field"><label>등급</label>
      <select>
        <option>최종 관리자</option>
        <option>콘텐츠 관리자</option>
        <option>검수 담당</option>
      </select>
    </div>
    <p class="hint">저장하면 초대 이메일이 발송되고, 첫 로그인 시 비밀번호를 설정하는 흐름을 가정합니다(시안 — 실제 인증은 apps/admin에 미구현, WO-3 참고).</p>
    <div class="panel-foot"><button class="btn btn-primary" disabled>초대 보내기</button></div>
  `;
  drawer.classList.add('is-open');
  drawerBackdrop.classList.add('is-open');
}
const createAdminBtn = document.getElementById('btn-create-admin');
if (createAdminBtn) createAdminBtn.addEventListener('click', renderCreateAdmin);

/* ---------- 계정 설정 (현재 로그인 계정 · 비밀번호 변경) ---------- */
function renderAccountSettings() {
  if (!currentAdmin) return;
  drawerTitle.textContent = '계정 설정';
  drawerBody.innerHTML = `
    <div class="detail-section" style="margin-top:0;border-top:0;padding-top:0">
      <h3>로그인 계정</h3>
      <ul class="detail-list">
        <li><span>이름</span><span class="muted">${currentAdmin.name}</span></li>
        <li><span>이메일</span><span class="muted">${currentAdmin.email}</span></li>
        <li><span>등급</span><span class="badge ${currentAdmin.roleClass}">${currentAdmin.role}</span></li>
      </ul>
    </div>
    <div class="detail-section">
      <h3>비밀번호 변경</h3>
      <div class="field"><label>현재 비밀번호</label><input type="password" placeholder="현재 비밀번호" /></div>
      <div class="field"><label>새 비밀번호</label><input type="password" placeholder="새 비밀번호" /></div>
      <div class="field"><label>새 비밀번호 확인</label><input type="password" placeholder="새 비밀번호 확인" /></div>
      <button class="btn btn-primary" disabled>비밀번호 변경 저장</button>
    </div>
    ${currentAdmin.type === 'builder' ? '<div class="detail-section"><button class="btn btn-ghost" id="drawer-my-profile" style="width:100%">내 프로필 보기</button></div>' : ''}
    <div class="detail-section">
      <button class="btn btn-ghost" id="drawer-logout" style="width:100%">이 계정에서 로그아웃</button>
    </div>
  `;
  const myProfileBtn = document.getElementById('drawer-my-profile');
  if (myProfileBtn) myProfileBtn.addEventListener('click', () => {
    if (currentAdmin.builderId) openDrawer('builders', currentAdmin.builderId);
    else alert('등록된 빌더 프로필과 연결되지 않은 이메일입니다(시안 데이터 안내).');
  });
  document.getElementById('drawer-logout').addEventListener('click', () => { closeDrawer(); logout(); });
  drawer.classList.add('is-open');
  drawerBackdrop.classList.add('is-open');
}
