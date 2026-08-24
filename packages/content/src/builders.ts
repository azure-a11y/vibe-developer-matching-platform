import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { stripUndefined } from './posts.ts';
import { builderPath, buildersDir } from './paths.ts';
import { type Builder, type BuilderFrontmatterInput, BuilderFrontmatterSchema } from './schema.ts';

/** Parse one markdown file into a validated Builder. Throws on schema violation. */
export function parseBuilder(filePath: string): Builder {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const parsed = BuilderFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}\n  - ${issues.join('\n  - ')}`);
  }

  return {
    ...parsed.data,
    bio: content.trim(),
    filePath,
  };
}

/** Every builder on disk, newest first. Invalid files are reported, not swallowed. */
export function getAllBuilders(): { builders: Builder[]; errors: string[] } {
  const dir = buildersDir();
  if (!fs.existsSync(dir)) return { builders: [], errors: [] };

  const builders: Builder[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    try {
      builders.push(parseBuilder(path.join(dir, file)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  builders.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { builders, errors };
}

/** Builders the public site is allowed to render. */
export function getActiveBuilders(): Builder[] {
  return getAllBuilders().builders.filter((builder) => builder.status === 'active');
}

export function getBuilderBySlug(slug: string): Builder | null {
  const file = builderPath(slug);
  return fs.existsSync(file) ? parseBuilder(file) : null;
}

export function getBuilderById(id: string): Builder | null {
  return getAllBuilders().builders.find((builder) => builder.id === id) ?? null;
}

/** Serialize frontmatter + bio back to disk. Used by the admin editor. */
export function writeBuilder(frontmatter: BuilderFrontmatterInput, bio: string): string {
  const validated = BuilderFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  const dir = buildersDir();
  fs.mkdirSync(dir, { recursive: true });

  const file = builderPath(validated.slug);
  fs.writeFileSync(file, matter.stringify(`\n${bio.trim()}\n`, stripUndefined(validated)), 'utf8');
  return file;
}

export function deleteBuilder(slug: string): boolean {
  const file = builderPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
