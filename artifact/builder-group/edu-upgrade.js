const eduCourses = [
  {title:'김이솝의 AI 가이드 · 바이브코딩과 AI 활용',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/@%EA%B9%80%EC%9D%B4%EC%86%9D%EC%9D%98AI%EA%B0%80%EC%9D%B4%EB%93%9C',pdfTitle:'01 · 바이브코딩과 클로드의 시작',pdf:'클로드 코드로 아이디어를 화면과 기능으로 바꾸는 첫 흐름을 다룹니다. 원하는 결과를 명확한 요청으로 바꾸고, 작은 단위로 결과를 확인하는 방법을 정리합니다.'},
  {title:'바이브코딩 워크플로: 아이디어에서 첫 화면까지',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9+%EC%9B%8C%ED%81%AC%ED%94%8C%EB%A1%9C',pdfTitle:'02 · 아이디어에서 첫 화면까지',pdf:'목표와 사용자를 먼저 정리한 뒤, 화면과 기능을 작은 실행 단위로 나누는 워크플로입니다. 검토 가능한 결과를 빠르게 만드는 순서를 안내합니다.'},
  {title:'검증 가능한 MVP 설계',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%EA%B2%80%EC%A6%9D+%EA%B0%80%EB%8A%A5%ED%95%9C+MVP+%EC%84%A4%EA%B3%84',pdfTitle:'03 · 검증 가능한 MVP 설계',pdf:'완성도보다 먼저 검증할 가설을 정하고, 첫 버전에 꼭 필요한 기능만 남기는 방법입니다. 사용자 반응을 다음 개선으로 연결하는 기준을 함께 다룹니다.'},
  {title:'출시 이후의 서비스 운영',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%EC%B6%9C%EC%8B%9C+%EC%9D%B4%ED%9B%84+%EC%84%9C%EB%B9%84%EC%8A%A4+%EC%9A%B4%EC%98%81',pdfTitle:'04 · 출시 이후의 운영',pdf:'출시 후 문의와 이탈 데이터를 살피고, 콘텐츠와 기능 업데이트의 우선순위를 정하는 운영 루틴입니다. 제품을 계속 성장시키는 관찰 항목을 요약합니다.'},
  {title:'프롬프트 구조 설계',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8+%EA%B5%AC%EC%A1%B0+%EC%84%A4%EA%B3%84',pdfTitle:'05 · 프롬프트 구조 설계',pdf:'AI가 이해할 수 있도록 목표, 맥락, 제약 조건과 결과 형식을 정리하는 방법입니다. 반복해서 쓸 수 있는 작업 지시 구조를 만듭니다.'},
  {title:'사용자 흐름과 화면 기획',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%EC%82%AC%EC%9A%A9%EC%9E%90+%ED%9D%90%EB%A6%84+%ED%99%94%EB%A9%B4+%EA%B8%B0%ED%9A%8D',pdfTitle:'06 · 사용자 흐름과 화면 기획',pdf:'사용자가 서비스를 발견하고 목표를 마칠 때까지의 흐름을 먼저 그리고, 그 흐름을 화면 구조와 CTA로 연결하는 방법을 다룹니다.'},
  {title:'AI 디자인 시스템 입문',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=AI+%EB%94%94%EC%9E%90%EC%9D%B8+%EC%8B%9C%EC%8A%A4%ED%85%9C+%EC%9E%85%EB%AC%B8',pdfTitle:'07 · AI 디자인 시스템 입문',pdf:'빠르게 화면을 만들면서도 브랜드의 인상을 유지하기 위한 컬러, 타이포그래피, 컴포넌트 규칙을 정리합니다.'},
  {title:'데이터 기반 전환 개선',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%EB%8D%B0%EC%9D%B4%ED%84%B0+%EA%B8%B0%EB%B0%98+%EC%A0%84%ED%99%98+%EA%B0%9C%EC%84%A0',pdfTitle:'08 · 데이터 기반 전환 개선',pdf:'주요 행동과 전환 지점을 측정하고, 어떤 화면을 먼저 개선할지 결정하는 데이터 기반의 판단 방식을 요약합니다.'},
  {title:'클라이언트 협업 실전',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8+%ED%98%91%EC%97%85+%EC%8B%A4%EC%A0%84',pdfTitle:'09 · 클라이언트 협업 실전',pdf:'일정과 의사결정 기준을 일찍 공유하고, 피드백을 실행 가능한 수정 항목으로 바꾸는 협업 방식입니다.'},
  {title:'콘텐츠와 서비스 운영',videoId:'yo32U8qTIMs',url:'https://www.youtube.com/results?search_query=%EC%BD%98%ED%85%90%EC%B8%A0+%EC%84%9C%EB%B9%84%EC%8A%A4+%EC%9A%B4%EC%98%81',pdfTitle:'10 · 콘텐츠와 서비스 운영',pdf:'콘텐츠 발행, 고객 반응, 제품 개선을 하나의 주기로 연결해 서비스를 지속적으로 운영하는 흐름을 다룹니다.'}
];

// The exact official channel is selected later in the CMS. Until then, each
// lesson opens a YouTube search for Aesop plus the lesson topic as a sample.
const aesopYoutubeQueries = [
  '이솝 바이브코딩',
  '이솝 클로드 코드',
  '이솝 AI 교육',
  '이솝 서비스 운영',
  '이솝 프롬프트',
  '이솝 화면 기획',
  '이솝 AI 디자인',
  '이솝 데이터 분석',
  '이솝 협업',
  '이솝 콘텐츠 운영'
];

// Until the official Aesop playlist is connected, this is the approved sample
// video-view address used by the EDU section (rather than a search-results page).
const kimAesopChannelId = 'UCjf8cxzqPlayWaJpmtvNC-A';
const kimAesopUploadsId = 'UUjf8cxzqPlayWaJpmtvNC-A';
const aesopYoutubeUrl = () => `https://www.youtube.com/playlist?list=${kimAesopUploadsId}`;

const videoFrame = document.querySelector('#video-frame');
videoFrame.allow = 'autoplay; encrypted-media; picture-in-picture';
const videoHeading = document.querySelector('#video-title');
const pdfHeading = document.querySelector('#pdf-title');
const pdfCopy = document.querySelector('#pdf-copy');
const pdfNumber = document.querySelector('#pdf-no');
const videoContainer = document.querySelector('.video');
const pdfContainer = document.querySelector('.pdf');
const videoLink = document.createElement('a');
videoLink.className = 'edu-video-link';
videoLink.target = '_blank';
videoLink.rel = 'noreferrer';
videoContainer.append(videoLink);
const downloadButton = document.createElement('button');
downloadButton.className = 'pdf-download';
downloadButton.type = 'button';
downloadButton.textContent = 'PDF 자료 다운로드 ↗';
downloadButton.addEventListener('click', () => alert('PDF 자료는 관리자에게 문의해 주세요.'));
pdfContainer.append(downloadButton);

const youtubeTransition = document.createElement('div');
youtubeTransition.className = 'edu-youtube-transition';
youtubeTransition.setAttribute('aria-live', 'polite');
youtubeTransition.innerHTML = '<div><span class="edu-youtube-mark">▶</span><p>\uC720\uD29C\uBE0C\uB85C \uC5F0\uACB0\uB429\uB2C8\uB2E4.</p><b><i>\uD558\uB098</i><i>\uB458</i><i>\uC14B</i></b></div>';
document.body.append(youtubeTransition);

function openYoutubeWithTransition(url) {
  const externalWindow = window.open('about:blank', '_blank');
  youtubeTransition.classList.add('is-visible');
  window.setTimeout(() => {
    if (externalWindow) externalWindow.location.href = url;
    else window.location.href = url;
    youtubeTransition.classList.remove('is-visible');
  }, 1250);
}

function selectEduCourse(index, openYoutube) {
  const course = eduCourses[index];
  videoFrame.src = `https://www.youtube-nocookie.com/embed?listType=playlist&list=${kimAesopUploadsId}&autoplay=1&mute=1&rel=0`;
  videoFrame.title = course.title;
  videoHeading.textContent = course.title;
  pdfHeading.textContent = course.pdfTitle;
  pdfCopy.textContent = course.pdf;
  pdfNumber.textContent = String(index + 1).padStart(2, '0');
  const sampleUrl = aesopYoutubeUrl(index);
  videoLink.href = sampleUrl;
  videoLink.textContent = 'YouTube에서 영상 열기 ↗';
  document.querySelectorAll('.course-list button').forEach((button, buttonIndex) => {
    button.classList.toggle('active', buttonIndex === index);
    button.querySelector('b').textContent = eduCourses[buttonIndex].title;
  });
  if (openYoutube) openYoutubeWithTransition(sampleUrl);
}

document.querySelectorAll('.course-list button').forEach((button, index) => {
  button.addEventListener('click', () => selectEduCourse(index, true));
});
selectEduCourse(0, false);
