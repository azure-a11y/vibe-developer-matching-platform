'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type WorkCategory, type WorkFrontmatterInput, type WorkStatus, getWorkRepository, slugify } from '@orca/content';

import { requireContentPermission } from '@/lib/permissions';

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function list(form: FormData, key: string): string[] {
  return text(form, key)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createWorkAction(formData: FormData) {
  const account = await requireContentPermission('work', 'edit_approve');

  const title = text(formData, 'title');
  if (!title) throw new Error('프로젝트명은 필수입니다.');

  const repo = getWorkRepository();
  const slug = slugify(text(formData, 'slug') || title) || `work-${Date.now()}`;
  if (await repo.getBySlug(slug)) throw new Error(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  await repo.save({
    title,
    slug,
    status: 'pending_review',
    ownerBuilderId: account.role === 'builder' ? account.builderId : null,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath('/');
  revalidatePath('/work');
  redirect(`/work/${encodeURIComponent(slug)}`);
}

export async function saveWorkAction(formData: FormData) {
  const account = await requireContentPermission('work', 'edit_approve');

  const repo = getWorkRepository();
  const slug = text(formData, 'slug');
  const existing = await repo.getBySlug(slug);
  if (!existing) throw new Error(`Work를 찾을 수 없습니다: ${slug}`);

  if (account.role === 'builder' && existing.ownerBuilderId !== account.builderId) throw new Error('본인 Work만 수정할 수 있습니다.');

  const frontmatter: WorkFrontmatterInput = {
    ...existing,
    title: text(formData, 'title') || existing.title,
    summary: text(formData, 'summary'),
    scope: text(formData, 'scope'),
    builderRole: text(formData, 'builderRole'),
    period: text(formData, 'period'),
    techStack: list(formData, 'techStack'),
    problem: text(formData, 'problem'),
    solution: text(formData, 'solution'),
    result: text(formData, 'result'),
    status: account.role === 'builder' ? 'pending_review' : (text(formData, 'status') || existing.status) as WorkStatus,
    ownerBuilderId: existing.ownerBuilderId,
    builderIds: formData.getAll('builderIds').map(String),
    category: (text(formData, 'category') || existing.category) as WorkCategory,
    tag: text(formData, 'tag'),
    year: text(formData, 'year'),
    partner: text(formData, 'partner'),
  };

  await repo.save(frontmatter);

  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath(`/work/${slug}`);
}

export async function deleteWorkAction(formData: FormData) {
  await requireContentPermission('work', 'full');

  await getWorkRepository().remove(text(formData, 'slug'));
  revalidatePath('/');
  revalidatePath('/work');
  redirect('/work');
}
