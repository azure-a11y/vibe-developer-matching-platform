import fs from 'node:fs';
import matter from 'gray-matter';

import { siteSettingsPath } from './paths.ts';
import { stripUndefined } from './posts.ts';
import { type SiteSettings, type SiteSettingsFrontmatterInput, SiteSettingsFrontmatterSchema } from './schema.ts';

function defaults(): SiteSettings {
  return {
    ...SiteSettingsFrontmatterSchema.parse({ updatedAt: new Date().toISOString() }),
    filePath: siteSettingsPath(),
  };
}

/**
 * Singleton read — always returns a usable `SiteSettings`, even before the
 * file exists (first-run state, same philosophy as an unset env var: the
 * feature it backs just shows blank/TBD, nothing crashes).
 */
export function getSiteSettings(): { settings: SiteSettings; error: string | null } {
  const file = siteSettingsPath();
  if (!fs.existsSync(file)) return { settings: defaults(), error: null };

  try {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const parsed = SiteSettingsFrontmatterSchema.parse(data);
    return { settings: { ...parsed, filePath: file }, error: null };
  } catch (error) {
    return {
      settings: defaults(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function writeSiteSettings(frontmatter: SiteSettingsFrontmatterInput): void {
  const validated = SiteSettingsFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  fs.writeFileSync(siteSettingsPath(), matter.stringify('\n', stripUndefined(validated)), 'utf8');
}
