import { describeStatus, isSupabaseConfigured } from '@orca/supabase';

import { adminAccountFileRepository, builderFileRepository, fileRepository, workFileRepository } from './file.ts';
import { supabaseRepository } from './supabase.ts';
import type { AdminAccountRepository, BuilderRepository, ContentRepository, WorkRepository } from './types.ts';

export * from './types.ts';
export {
  adminAccountFileRepository,
  builderFileRepository,
  fileRepository,
  workFileRepository,
} from './file.ts';
export { supabaseRepository } from './supabase.ts';

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

/**
 * Builder domain entry point. File driver only for now — Supabase support is
 * Phase 3 (docs/planning/AI빌더그룹_프로젝트전환계획.md §7).
 */
export function getBuilderRepository(): BuilderRepository {
  return builderFileRepository;
}

/** Work domain entry point. File driver only for now — same note as above. */
export function getWorkRepository(): WorkRepository {
  return workFileRepository;
}

/** Admin auth domain entry point. File driver only — same note as above. */
export function getAdminAccountRepository(): AdminAccountRepository {
  return adminAccountFileRepository;
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
