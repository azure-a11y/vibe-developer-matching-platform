import type { Metadata } from 'next';
import Link from 'next/link';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import './builder.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Builder — 검증된 빌더',
  description: '교육을 수료하고 검수를 통과한 빌더들의 프로필과 수행 프로젝트를 확인하세요.',
};

export default async function BuilderListPage() {
  const [{ builders }, { works }] = await Promise.all([getBuilderRepository().getAll(), getWorkRepository().getAll()]);
  const active = builders.filter((b) => b.status === 'active');
  const published = works.filter((w) => w.status === 'published');

  const doneCountBySlug = new Map<string, number>();
  for (const w of published) {
    for (const id of w.builderIds) doneCountBySlug.set(id, (doneCountBySlug.get(id) ?? 0) + 1);
  }

  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <h1><span className="w300">만드는 사람들,</span> 검증된 빌더</h1>
          <p>카드를 누르면 빌더의 프로필과 수행한 작업물을 볼 수 있습니다.</p>
        </div>
      </div>
      <div className="wrap" style={{ padding: '40px 32px 100px' }}>
        <div className="bld__grid">
          {active.map((b) => (
            <Link className="bcard rv" href={`/builder/${b.slug}`} data-cursor="PROFILE →" key={b.slug}>
              <div className="slot mask">
                <img src={b.avatar?.src ?? '/assets/img/avatar-placeholder.png'} alt={`${b.displayName} 프로필 사진`} />
                {b.badgeLabel && <span className={b.isLead ? 'lv lv--lead' : 'lv lv--new'}>{b.badgeLabel}</span>}
                <div className="ct"><span>수행 <span className="num">{doneCountBySlug.get(b.slug) ?? 0}</span>건</span><span className="go">Profile →</span></div>
              </div>
              <div className="meta">
                <b>{b.displayName}</b>
                <span className="role">{b.role}</span>
                <p>{b.bio}</p>
                <div className="stk">{b.specialties.slice(0, 2).map((s) => <i key={s}>{s}</i>)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
