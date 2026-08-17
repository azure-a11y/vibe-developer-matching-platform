'use server';

import { revalidatePath } from 'next/cache';
import { type FaqCategoryFrontmatterInput, getFaqCategoryRepository, getFaqRepository, slugify } from '@orca/content';

import { requireMenuPermission } from '@/lib/permissions';

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function num(form: FormData, key: string, fallback: number): number {
  const value = Number(text(form, key));
  return Number.isFinite(value) ? value : fallback;
}

function bool(form: FormData, key: string): boolean {
  const value = text(form, key);
  return value === 'on' || value === 'true';
}

export async function createFaqCategoryAction(formData: FormData) {
  await requireMenuPermission('faq', 'edit_approve');

  const name = text(formData, 'name');
  if (!name) throw new Error('카테고리 이름은 필수입니다.');

  const repo = getFaqCategoryRepository();
  const slug = slugify(text(formData, 'slug') || name) || `category-${Date.now()}`;
  if (await repo.getBySlug(slug)) throw new Error(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  await repo.save({
    name,
    slug,
    order: num(formData, 'order', 0),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath('/');
  revalidatePath('/faq');
}

export async function saveFaqCategoryAction(formData: FormData) {
  await requireMenuPermission('faq', 'edit_approve');

  const repo = getFaqCategoryRepository();
  const slug = text(formData, 'slug');
  const existing = await repo.getBySlug(slug);
  if (!existing) throw new Error(`카테고리를 찾을 수 없습니다: ${slug}`);

  const frontmatter: FaqCategoryFrontmatterInput = {
    ...existing,
    name: text(formData, 'name') || existing.name,
    order: num(formData, 'order', existing.order),
    isActive: bool(formData, 'isActive'),
  };

  await repo.save(frontmatter);

  revalidatePath('/');
  revalidatePath('/faq');
}

export async function deleteFaqCategoryAction(formData: FormData) {
  await requireMenuPermission('faq', 'full');

  const slug = text(formData, 'slug');
  const { faqs } = await getFaqRepository().getAll();
  if (faqs.some((faq) => faq.categoryId === slug)) {
    throw new Error('이 카테고리를 사용하는 FAQ가 있어 삭제할 수 없습니다. 먼저 다른 카테고리로 옮기세요.');
  }

  await getFaqCategoryRepository().remove(slug);
  revalidatePath('/');
  revalidatePath('/faq');
}
