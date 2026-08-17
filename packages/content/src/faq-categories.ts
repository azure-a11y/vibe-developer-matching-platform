import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { faqCategoriesDir, faqCategoryPath } from './paths.ts';
import { stripUndefined } from './posts.ts';
import { type FaqCategory, type FaqCategoryFrontmatterInput, FaqCategoryFrontmatterSchema } from './schema.ts';

/** Parse one markdown file into a validated FaqCategory. Throws on schema violation. */
export function parseFaqCategory(filePath: string): FaqCategory {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  const parsed = FaqCategoryFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath };
}

/** Every FAQ category on disk, ordered by `order`. Invalid files are reported, not swallowed. */
export function getAllFaqCategories(): { categories: FaqCategory[]; errors: string[] } {
  const dir = faqCategoriesDir();
  if (!fs.existsSync(dir)) return { categories: [], errors: [] };

  const categories: FaqCategory[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    try {
      categories.push(parseFaqCategory(path.join(dir, file)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ko'));
  return { categories, errors };
}

/** Categories the public site is allowed to render. */
export function getActiveFaqCategories(): FaqCategory[] {
  return getAllFaqCategories().categories.filter((c) => c.isActive);
}

export function getFaqCategoryBySlug(slug: string): FaqCategory | null {
  const file = faqCategoryPath(slug);
  return fs.existsSync(file) ? parseFaqCategory(file) : null;
}

/** Serialize frontmatter back to disk. No free-form body. */
export function writeFaqCategory(frontmatter: FaqCategoryFrontmatterInput): string {
  const validated = FaqCategoryFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  const dir = faqCategoriesDir();
  fs.mkdirSync(dir, { recursive: true });

  const file = faqCategoryPath(validated.slug);
  fs.writeFileSync(file, matter.stringify('\n', stripUndefined(validated)), 'utf8');
  return file;
}

export function deleteFaqCategory(slug: string): boolean {
  const file = faqCategoryPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
