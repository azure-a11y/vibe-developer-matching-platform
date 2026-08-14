'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type AdminMenuPermissions, type PermissionLevel, getAdminAccountRepository, slugify } from '@orca/content';

import { hashPassword } from '@/lib/auth';
import { requireMenuPermission } from '@/lib/permissions';

const MENU_KEYS: (keyof AdminMenuPermissions)[] = [
  'dashboard',
  'builder',
  'work',
  'insight',
  'inquiry',
  'settings',
  'accountPermission',
];

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function menuPermissionsFromForm(form: FormData): AdminMenuPermissions {
  return Object.fromEntries(
    MENU_KEYS.map((key) => [key, (text(form, `perm_${key}`) || 'none') as PermissionLevel]),
  ) as AdminMenuPermissions;
}

export async function createAdminAccountAction(formData: FormData) {
  await requireMenuPermission('accountPermission', 'edit_approve');

  const email = text(formData, 'email');
  const name = text(formData, 'name');
  const password = text(formData, 'password');
  if (!email || !name || !password) throw new Error('이메일·이름·비밀번호는 필수입니다.');

  const repo = getAdminAccountRepository();
  if (await repo.getByEmail(email)) throw new Error(`이미 등록된 이메일입니다: ${email}`);

  const slug = slugify(email.split('@')[0] ?? '') || `admin-${Date.now()}`;
  if (await repo.getBySlug(slug)) throw new Error(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  await repo.save({
    slug,
    email,
    name,
    grade: text(formData, 'grade') || '미지정',
    passwordHash: hashPassword(password),
    menuPermissions: menuPermissionsFromForm(formData),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath('/permissions');
  redirect(`/permissions/${encodeURIComponent(slug)}`);
}

export async function saveAdminAccountAction(formData: FormData) {
  await requireMenuPermission('accountPermission', 'edit_approve');

  const repo = getAdminAccountRepository();
  const slug = text(formData, 'slug');
  const existing = await repo.getBySlug(slug);
  if (!existing) throw new Error(`계정을 찾을 수 없습니다: ${slug}`);

  await repo.save({
    ...existing,
    name: text(formData, 'name') || existing.name,
    grade: text(formData, 'grade') || existing.grade,
    status: text(formData, 'status') === 'inactive' ? 'inactive' : 'active',
    menuPermissions: menuPermissionsFromForm(formData),
  });

  revalidatePath('/permissions');
  revalidatePath(`/permissions/${slug}`);
}
