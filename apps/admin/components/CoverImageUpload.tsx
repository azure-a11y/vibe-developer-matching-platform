'use client';

import { useState } from 'react';

interface CoverImageUploadProps {
  slug: string;
  defaultValue: string;
  fallbackAlt: string;
  fieldName?: string;
  inputId?: string;
  altInputId?: string;
}

// Vercel rejects oversized multipart requests before /api/upload can read them.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function CoverImageUpload({ slug, defaultValue, fallbackAlt, fieldName = 'coverSrc', inputId = 'coverSrc', altInputId = 'coverAlt' }: CoverImageUploadProps) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`파일 용량이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 4MB 이하의 이미지를 선택해주세요.`);
      }
      const form = new FormData();
      form.append('file', file);
      form.append('slug', slug);
      const response = await fetch('/api/upload', { method: 'POST', body: form });
      const body = await response.text();
      let result: { url?: string; error?: string } = {};
      try {
        result = JSON.parse(body) as { url?: string; error?: string };
      } catch {
        if (response.status === 413) {
          throw new Error('파일 용량이 너무 큽니다. 4MB 이하의 이미지를 선택해주세요.');
        }
        throw new Error(`이미지 업로드에 실패했습니다 (${response.status}).`);
      }
      if (!response.ok || !result.url) throw new Error(result.error ?? '표지 이미지 업로드에 실패했습니다.');
      setValue(result.url);
      const altInput = document.getElementById(altInputId);
      if (altInput instanceof HTMLInputElement && !altInput.value.trim()) {
        altInput.value = `${fallbackAlt} 커버 이미지`;
        altInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : String(uploadError));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-secondary cursor-pointer">
          {uploading ? '업로드 중…' : '파일 첨부'}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" disabled={uploading}
            onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ''; }} />
        </label>
        <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Supabase Storage에 업로드됩니다.</span>
      </div>
      <label className="label" htmlFor="coverSrc">Public URL 또는 경로</label>
      <input id={inputId} name={fieldName} className="field" value={value} onChange={(event) => setValue(event.target.value)}
        placeholder="https://…/storage/v1/object/public/post-images/…" />
      {value && <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)]"><img src={value} alt="표지 미리보기" className="h-48 w-full object-cover" /></div>}
      {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}
    </div>
  );
}
