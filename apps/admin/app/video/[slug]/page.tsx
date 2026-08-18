import { notFound } from 'next/navigation';
import { getVideoRepository } from '@orca/content';

import { deleteVideoAction, saveVideoAction } from '@/app/video/actions';
import { DetailNav } from '@/components/DetailNav';
import { SaveButton } from '@/components/SaveButton';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function VideoEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const account = await requireMenuPermission('video', 'view');
  const canWrite = hasPermission(account.menuPermissions.video, 'edit_approve');
  const canDelete = hasPermission(account.menuPermissions.video, 'full');

  const { slug } = await params;
  const repo = getVideoRepository();
  const [video, { videos: allVideos }] = await Promise.all([repo.getBySlug(decodeURIComponent(slug)), repo.getAll()]);
  if (!video) notFound();

  // 목록과 동일한 정렬(order → title) 기준으로 이전/다음을 찾는다.
  const currentIndex = allVideos.findIndex((v) => v.slug === video.slug);
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : undefined;
  const nextVideo = currentIndex >= 0 && currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : undefined;

  return (
    <form action={saveVideoAction} className="space-y-8">
      <input type="hidden" name="slug" value={video.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{video.title}</h1>
          {video.featured && <span className="badge badge-confirmed">대표영상</span>}
        </div>
        <div className="flex items-center gap-6">
          <DetailNav
            listHref="/video"
            prev={prevVideo && { href: `/video/${encodeURIComponent(prevVideo.slug)}`, label: prevVideo.title }}
            next={nextVideo && { href: `/video/${encodeURIComponent(nextVideo.slug)}`, label: nextVideo.title }}
          />
          {canWrite && <SaveButton />}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">영상 정보</h2>
            <div>
              <label className="label" htmlFor="title">
                제목
              </label>
              <input id="title" name="title" className="field" defaultValue={video.title} />
            </div>
            <div>
              <label className="label" htmlFor="youtubeUrl">
                유튜브 URL
              </label>
              <input id="youtubeUrl" name="youtubeUrl" className="field" defaultValue={video.youtubeUrl} />
              <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                URL을 바꾸면 저장 시 영상 ID를 다시 추출합니다.
              </p>
            </div>
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt={video.title}
              className="w-full max-w-md rounded-lg"
              style={{ background: 'var(--color-surface-sunken)' }}
            />
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">노출 · 정렬</h2>
            <label
              className="flex items-start gap-2 rounded-lg p-3 text-sm"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <input
                type="checkbox"
                name="featured"
                defaultChecked={video.featured}
                className="mt-0.5 size-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="font-medium">대표영상</span>
                <span className="block text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                  공개 페이지 상단 중앙에 고정 노출됩니다. 저장 시 다른 영상의 대표영상 지정은 자동 해제됩니다.
                </span>
              </span>
            </label>
            <div>
              <label className="label" htmlFor="order">
                정렬 순서 (낮을수록 먼저)
              </label>
              <input id="order" name="order" type="number" className="field" defaultValue={video.order} />
            </div>
            <div>
              <span className="label">슬러그</span>
              <p className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}>
                {video.slug}
              </p>
            </div>
          </section>

          {canDelete && (
            <section className="card space-y-3" style={{ borderColor: 'var(--color-danger-bg)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--color-danger)' }}>
                위험 구역
              </h2>
              <button
                type="submit"
                formAction={deleteVideoAction}
                className="btn w-full"
                style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
              >
                이 영상 삭제
              </button>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
