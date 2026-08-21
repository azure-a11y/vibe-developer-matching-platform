'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type VideoFrontmatterInput, extractYoutubeId, getVideoRepository, slugify } from '@orca/content';

import { requireMenuPermission } from '@/lib/permissions';

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function bool(form: FormData, key: string): boolean {
  const value = text(form, key);
  return value === 'on' || value === 'true';
}

function num(form: FormData, key: string, fallback: number): number {
  const value = Number(text(form, key));
  return Number.isFinite(value) ? value : fallback;
}

function parseYoutubeId(url: string): string {
  const id = extractYoutubeId(url);
  if (!id) throw new Error('유튜브 URL에서 영상 ID를 찾을 수 없습니다. watch/youtu.be/shorts/embed 형식인지 확인하세요.');
  return id;
}

export async function createVideoAction(formData: FormData) {
  await requireMenuPermission('video', 'edit_approve');

  const title = text(formData, 'title');
  if (!title) throw new Error('제목은 필수입니다.');
  const youtubeUrl = text(formData, 'youtubeUrl');
  if (!youtubeUrl) throw new Error('유튜브 URL은 필수입니다.');
  const youtubeId = parseYoutubeId(youtubeUrl);

  const repo = getVideoRepository();
  const slug = slugify(text(formData, 'slug') || title) || `video-${Date.now()}`;
  if (await repo.getBySlug(slug)) throw new Error(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  await repo.save({
    title,
    slug,
    youtubeUrl,
    youtubeId,
    order: num(formData, 'order', 0),
    featured: bool(formData, 'featured'),
    status: text(formData, 'status') === 'private' ? 'private' : 'published',
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath('/');
  revalidatePath('/video');
  redirect(`/video/${encodeURIComponent(slug)}`);
}

export async function saveVideoAction(formData: FormData) {
  await requireMenuPermission('video', 'edit_approve');

  const repo = getVideoRepository();
  const slug = text(formData, 'slug');
  const existing = await repo.getBySlug(slug);
  if (!existing) throw new Error(`영상을 찾을 수 없습니다: ${slug}`);

  const youtubeUrl = text(formData, 'youtubeUrl') || existing.youtubeUrl;
  const youtubeId = youtubeUrl === existing.youtubeUrl ? existing.youtubeId : parseYoutubeId(youtubeUrl);

  const frontmatter: VideoFrontmatterInput = {
    ...existing,
    title: text(formData, 'title') || existing.title,
    youtubeUrl,
    youtubeId,
    order: num(formData, 'order', existing.order),
    featured: bool(formData, 'featured'),
    status: text(formData, 'status') === 'private' ? 'private' : 'published',
  };

  await repo.save(frontmatter);

  revalidatePath('/');
  revalidatePath('/video');
  revalidatePath(`/video/${slug}`);
}

export async function deleteVideoAction(formData: FormData) {
  await requireMenuPermission('video', 'full');

  await getVideoRepository().remove(text(formData, 'slug'));
  revalidatePath('/');
  revalidatePath('/video');
  redirect('/video');
}
