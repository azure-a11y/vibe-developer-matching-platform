'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  type BuilderFrontmatterInput,
  type BuilderStatus,
  type ImageSource,
  getBuilderRepository,
  slugify,
} from '@orca/content';

import { requireMenuPermission } from '@/lib/permissions';

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function list(form: FormData, key: string): string[] {
  return text(form, key)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function bool(form: FormData, key: string): boolean {
  const value = text(form, key);
  return value === 'on' || value === 'true';
}

export async function createBuilderAction(formData: FormData) {
  await requireMenuPermission('builder', 'edit_approve');

  const displayName = text(formData, 'displayName');
  if (!displayName) throw new Error('이름은 필수입니다.');

  const repo = getBuilderRepository();
  const slug = slugify(text(formData, 'slug') || displayName) || `builder-${Date.now()}`;
  if (await repo.getBySlug(slug)) throw new Error(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  await repo.save(
    {
      displayName,
      slug,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    '',
  );

  revalidatePath('/');
  revalidatePath('/builder');
  redirect(`/builder/${encodeURIComponent(slug)}`);
}

export async function saveBuilderAction(formData: FormData) {
  await requireMenuPermission('builder', 'edit_approve');

  const repo = getBuilderRepository();
  const slug = text(formData, 'slug');
  const existing = await repo.getBySlug(slug);
  if (!existing) throw new Error(`빌더를 찾을 수 없습니다: ${slug}`);

  const avatarSrc = text(formData, 'avatarSrc');

  const frontmatter: BuilderFrontmatterInput = {
    ...existing,
    displayName: text(formData, 'displayName') || existing.displayName,
    status: (text(formData, 'status') || existing.status) as BuilderStatus,
    specialties: list(formData, 'specialties'),
    education: list(formData, 'education'),
    communityActivity: list(formData, 'communityActivity'),
    verifications: list(formData, 'verifications'),
    avatar: avatarSrc
      ? {
          src: avatarSrc,
          alt: text(formData, 'avatarAlt'),
          source: (text(formData, 'avatarSource') || 'user-upload') as ImageSource,
        }
      : undefined,
    permissions: {
      canWriteInsight: bool(formData, 'permWriteInsight'),
      canEditInsight: bool(formData, 'permEditInsight'),
      canDeleteInsight: bool(formData, 'permDeleteInsight'),
    },
    role: text(formData, 'role'),
    focus: text(formData, 'focus'),
    badgeLabel: text(formData, 'badgeLabel'),
    isLead: bool(formData, 'isLead'),
    principles: [0, 1, 2]
      .map((i) => ({
        title: text(formData, `principleTitle${i}`),
        description: text(formData, `principleDesc${i}`),
      }))
      .filter((p) => p.title && p.description),
  };

  await repo.save(frontmatter, text(formData, 'bio'));

  revalidatePath('/');
  revalidatePath('/builder');
  revalidatePath(`/builder/${slug}`);
}

export async function deleteBuilderAction(formData: FormData) {
  await requireMenuPermission('builder', 'full');

  await getBuilderRepository().remove(text(formData, 'slug'));
  revalidatePath('/');
  revalidatePath('/builder');
  redirect('/builder');
}
