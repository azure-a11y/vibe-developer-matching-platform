#!/usr/bin/env node --experimental-strip-types
/**
 * content/builders, content/works, content/admin-accounts, content/site-settings.md
 * → Supabase 테이블 이관 (builders / works / admin_accounts / site_settings).
 *
 * 멱등적입니다(slug 기준 upsert, site_settings 는 싱글톤). 여러 번 실행해도 안전합니다.
 * 파일은 삭제하지 않습니다 — 되돌릴 수 있어야 합니다.
 *
 * 사전 조건
 *   1. .env 에 Supabase 키 3개
 *   2. migrations/0001_init.sql, 0002_builder_group_domains.sql 적용 완료
 */
import {
  adminAccountFileRepository,
  adminAccountSupabaseRepository,
  builderFileRepository,
  builderSupabaseRepository,
  siteSettingsFileRepository,
  siteSettingsSupabaseRepository,
  workFileRepository,
  workSupabaseRepository,
} from '../../content/src/index.ts';
import { describeStatus, isSupabaseWritable } from '../src/index.ts';

const dryRun = process.argv.includes('--dry-run');

const status = describeStatus();
console.log(`Supabase 상태: ${status.message}\n`);

if (!isSupabaseWritable()) {
  console.error(
    '이관하려면 쓰기 권한이 필요합니다.\n' +
      '.env 에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,\n' +
      'SUPABASE_SERVICE_ROLE_KEY 를 모두 채운 뒤 다시 실행하세요.',
  );
  process.exit(1);
}

let ok = 0;
let failed = 0;

// ── builders ─────────────────────────────────────────────────
{
  const { builders, errors } = await builderFileRepository.getAll();
  for (const error of errors) console.error(`[builders] 파싱 실패 (건너뜀): ${error}`);

  console.log(`builders: ${builders.length}건${dryRun ? ' (dry run)' : ''}`);
  for (const builder of builders) {
    const { bio, filePath: _filePath, ...frontmatter } = builder;
    try {
      if (!dryRun) await builderSupabaseRepository.save(frontmatter, bio);
      console.log(`  ✔ ${builder.slug}`);
      ok++;
    } catch (error) {
      console.error(`  ✘ ${builder.slug} — ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
}

// ── works ────────────────────────────────────────────────────
{
  const { works, errors } = await workFileRepository.getAll();
  for (const error of errors) console.error(`[works] 파싱 실패 (건너뜀): ${error}`);

  console.log(`works: ${works.length}건${dryRun ? ' (dry run)' : ''}`);
  for (const work of works) {
    const { filePath: _filePath, ...frontmatter } = work;
    try {
      if (!dryRun) await workSupabaseRepository.save(frontmatter);
      console.log(`  ✔ ${work.slug}`);
      ok++;
    } catch (error) {
      console.error(`  ✘ ${work.slug} — ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
}

// ── admin-accounts ───────────────────────────────────────────
{
  const { accounts, errors } = await adminAccountFileRepository.getAll();
  for (const error of errors) console.error(`[admin-accounts] 파싱 실패 (건너뜀): ${error}`);

  console.log(`admin-accounts: ${accounts.length}건${dryRun ? ' (dry run)' : ''}`);
  for (const account of accounts) {
    const { filePath: _filePath, ...frontmatter } = account;
    try {
      if (!dryRun) await adminAccountSupabaseRepository.save(frontmatter);
      console.log(`  ✔ ${account.slug}`);
      ok++;
    } catch (error) {
      console.error(`  ✘ ${account.slug} — ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
}

// ── site-settings (싱글톤) ───────────────────────────────────
{
  const { settings, error: readError } = await siteSettingsFileRepository.get();
  if (readError) {
    console.error(`[site-settings] 파싱 실패 (건너뜀): ${readError}`);
  } else {
    console.log(`site-settings: 1건${dryRun ? ' (dry run)' : ''}`);
    const { filePath: _filePath, ...frontmatter } = settings;
    try {
      if (!dryRun) await siteSettingsSupabaseRepository.save(frontmatter);
      console.log('  ✔ site-settings');
      ok++;
    } catch (error) {
      console.error(`  ✘ site-settings — ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
}

console.log(`\n성공 ${ok}건, 실패 ${failed}건.`);

if (failed > 0) process.exit(1);

if (!dryRun) {
  console.log(
    '\n다음: .env 에서 CONTENT_DRIVER 를 비워두면 자동으로 Supabase 를 사용합니다.\n' +
      '파일은 그대로 두었습니다. 동작을 확인한 뒤 정리하세요.',
  );
}
