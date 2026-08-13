import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { stripUndefined } from './posts.ts';
import { workPath, worksDir } from './paths.ts';
import { type Work, type WorkFrontmatterInput, WorkFrontmatterSchema } from './schema.ts';

/** Parse one markdown file into a validated Work. Throws on schema violation. */
export function parseWork(filePath: string): Work {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  const parsed = WorkFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath };
}

/** Every Work on disk, newest first. Invalid files are reported, not swallowed. */
export function getAllWorks(): { works: Work[]; errors: string[] } {
  const dir = worksDir();
  if (!fs.existsSync(dir)) return { works: [], errors: [] };

  const works: Work[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    try {
      works.push(parseWork(path.join(dir, file)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  works.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { works, errors };
}

/** Work the public site is allowed to render. */
export function getPublishedWorks(): Work[] {
  return getAllWorks().works.filter((work) => work.status === 'published');
}

export function getWorkBySlug(slug: string): Work | null {
  const file = workPath(slug);
  return fs.existsSync(file) ? parseWork(file) : null;
}

/** Serialize frontmatter back to disk. No free-form body — every field is structured. */
export function writeWork(frontmatter: WorkFrontmatterInput): string {
  const validated = WorkFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  const dir = worksDir();
  fs.mkdirSync(dir, { recursive: true });

  const file = workPath(validated.slug);
  fs.writeFileSync(file, matter.stringify('\n', stripUndefined(validated)), 'utf8');
  return file;
}

export function deleteWork(slug: string): boolean {
  const file = workPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
