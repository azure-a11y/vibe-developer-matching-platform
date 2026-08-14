'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAccountRepository, slugify } from '@orca/content';

import { hashPassword, verifyPassword } from './auth';
import { createSessionToken, SESSION_COOKIE } from './session-token';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

/**
 * Bootstraps the very first admin account from env vars, the same
 * off-by-default pattern the rest of the repo uses for Supabase keys. Only
 * fires when zero AdminAccount files exist yet, so it can't be replayed
 * later to mint a second superuser.
 */
async function tryBootstrapFirstAccount(email: string, password: string) {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!bootstrapEmail || !bootstrapPassword) return null;
  if (email.toLowerCase() !== bootstrapEmail || password !== bootstrapPassword) return null;

  const repo = getAdminAccountRepository();
  const { accounts } = await repo.getAll();
  if (accounts.length > 0) return null;

  const now = new Date().toISOString();
  const slug = slugify(email.split('@')[0] ?? '') || `admin-${Date.now()}`;
  await repo.save({
    slug,
    email,
    name: '최종 관리자',
    grade: '최종 관리자',
    passwordHash: hashPassword(password),
    menuPermissions: {
      dashboard: 'full',
      builder: 'full',
      work: 'full',
      insight: 'full',
      inquiry: 'full',
      settings: 'full',
      accountPermission: 'full',
    },
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
  return repo.getBySlug(slug);
}

export async function loginAction(formData: FormData) {
  const email = text(formData, 'email');
  const password = text(formData, 'password');

  const repo = getAdminAccountRepository();
  const account = (await repo.getByEmail(email)) ?? (await tryBootstrapFirstAccount(email, password));

  if (!account || account.status !== 'active' || !verifyPassword(password, account.passwordHash)) {
    redirect('/login?error=1');
  }

  const token = createSessionToken(account.slug);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect('/');
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}
