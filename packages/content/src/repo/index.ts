import { describeStatus, isSupabaseConfigured } from '@orca/supabase';

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
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return fileRepository;
  if (forced === 'supabase') return supabaseRepository;
  return isSupabaseConfigured() ? supabaseRepository : fileRepository;
}

/** Builder domain entry point. Same driver-selection rule as `getRepository()`. */
export function getBuilderRepository(): BuilderRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return builderFileRepository;
  if (forced === 'supabase') return builderSupabaseRepository;
  return isSupabaseConfigured() ? builderSupabaseRepository : builderFileRepository;
}

/** Work domain entry point. Same driver-selection rule as `getRepository()`. */
export function getWorkRepository(): WorkRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return workFileRepository;
  if (forced === 'supabase') return workSupabaseRepository;
  return isSupabaseConfigured() ? workSupabaseRepository : workFileRepository;
}

/** FAQ category domain entry point. Same driver-selection rule as `getRepository()`. */
export function getFaqCategoryRepository(): FaqCategoryRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return faqCategoryFileRepository;
  if (forced === 'supabase') return faqCategorySupabaseRepository;
  return isSupabaseConfigured() ? faqCategorySupabaseRepository : faqCategoryFileRepository;
}

/** FAQ entry domain entry point. Same driver-selection rule as `getRepository()`. */
export function getFaqRepository(): FaqRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return faqFileRepository;
  if (forced === 'supabase') return faqSupabaseRepository;
  return isSupabaseConfigured() ? faqSupabaseRepository : faqFileRepository;
}

/** Video domain entry point. Same driver-selection rule as `getRepository()`. */
export function getVideoRepository(): VideoRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return videoFileRepository;
  if (forced === 'supabase') return videoSupabaseRepository;
  return isSupabaseConfigured() ? videoSupabaseRepository : videoFileRepository;
}

/** Admin auth domain entry point. Same driver-selection rule as `getRepository()`. */
export function getAdminAccountRepository(): AdminAccountRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return adminAccountFileRepository;
  if (forced === 'supabase') return adminAccountSupabaseRepository;
  return isSupabaseConfigured() ? adminAccountSupabaseRepository : adminAccountFileRepository;
}

/** Site settings entry point. Same driver-selection rule as `getRepository()`. */
export function getSiteSettingsRepository(): SiteSettingsRepository {
  const forced = process.env.CONTENT_DRIVER;
  if (forced === 'file') return siteSettingsFileRepository;
  if (forced === 'supabase') return siteSettingsSupabaseRepository;
  return isSupabaseConfigured() ? siteSettingsSupabaseRepository : siteSettingsFileRepository;
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
