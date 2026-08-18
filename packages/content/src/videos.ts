import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { stripUndefined } from './posts.ts';
import { videoPath, videosDir } from './paths.ts';
import { type Video, type VideoFrontmatterInput, VideoFrontmatterSchema } from './schema.ts';

/**
 * Parse a YouTube URL (watch/shorts/embed/youtu.be, with or without extra
 * query params) into its 11-char video id. Pure — no fs — so both the admin
 * server action and the Supabase driver can reuse it without pulling `fs`
 * into a client bundle.
 */
export function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

/** Parse one markdown file into a validated Video. Throws on schema violation. */
export function parseVideo(filePath: string): Video {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  const parsed = VideoFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath };
}

/** Every video on disk, ordered by `order`. Invalid files are reported, not swallowed. */
export function getAllVideos(): { videos: Video[]; errors: string[] } {
  const dir = videosDir();
  if (!fs.existsSync(dir)) return { videos: [], errors: [] };

  const videos: Video[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    try {
      videos.push(parseVideo(path.join(dir, file)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  videos.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ko'));
  return { videos, errors };
}

export function getVideoBySlug(slug: string): Video | null {
  const file = videoPath(slug);
  return fs.existsSync(file) ? parseVideo(file) : null;
}

/**
 * Serialize frontmatter back to disk. No free-form body.
 *
 * `featured` is exclusive: saving a video with `featured: true` clears the
 * flag on every other video first, so there is never more than one.
 */
export function writeVideo(frontmatter: VideoFrontmatterInput): string {
  const validated = VideoFrontmatterSchema.parse({
    ...frontmatter,
    updatedAt: new Date().toISOString(),
  });

  const dir = videosDir();
  fs.mkdirSync(dir, { recursive: true });

  if (validated.featured) {
    const { videos } = getAllVideos();
    for (const other of videos) {
      if (other.slug === validated.slug || !other.featured) continue;
      const { filePath: _filePath, ...rest } = other;
      const cleared = VideoFrontmatterSchema.parse({ ...rest, featured: false, updatedAt: new Date().toISOString() });
      fs.writeFileSync(videoPath(cleared.slug), matter.stringify('\n', stripUndefined(cleared)), 'utf8');
    }
  }

  const file = videoPath(validated.slug);
  fs.writeFileSync(file, matter.stringify('\n', stripUndefined(validated)), 'utf8');
  return file;
}

export function deleteVideo(slug: string): boolean {
  const file = videoPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
