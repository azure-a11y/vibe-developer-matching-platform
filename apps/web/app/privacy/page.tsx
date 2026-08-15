import type { Metadata } from 'next';

import './privacy.css';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <main id="main">
      <div className="wrap" style={{ padding: '60px 32px 100px', maxWidth: 776 }}>
        <h1>개인정보처리방침</h1>
        <p style={{ color: 'var(--muted)', marginTop: 16 }}>
          AI 빌더 그룹은 문의 접수를 위해 회사/담당자명, 연락처, 이메일, 프로젝트 내용을 수집합니다. 문의 폼은
          pluug(외부 서비스)를 통해 접수되며, 개인정보는 pluug에 위탁 처리됩니다. 수집한 정보는 상담·견적 목적으로만
          사용하며, 목적 달성 후 관계 법령에 따라 보관 후 파기합니다.
        </p>
        <p style={{ color: 'var(--muted)', marginTop: 16 }}>
          사업자 정보(회사명·대표자·사업자등록번호)는 사이트 정식 오픈과 함께 게재됩니다. 현재 게시된 내용은 확정
          이전 정보이므로 임의로 채워 넣지 않았습니다.
        </p>
      </div>
    </main>
  );
}
