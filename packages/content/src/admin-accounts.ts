import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { adminAccountPath, adminAccountsDir } from './paths.ts';
import { stripUndefined } from './posts.ts';
import { type AdminAccount, type AdminAccountFrontmatterInput, AdminAccountFrontmatterSchema } from './schema.ts';

/** Parse one markdown file into a validated AdminAccount. Throws on schema violation. */
export function parseAdminAccount(filePath: string): AdminAccount {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  const parsed = AdminAccountFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath };
}

/** Every admin account on disk. Invalid files are reported, not swallowed. */
export function getAllAdminAccounts(): { accounts: AdminAccount[]; errors: string[] } {
  const dir = adminAccountsDir();
  if (!fs.existsSync(dir)) return { accounts: [], errors: [] };

  const accounts: AdminAccount[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    try {
      accounts.push(parseAdminAccount(path.join(dir, file)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  accounts.sort((a, b) => a.email.localeCompare(b.email));
  return { accounts, errors };
}

export function getAdminAccountBySlug(slug: string): AdminAccount | null {
  const file = adminAccountPath(slug);
  return fs.existsSync(file) ? parseAdminAccount(file) : null;
}

/** Case-insensitive — logins shouldn't fail over capitalization. */
export function getAdminAccountByEmail(email: string): AdminAccount | null {
  const target = email.trim().toLowerCase();
  return getAllAdminAccounts().accounts.find((a) => a.email.toLowerCase() === target) ?? null;
}

/** Serialize frontmatter back to disk. No free-form body. */
export function writeAdminAccount(frontmatter: AdminAccountFrontmatterInput): string {
  const validated = AdminAccountFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  const dir = adminAccountsDir();
  fs.mkdirSync(dir, { recursive: true });

  const file = adminAccountPath(validated.slug);
  fs.writeFileSync(file, matter.stringify('\n', stripUndefined(validated)), 'utf8');
  return file;
}

export function deleteAdminAccount(slug: string): boolean {
  const file = adminAccountPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
