import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { stripUndefined } from './posts.ts';
import { faqDir, faqPath } from './paths.ts';
import { type Faq, type FaqFrontmatterInput, FaqFrontmatterSchema } from './schema.ts';

/** Parse one markdown file into a validated Faq. Throws on schema violation. */
export function parseFaq(filePath: string): Faq {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const parsed = FaqFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}\n  - ${issues.join('\n  - ')}`);
  }

  return {
    ...parsed.data,
    answer: content.trim(),
    filePath,
  };
}

/** Every FAQ entry on disk, ordered by category then `order`. Invalid files are reported, not swallowed. */
export function getAllFaqs(): { faqs: Faq[]; errors: string[] } {
  const dir = faqDir();
  if (!fs.existsSync(dir)) return { faqs: [], errors: [] };

  const faqs: Faq[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    try {
      faqs.push(parseFaq(path.join(dir, file)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  faqs.sort((a, b) => a.categoryId.localeCompare(b.categoryId) || a.order - b.order || a.question.localeCompare(b.question, 'ko'));
  return { faqs, errors };
}

/** FAQ entries the public site is allowed to render. */
export function getPublishedFaqs(): Faq[] {
  return getAllFaqs().faqs.filter((faq) => faq.status === 'published');
}

export function getFaqBySlug(slug: string): Faq | null {
  const file = faqPath(slug);
  return fs.existsSync(file) ? parseFaq(file) : null;
}

/** Serialize frontmatter + answer back to disk. Used by the admin editor. */
export function writeFaq(frontmatter: FaqFrontmatterInput, answer: string): string {
  const validated = FaqFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  const dir = faqDir();
  fs.mkdirSync(dir, { recursive: true });

  const file = faqPath(validated.slug);
  fs.writeFileSync(file, matter.stringify(`\n${answer.trim()}\n`, stripUndefined(validated)), 'utf8');
  return file;
}

export function deleteFaq(slug: string): boolean {
  const file = faqPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
