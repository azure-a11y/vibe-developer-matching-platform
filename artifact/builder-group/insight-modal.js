const insightDialog = document.createElement('dialog');
insightDialog.className = 'insight-detail-dialog';
document.body.append(insightDialog);

function openInsightDetail(post) {
  const image = post.querySelector('img');
  const title = post.querySelector('h3').textContent;
  const excerpt = post.querySelector('p').textContent;
  const meta = post.querySelector('small').textContent;
  insightDialog.innerHTML = `<article class="insight-detail"><button class="insight-detail-close" type="button" aria-label="닫기">×</button><p class="insight-detail-overline">INSIGHT / BUILDER NOTE</p><img src="${image.src}" alt="${image.alt}"><header><p>${meta}</p><h2>${title}</h2><p class="insight-detail-lead">${excerpt}</p></header><div class="insight-detail-body"><p>프로젝트 현장에서 발견한 질문을 제품의 언어로 다시 정리합니다. 사용자의 실제 맥락과 팀의 실행 조건을 함께 살피며, 다음 선택이 분명해지는 기준을 만듭니다.</p><p>이 글은 관리자와 빌더가 직접 발행한 기록입니다. 작은 가설을 빠르게 확인하고, 결과를 다음 화면과 운영 방식으로 연결하는 과정을 담았습니다.</p><aside><b>KEY NOTE</b><span>Builder Group Insight</span><span>읽는 시간 4분</span></aside></div></article>`;
  insightDialog.querySelector('.insight-detail-close').addEventListener('click', () => insightDialog.close());
  insightDialog.showModal();
}

document.querySelectorAll('.card-stack article').forEach((post) => {
  post.tabIndex = 0;
  post.addEventListener('click', () => openInsightDetail(post));
  post.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openInsightDetail(post); }
  });
});

insightDialog.addEventListener('click', (event) => { if (event.target === insightDialog) insightDialog.close(); });
