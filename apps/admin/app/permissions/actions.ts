'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AdminAccountFrontmatterSchema,
  type AdminMenuPermissions,
  type PermissionLevel,
  getAdminAccountRepository,
  slugify,
} from '@orca/content';

import { hashPassword } from '@/lib/auth';
import { requireMenuPermission } from '@/lib/permissions';

const MENU_KEYS: (keyof AdminMenuPermissions)[] = [
  'dashboard',
  'builder',
  'work',
  'insight',
  'video',
  'faq',
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

/** Standalone `.email()` check reused from the repository schema, so "is this
 * a valid address" is answered the same way here and at save time — no
 * separate, potentially-looser regex to drift out of sync. */
function isValidEmail(email: string): boolean {
  return AdminAccountFrontmatterSchema.shape.email.safeParse(email).success;
}

/**
 * Turns a thrown Error (bad input, duplicate email/slug, a schema violation
 * that slips past the checks above) into a message the create form can show
 * inline, instead of letting it reach the framework's uncaught-error overlay.
 */
function failAccountCreation(message: string): never {
  redirect(`/permissions?error=${encodeURIComponent(message)}`);
}

export async function createAdminAccountAction(formData: FormData) {
  await requireMenuPermission('accountPermission', 'edit_approve');

  // Trim defends against stray whitespace from paste/autofill; lowercase
  // keeps stored addresses consistent with the case-insensitive lookups
  // `getByEmail`/login already do.
  const email = text(formData, 'email').toLowerCase();
  const name = text(formData, 'name');
  const password = text(formData, 'password');

  if (!email || !name || !password) failAccountCreation('이메일·이름·초기 비밀번호는 필수입니다.');
  if (!isValidEmail(email)) failAccountCreation('올바른 이메일 주소를 입력해주세요.');
  if (password.length < 8) failAccountCreation('초기 비밀번호는 8자 이상이어야 합니다.');

  const repo = getAdminAccountRepository();
  if (await repo.getByEmail(email)) failAccountCreation(`이미 등록된 이메일입니다: ${email}`);

  const slug = slugify(email.split('@')[0] ?? '') || `admin-${Date.now()}`;
  if (await repo.getBySlug(slug)) failAccountCreation(`슬러그 "${slug}"는 이미 존재합니다.`);

  const now = new Date().toISOString();
  try {
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
  } catch (error) {
    failAccountCreation(error instanceof Error ? error.message : '계정 생성에 실패했습니다.');
  }

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
