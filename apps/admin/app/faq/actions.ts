'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  type FaqFrontmatterInput,
  type FaqStatus,
  getFaqCategoryRepository,
  getFaqRepository,
  slugify,
} from '@orca/content';

import { requireMenuPermission } from '@/lib/permissions';

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function num(form: FormData, key: string, fallback: number): number {
  const value = Number(text(form, key));
  return Number.isFinite(value) ? value : fallback;
}

async function requireCategory(categoryId: string) {
  const category = await getFaqCategoryRepository().getBySlug(categoryId);
  if (!category) throw new Error(`카테고리를 찾을 수 없습니다: ${categoryId}`);
  return category;
}

export async function createFaqAction(formData: FormData) {
  await requireMenuPermission('faq', 'edit_approve');

  const question = text(formData, 'question');
  if (!question) throw new Error('질문은 필수입니다.');
  const categoryId = text(formData, 'categoryId');
  if (!categoryId) throw new Error('카테고리는 필수입니다.');
  await requireCategory(categoryId);

  const repo = getFaqRepository();
  const slug = slugify(text(formData, 'slug') || question) || `faq-${Date.now()}`;
  if (await repo.getBySlug(slug)) throw new Error(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  await repo.save(
    {
      question,
      slug,
      categoryId,
      order: num(formData, 'order', 0),
      status: 'archived',
      createdAt: now,
      updatedAt: now,
    },
    text(formData, 'answer'),
  );

  revalidatePath('/');
  revalidatePath('/faq');
  redirect(`/faq/${encodeURIComponent(slug)}`);
}

export async function saveFaqAction(formData: FormData) {
  await requireMenuPermission('faq', 'edit_approve');

  const repo = getFaqRepository();
  const slug = text(formData, 'slug');
  const existing = await repo.getBySlug(slug);
  if (!existing) throw new Error(`FAQ 항목을 찾을 수 없습니다: ${slug}`);

  const categoryId = text(formData, 'categoryId') || existing.categoryId;
  await requireCategory(categoryId);

  const frontmatter: FaqFrontmatterInput = {
    ...existing,
    question: text(formData, 'question') || existing.question,
    categoryId,
    order: num(formData, 'order', existing.order),
    status: (text(formData, 'status') || existing.status) as FaqStatus,
  };

  await repo.save(frontmatter, text(formData, 'answer'));

  revalidatePath('/');
  revalidatePath('/faq');
  revalidatePath(`/faq/${slug}`);
}

export async function deleteFaqAction(formData: FormData) {
  await requireMenuPermission('faq', 'full');

  await getFaqRepository().remove(text(formData, 'slug'));
  revalidatePath('/');
  revalidatePath('/faq');
  redirect('/faq');
}
