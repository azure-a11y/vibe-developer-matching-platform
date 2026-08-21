import { describeStatus, getPublicConfig, isSupabaseConfigured } from '@orca/supabase';

import {
  adminAccountFileRepository,
  builderFileRepository,
  faqCategoryFileRepository,
  faqFileRepository,
  fileRepository,
  siteSettingsFileRepository,
  videoFileRepository,
  workFileRepository,
} from './file.ts';
import {
  adminAccountSupabaseRepository,
  builderSupabaseRepository,
  faqCategorySupabaseRepository,
  faqSupabaseRepository,
  siteSettingsSupabaseRepository,
  supabaseRepository,
  videoSupabaseRepository,
  workSupabaseRepository,
} from './supabase.ts';
import type {
  AdminAccountRepository,
  BuilderRepository,
  ContentRepository,
  FaqCategoryRepository,
  FaqRepository,
  SiteSettingsRepository,
  VideoRepository,
  WorkRepository,
} from './types.ts';

export * from './types.ts';
export {
  adminAccountFileRepository,
  builderFileRepository,
  faqCategoryFileRepository,
  faqFileRepository,
  fileRepository,
  siteSettingsFileRepository,
  videoFileRepository,
  workFileRepository,
} from './file.ts';
export {
  adminAccountSupabaseRepository,
  builderSupabaseRepository,
  faqCategorySupabaseRepository,
  faqSupabaseRepository,
  siteSettingsSupabaseRepository,
  supabaseRepository,
  videoSupabaseRepository,
  workSupabaseRepository,
} from './supabase.ts';

function assertDevelopmentSupabaseConfigured(): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (process.env.CONTENT_DRIVER === 'file') {
    throw new Error('[development] CONTENT_DRIVER=file은 로컬 Supabase 고정 정책과 충돌합니다. CONTENT_DRIVER를 제거하세요.');
  }
  const config = getPublicConfig();
  const missing: string[] = [];
  if (!config.url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!config.anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (missing.length > 0) {
    throw new Error(
      `[development] Supabase 환경변수가 누락되어 로컬 실행을 중단합니다: ${missing.join(', ')}. ` +
        'file Repository로 fallback하지 않습니다. root .env를 확인하세요.',
    );
  }
}

function selectRepository<T>(supabase: T, file: T): T {
  assertDevelopmentSupabaseConfigured();
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return file;
  if (forced === 'supabase') return supabase;
  return isSupabaseConfigured() ? supabase : file;
}

/**
 * Pick the active driver.
 *
 * No keys → file driver, and the whole app works. That is the demo state the
 * template ships in. Add keys + run the migration → Supabase takes over with
 * no app-code change.
 *
 * `CONTENT_DRIVER=file` forces the file driver even when keys are present,
 * which is useful while migrating.
 */
export function getRepository(): ContentRepository {
  return selectRepository(supabaseRepository, fileRepository);
}

/** Builder domain entry point. Same driver-selection rule as `getRepository()`. */
export function getBuilderRepository(): BuilderRepository {
  return selectRepository(builderSupabaseRepository, builderFileRepository);
}

/** Work domain entry point. Same driver-selection rule as `getRepository()`. */
export function getWorkRepository(): WorkRepository {
  return selectRepository(workSupabaseRepository, workFileRepository);
}

/** FAQ category domain entry point. Same driver-selection rule as `getRepository()`. */
export function getFaqCategoryRepository(): FaqCategoryRepository {
  return selectRepository(faqCategorySupabaseRepository, faqCategoryFileRepository);
}

/** FAQ entry domain entry point. Same driver-selection rule as `getRepository()`. */
export function getFaqRepository(): FaqRepository {
  return selectRepository(faqSupabaseRepository, faqFileRepository);
}

/** Video domain entry point. Same driver-selection rule as `getRepository()`. */
export function getVideoRepository(): VideoRepository {
  return selectRepository(videoSupabaseRepository, videoFileRepository);
}

/** Admin auth domain entry point. Same driver-selection rule as `getRepository()`. */
export function getAdminAccountRepository(): AdminAccountRepository {
  return selectRepository(adminAccountSupabaseRepository, adminAccountFileRepository);
}

/** Site settings entry point. Same driver-selection rule as `getRepository()`. */
export function getSiteSettingsRepository(): SiteSettingsRepository {
  return selectRepository(siteSettingsSupabaseRepository, siteSettingsFileRepository);
}

/** Human-readable backend status for the admin banner and `pnpm check`. */
export function describeBackend(): { driver: 'file' | 'supabase'; message: string } {
  const repo = getRepository();
  if (repo.driver === 'file') {
    return {
      driver: 'file',
      message: describeStatus().message,
    };
  }
  return { driver: 'supabase', message: describeStatus().message };
}
