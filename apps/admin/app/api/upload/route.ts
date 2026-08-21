import fs from 'node:fs/promises';
import path from 'node:path';
import { findRepoRoot, slugify } from '@orca/content';
import { isSupabaseWritable, StorageUploadError, uploadImage } from '@orca/supabase';

/**
 * Image upload endpoint for the tiptap editor.
 *
 * Two backends, chosen automatically:
 *   Supabase configured → Storage bucket, returns a public CDN URL
 *   otherwise           → apps/web/public/images/uploads/, returns a local path
 *
 * The local path keeps the demo state fully functional with zero setup. Adding
 * Supabase keys switches the destination with no code change.
 *
 * NOTE ON THE IMAGE POLICY: this route handles *uploads*, which are always
 * `user-upload` provenance. It does not generate anything. Image generation
 * remains Codex-only (ADR-0002).
 */

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
]);

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('폼 데이터를 읽을 수 없습니다.', 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) return fail('파일이 없습니다.', 400);

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return fail(`지원하지 않는 형식입니다: ${file.type || '알 수 없음'}`, 415);
  }
  if (file.size > MAX_BYTES) {
    return fail(`파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB, 최대 8MB).`, 413);
  }

  const postSlug = slugify(String(form.get('slug') ?? '')) || 'untitled';
  // Timestamp keeps repeated uploads of the same filename from colliding.
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const filename = `${base}-${Date.now()}.${extension}`;
  // Supabase Storage rejects non-ASCII object keys. Keep the human-readable
  // slug out of the key while retaining a stable per-post namespace.
  const storageSlug = Buffer.from(postSlug, 'utf8').toString('base64url');
  const objectPath = `${storageSlug}/${filename}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    if (isSupabaseWritable()) {
      const { url } = await uploadImage(bytes, { path: objectPath, contentType: file.type });
      return Response.json({ url, storage: 'supabase' });
    }

    // Demo state: write into the web app's public directory.
    const publicDir = path.join(findRepoRoot(), 'apps/web/public/images/uploads', postSlug);
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, filename), bytes);

    return Response.json({ url: `/images/uploads/${objectPath}`, storage: 'local' });
  } catch (error) {
    if (error instanceof StorageUploadError) {
      console.error('[api/upload] Supabase Storage upload failed', {
        stage: 'storage.upload',
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
      });
      return fail('Storage upload failed.', 500);
    }
    return fail(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.', 500);
  }
}
