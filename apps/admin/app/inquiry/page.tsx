import Link from 'next/link';

import { TbdNote } from '@/components/FormPrimitives';
import { requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const PLUUG_ADMIN_URL = process.env.PLUUG_ADMIN_URL?.trim() || '';

export default async function InquiryPage() {
  await requireMenuPermission('inquiry', 'view');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Inquiry</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
          문의(리드) 관리 — 외부 시스템(pluug) 연동 지점
        </p>
      </header>

      <div className="card max-w-2xl space-y-4">
        <p className="text-sm leading-6" style={{ color: 'var(--color-ink-muted)' }}>
          문의는 pluug(CRM)가 전담합니다 — 리드는 이 사이트의 DB에 저장하지 않고, 영업 담당자가 pluug에서
          직접 배정받습니다(<code className="font-mono text-xs">04_정책정의.md</code> §2.3, 기획서 D3). 이
          화면은 자체 문의 목록을 두지 않고, 아래 버튼으로 pluug의 문의 관리 화면으로 이동하는 연동 지점만
          제공합니다.
        </p>

        {PLUUG_ADMIN_URL ? (
          <div className="space-y-1.5">
            <a href={PLUUG_ADMIN_URL} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
              pluug 문의 관리 열기 ↗
            </a>
            <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
              새 탭에서 pluug 관리자 화면으로 이동합니다.
            </p>
          </div>
        ) : (
          <TbdNote title="pluug 관리 화면 URL 미확정">
            현재 pluug는 임시 계정으로 연동돼 있고 정식 관리자 URL은 확정되지 않았습니다(§8 Q7/Q20).
            확정되면 환경변수 <code className="font-mono">PLUUG_ADMIN_URL</code>에 설정하세요 — 코드 변경
            없이 위 버튼이 활성화됩니다.
          </TbdNote>
        )}

        <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
          공개 사이트 "문의하기" 버튼이 여는 폼 링크는 여기가 아니라{' '}
          <Link href="/settings" className="hover:underline" style={{ color: 'var(--color-accent)' }}>
            Settings
          </Link>
          에서 관리합니다.
        </p>
      </div>
    </div>
  );
}
