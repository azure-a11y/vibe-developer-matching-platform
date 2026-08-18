import Link from 'next/link';
import { getVideoRepository } from '@orca/content';

import { createVideoAction } from '@/app/video/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { CountSummary } from '@/components/CountSummary';
import { EmptyState } from '@/components/EmptyState';
import { CreatePanel } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export default async function VideoListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const account = await requireMenuPermission('video', 'view');
  const canWrite = hasPermission(account.menuPermissions.video, 'edit_approve');

  const { q = '', page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { videos: allVideos, errors } = await getVideoRepository().getAll();

  const counts = {
    total: allVideos.length,
    featured: allVideos.filter((v) => v.featured).length,
  };

  const query = q.trim().toLowerCase();
  const videos = allVideos.filter((video) => query.length === 0 || video.title.toLowerCase().includes(query));

  const totalPages = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedVideos = videos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `/video?${qs}` : '/video';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video"
        description={
          <CountSummary
            total={counts.total}
            items={[{ label: '대표영상', count: counts.featured, tone: 'confirmed' }]}
          />
        }
      />

      {errors.length > 0 && (
        <div className="rounded-lg p-4 text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
          <p className="font-semibold">프론트매터 오류가 있는 파일이 있습니다:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error} className="whitespace-pre-wrap font-mono text-xs">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canWrite && (
        <CreatePanel label="+ 영상 추가">
          <form action={createVideoAction} className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-72 flex-1">
                <label className="label" htmlFor="title">
                  제목
                </label>
                <input id="title" name="title" className="field" placeholder="예: 2025 똑똑한개발자 상반기 워크샵" required />
              </div>
              <div className="min-w-72 flex-1">
                <label className="label" htmlFor="youtubeUrl">
                  유튜브 URL
                </label>
                <input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  className="field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              <div className="w-28">
                <label className="label" htmlFor="order">
                  정렬 순서
                </label>
                <input id="order" name="order" type="number" defaultValue={0} className="field" />
              </div>
            </div>
            <label className="flex w-fit items-center gap-2 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              <input type="checkbox" name="featured" className="size-4 accent-[var(--color-accent)]" />
              대표영상으로 지정 (기존 대표영상은 자동 해제됩니다)
            </label>
            <button type="submit" className="btn-primary">
              영상 추가
            </button>
          </form>
        </CreatePanel>
      )}

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="label" htmlFor="q">
            검색
          </label>
          <input id="q" name="q" className="field" placeholder="제목으로 검색" defaultValue={q} />
        </div>
        <button type="submit" className="btn-secondary">
          검색
        </button>
      </form>

      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['영상', '대표', '순서', '수정일']} centerColumns={[1, 2]} />
          </thead>
          <tbody className="divide-y">
            {pagedVideos.map((video) => (
              <tr key={video.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt=""
                      className="h-10 w-[72px] shrink-0 rounded object-cover"
                      style={{ background: 'var(--color-surface-sunken)' }}
                    />
                    <div className="min-w-0">
                      <Link href={`/video/${encodeURIComponent(video.slug)}`} className="font-medium hover:underline">
                        {video.title}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                        {video.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  {video.featured && <span className="badge badge-confirmed">대표</span>}
                </td>
                <td className="px-5 py-4 text-center tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
                  {video.order}
                </td>
                <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                  {video.updatedAt.slice(0, 10)}
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState>
                    {allVideos.length === 0 ? '아직 등록된 영상이 없습니다. 위에서 추가해 보세요.' : '검색 조건에 맞는 영상이 없습니다.'}
                  </EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
