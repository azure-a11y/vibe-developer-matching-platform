import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettingsRepository } from '@orca/content';

import './privacy.css';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  robots: { index: false },
};

/* [[ ]] 안쪽을 눈에 띄는 표식으로 감싼다 — 채워지지 않은 채로 발행되는 걸 막는다 */
function Text({ s }: { s: string }) {
  const parts = s.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[[') && p.endsWith(']]') ? (
          <mark className="todo" key={i}>{p.slice(2, -2).trim()}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

type Block = string | string[];
type Sec = { no: string; title: string; body: Block[] };

export default async function PrivacyPage() {
  const { settings } = await getSiteSettingsRepository().get();
  const brand = settings.brandName || 'AI 빌더 그룹';
  const bizLine = settings.companyName
    ? `상호 ${settings.companyName}${settings.ceoName ? ` · 대표 ${settings.ceoName}` : ''}${
        settings.businessRegistrationNumber ? ` · 사업자등록번호 ${settings.businessRegistrationNumber}` : ''
      }${settings.operatedBy ? ` · ${settings.operatedBy}` : ''}`
    : '상호 · 대표 · 사업자등록번호 — [[ 사이트 정식 오픈과 함께 게재 ]]';

  const SECTIONS: Sec[] = [
    {
      no: '01',
      title: '수집하는 개인정보 항목',
      body: [
        `${brand}은(는) 다음의 개인정보를 수집합니다. 이용자가 직접 입력한 정보만 수집하며, 주민등록번호 등 고유식별정보는 수집하지 않습니다.`,
        [
          '프로젝트 문의 시 (필수) — 회사명, 담당자명, 연락처, 이메일 주소, 문의 내용',
          '프로젝트 문의 시 (선택) — 프로젝트 유형, 예산 규모',
          '온라인 상담(채널톡) 이용 시 — 상담 대화 내용, 이용자가 상담 중 직접 제공한 연락처',
          '서비스 이용 과정에서 자동 생성 — 접속 일시, 브라우저 종류, 유입 경로(UTM) 정보',
        ],
      ],
    },
    {
      no: '02',
      title: '수집·이용 목적',
      body: [
        [
          '프로젝트 문의에 대한 확인·상담 및 견적 안내',
          '프로젝트 범위·일정 협의 및 계약 체결에 관한 연락',
          '서비스 개선을 위한 유입 경로 분석(개인을 식별하지 않는 통계 형태)',
        ],
        '수집한 개인정보는 위 목적 외의 용도로 이용하지 않으며, 목적이 변경되는 경우 별도의 동의를 받습니다. 광고성 정보는 별도 동의 없이 발송하지 않습니다.',
      ],
    },
    {
      no: '03',
      title: '보유·이용 기간',
      body: [
        '원칙적으로 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만 다음의 경우에는 명시한 기간 동안 보관합니다.',
        [
          '프로젝트 문의 정보 — 문의 응대 완료 후 [[ 보유 기간 · 예: 1년 ]]',
          '계약이 체결된 경우 — 계약 및 정산 관계 종료 후 관계 법령에서 정한 기간',
          '전자상거래 등에서의 소비자보호에 관한 법률에 따른 소비자 불만 또는 분쟁 처리 기록 — 3년',
        ],
      ],
    },
    {
      no: '04',
      title: '처리 위탁',
      body: [
        '회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다. 위탁 계약 시 개인정보 보호 관련 법령 준수, 재위탁 제한, 안전성 확보 조치에 관한 사항을 계약서에 명시합니다.',
        [
          '플러그(pluug) — 프로젝트 문의 폼 운영 및 문의 내역 관리',
          '주식회사 채널코퍼레이션(채널톡) — 온라인 상담 운영',
          'Vercel Inc. — 웹사이트 호스팅 및 서비스 운영 인프라',
        ],
        '문의 폼은 위탁사(pluug)가 제공하는 폼을 그대로 사용하며, 입력하신 내용은 회사의 별도 데이터베이스에 저장되지 않습니다.',
      ],
    },
    {
      no: '05',
      title: '개인정보의 국외 이전',
      body: [
        '회사는 서비스 운영을 위해 국외에 소재한 사업자의 인프라를 이용합니다.',
        [
          '이전받는 자 — Vercel Inc.',
          '이전 국가 — 미국',
          '이전 항목 — 서비스 이용 과정에서 자동 생성되는 접속 기록',
          '이전 목적 및 보유 기간 — 웹사이트 호스팅, 서비스 제공 기간 동안',
        ],
        '이용자는 개인정보의 국외 이전을 거부할 수 있으며, 거부하시는 경우 웹사이트 이용이 제한될 수 있습니다.',
      ],
    },
    {
      no: '06',
      title: '정보주체의 권리와 행사 방법',
      body: [
        '이용자는 언제든지 자신의 개인정보에 대해 다음의 권리를 행사할 수 있습니다.',
        ['개인정보 열람 요구', '오류가 있는 경우 정정 요구', '삭제 요구', '처리 정지 요구'],
        '권리 행사는 아래 개인정보 보호책임자에게 서면, 전자우편 등으로 요청하실 수 있으며, 회사는 지체 없이 조치합니다. 법정대리인이나 위임을 받은 자를 통해서도 요청할 수 있습니다.',
      ],
    },
    {
      no: '07',
      title: '개인정보의 안전성 확보 조치',
      body: [
        [
          '개인정보 취급 담당자를 최소한으로 지정하고 접근 권한을 관리합니다.',
          '개인정보가 오가는 구간에 대해 통신 암호화(HTTPS)를 적용합니다.',
          '위탁사의 관리 도구 접근은 계정 단위로 부여하고, 담당자 변경 시 즉시 회수합니다.',
        ],
      ],
    },
    {
      no: '08',
      title: '개인정보 보호책임자',
      body: [
        '개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.',
        [
          `상호 — ${settings.companyName || '[[ 사업자 상호 ]]'}`,
          '개인정보 보호책임자 — [[ 성명 · 직위 ]]',
          '연락처 — [[ 이메일 · 전화번호 ]]',
        ],
        '개인정보 침해에 대한 신고나 상담이 필요하신 경우 개인정보분쟁조정위원회(1833-6972), 개인정보침해신고센터(118), 대검찰청 사이버수사과(1301), 경찰청 사이버수사국(182)으로 문의하실 수 있습니다.',
      ],
    },
    {
      no: '09',
      title: '고지의 의무',
      body: [
        '이 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 경우 시행일로부터 최소 7일 전에 웹사이트를 통해 공지합니다. 다만 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 공지합니다.',
      ],
    },
  ];

  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <Link className="backlink" href="/">홈으로</Link>
          <h1>개인정보처리방침</h1>
          <p><Text s={bizLine} /></p>
        </div>
      </div>

      <div className="doc">
        {SECTIONS.map((s) => (
          <section key={s.no}>
            <h2><span className="no">{s.no}</span>{s.title}</h2>
            {s.body.map((b, i) =>
              Array.isArray(b) ? (
                <ul key={i}>
                  {b.map((li, j) => (
                    <li key={j}><Text s={li} /></li>
                  ))}
                </ul>
              ) : (
                <p key={i}><Text s={b} /></p>
              ),
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
