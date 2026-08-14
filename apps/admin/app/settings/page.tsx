import { getSiteSettingsRepository } from '@orca/content';

import { saveSiteSettingsAction } from '@/app/settings/actions';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const account = await requireMenuPermission('settings', 'view');
  const canWrite = hasPermission(account.menuPermissions.settings, 'edit_approve');

  const { settings, error } = await getSiteSettingsRepository().get();

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">사이트 전역 설정 — 여기서 바꾸면 공개 사이트에 즉시 반영됩니다.</p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">저장된 설정 파일에 오류가 있습니다:</p>
          <p className="mt-2 whitespace-pre-wrap font-mono text-xs">{error}</p>
        </div>
      )}

      <form action={canWrite ? saveSiteSettingsAction : undefined} className="space-y-8">
        <section className="card space-y-4">
          <div>
            <h2 className="font-semibold">사이트 기본</h2>
            <p className="mt-1 text-xs text-neutral-500">
              브랜드명·도메인이 아직 확정되지 않았다면(§8 Q1/Q3) 비워두세요 — 코드에는 이 값이 하드코딩되지
              않습니다.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="brandName">브랜드명</label>
            <input
              id="brandName"
              name="brandName"
              className="field"
              defaultValue={settings.brandName}
              placeholder="예: AI Builder Group (미확정)"
              readOnly={!canWrite}
            />
          </div>
          <div>
            <label className="label" htmlFor="domain">도메인</label>
            <input
              id="domain"
              name="domain"
              className="field"
              defaultValue={settings.domain}
              placeholder="예: aibuildergroup.co (미확정)"
              readOnly={!canWrite}
            />
          </div>
        </section>

        <section className="card space-y-4">
          <div>
            <h2 className="font-semibold">문의 폼 (pluug)</h2>
            <p className="mt-1 text-xs text-neutral-500">
              공개 사이트 "문의하기"가 여는 pluug 폼 링크입니다(FR-5 AC-5.3). 여기서 바꾸면 문의하기
              진입점 전체에 즉시 반영됩니다. pluug 관리자 화면 자체로 이동하는 링크는 Inquiry 메뉴에
              별도로 있습니다(환경변수 <code className="font-mono text-xs">PLUUG_ADMIN_URL</code>).
            </p>
          </div>
          <div>
            <label className="label" htmlFor="pluugFormUrl">pluug 폼 URL</label>
            <input
              id="pluugFormUrl"
              name="pluugFormUrl"
              className="field"
              defaultValue={settings.pluugFormUrl}
              placeholder="https://pluug.example.com/forms/..."
              readOnly={!canWrite}
            />
          </div>
        </section>

        <section className="card space-y-4">
          <div>
            <h2 className="font-semibold">회사 정보 (푸터)</h2>
            <p className="mt-1 text-xs text-neutral-500">
              ⚠️ PRD §8 Q12 — 아래 값은 아직 사실 확인되지 않았습니다. 실제 확정된 사업자 정보를 확인하기
              전에는 비워두거나 추측으로 채우지 마세요.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="companyName">회사명</label>
            <input id="companyName" name="companyName" className="field" defaultValue={settings.companyName} readOnly={!canWrite} />
          </div>
          <div>
            <label className="label" htmlFor="ceoName">대표자</label>
            <input id="ceoName" name="ceoName" className="field" defaultValue={settings.ceoName} readOnly={!canWrite} />
          </div>
          <div>
            <label className="label" htmlFor="businessRegistrationNumber">사업자등록번호</label>
            <input
              id="businessRegistrationNumber"
              name="businessRegistrationNumber"
              className="field"
              defaultValue={settings.businessRegistrationNumber}
              readOnly={!canWrite}
            />
          </div>
          <div>
            <label className="label" htmlFor="operatedBy">운영주체</label>
            <input id="operatedBy" name="operatedBy" className="field" defaultValue={settings.operatedBy} readOnly={!canWrite} />
          </div>
        </section>

        {canWrite && (
          <button type="submit" className="btn-primary">
            저장
          </button>
        )}
      </form>
    </div>
  );
}
