#!/usr/bin/env node --experimental-strip-types
/**
 * content/* → Supabase 테이블 이관 (builders / works / videos / faq_categories /
 * faqs / admin_accounts / site_settings).
 *
 * 역할 구분 — 이 스크립트가 하는 일과 하지 않는 일:
 *   - DB 스키마 변경           → packages/supabase/migrations/*.sql (이 스크립트는 스키마를 건드리지 않는다)
 *   - 최초 콘텐츠 투입(seed)   → 이 스크립트. 로컬 파일에 있고 DB에 없는 row만 INSERT한다.
 *   - 운영 중 데이터 변경      → 관리자 UI / Repository(`getWorkRepository()` 등)를 통해서만.
 *                               이 스크립트가 운영 데이터를 되돌려쓰는 일은 없어야 한다.
 *
 * 기본 원칙 — 모든 도메인 공통, 예외 없음:
 *   - 로컬에는 있고 DB에는 없는 row → INSERT
 *   - DB에 이미 있는 row           → SKIP (절대 UPDATE하지 않음)
 *   - 기존 row를 실제로 덮어쓰려면 반드시 `--domains <해당 도메인> --force` 로 명시해야 한다.
 *     `--force`를 줘도 그 실행에 `--domains`로 지정하지 않은 다른 도메인에는 영향이 없다.
 *
 * 반드시 --domains 로 대상을 명시해야 실행된다 (인자 없이 실행하면 DB에 접근하지 않고
 * 사용법만 출력한다) — 예전처럼 "그냥 실행"만으로 전체 DB가 덮어써지는 사고를 막기 위함.
 *
 * site-settings 는 한 가지 규칙이 더 있다 — 로컬 `content/site-settings.md` 파일이 없으면
 * `--force`를 줘도 절대 쓰지 않고 건너뛴다. 빈 기본값으로 실제 설정을 지우는 사고가 이번
 * 문제의 직접 원인이었다(로컬 파일이 없을 때 `defaults()`의 빈 값을 그대로 DB에 upsert했다).
 *
 * 사용법
 *   pnpm --filter @orca/supabase migrate:domains --domains videos
 *   pnpm --filter @orca/supabase migrate:domains --domains faq-categories,faqs
 *   pnpm --filter @orca/supabase migrate:domains --domains works --dry-run   (실제로 쓰지 않고 계획만 출력)
 *   pnpm --filter @orca/supabase migrate:domains --domains works --force    (해당 도메인의 기존 row까지 덮어쓰기)
 *
 * 사전 조건
 *   1. .env 에 Supabase 키 3개
 *   2. migrations/0001_init.sql ~ 0006_video.sql 적용 완료
 */
import fs from 'node:fs';

import {
  adminAccountFileRepository,
  adminAccountSupabaseRepository,
  builderFileRepository,
  builderSupabaseRepository,
  faqCategoryFileRepository,
  faqCategorySupabaseRepository,
  faqFileRepository,
  faqSupabaseRepository,
  siteSettingsFileRepository,
  siteSettingsSupabaseRepository,
  videoFileRepository,
  videoSupabaseRepository,
  workFileRepository,
  workSupabaseRepository,
} from '../../content/src/index.ts';
import { describeStatus, isSupabaseWritable } from '../src/index.ts';

const DOMAIN_IDS = ['builders', 'works', 'videos', 'faq-categories', 'faqs', 'admin-accounts', 'site-settings'] as const;
type DomainId = (typeof DOMAIN_IDS)[number];

function printUsage() {
  console.log(
    [
      '사용법: migrate:domains --domains <도메인1,도메인2,...> [--dry-run] [--force]',
      '',
      `  대상 도메인: ${DOMAIN_IDS.join(', ')}`,
      '',
      '  예)',
      '    migrate:domains --domains videos',
      '    migrate:domains --domains faq-categories,faqs',
      '    migrate:domains --domains works --dry-run     (실제로 쓰지 않고 계획만 출력)',
      '    migrate:domains --domains works --force        (지정한 도메인의 기존 row까지 덮어쓰기)',
      '',
      '  --domains 를 지정하지 않으면 DB에 접근하지 않고 아무 것도 하지 않습니다 — 실수로',
      '  전체 DB를 덮어쓰는 사고를 막기 위한 안전장치입니다. 모든 도메인은 기본적으로',
      '  INSERT-ONLY 입니다: 로컬에만 있는 row는 새로 넣지만, DB에 이미 있는 row는',
      '  --force 없이는 절대 건드리지 않습니다(운영 데이터 보호). --force 는 그 실행에',
      '  --domains 로 지정한 도메인에만 적용되고, 다른 도메인에는 아무 영향이 없습니다.',
    ].join('\n'),
  );
}

function parseDomainsArg(argv: string[]): string[] | null {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--domains') {
      const v = argv[i + 1];
      if (!v || v.startsWith('--')) return [];
      return v.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (a?.startsWith('--domains=')) {
      return a.slice('--domains='.length).split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return null;
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const force = argv.includes('--force');
const requestedRaw = parseDomainsArg(argv);

if (requestedRaw === null) {
  if (force) {
    console.error('✘ --force 는 --domains 없이 단독으로 쓸 수 없습니다 (전체 DB를 묵시적으로 덮어쓰는 사고를 막기 위함).\n');
  }
  printUsage();
  process.exit(force ? 1 : 0);
}
if (requestedRaw.length === 0) {
  console.error('✘ --domains 값이 비어 있습니다.\n');
  printUsage();
  process.exit(1);
}
const invalid = requestedRaw.filter((d) => !(DOMAIN_IDS as readonly string[]).includes(d));
if (invalid.length > 0) {
  console.error(`✘ 알 수 없는 도메인: ${invalid.join(', ')}\n`);
  printUsage();
  process.exit(1);
}
const requested = new Set(requestedRaw as DomainId[]);

const status = describeStatus();
console.log(`Supabase 상태: ${status.message}`);
console.log(`대상 도메인: ${[...requested].join(', ')}${dryRun ? '  [dry-run — 실제로 쓰지 않음]' : ''}${force ? '  [force — 지정한 도메인의 기존 row도 덮어씀]' : ''}\n`);

if (!isSupabaseWritable()) {
  console.error(
    '이관하려면 쓰기 권한이 필요합니다.\n' +
      '.env 에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,\n' +
      'SUPABASE_SERVICE_ROLE_KEY 를 모두 채운 뒤 다시 실행하세요.',
  );
  process.exit(1);
}

let totalInserted = 0;
let totalUpdated = 0;
let totalSkipped = 0;
let totalFailed = 0;

function stripFilePath<T extends { filePath?: unknown }>(item: T): Omit<T, 'filePath'> {
  const { filePath: _filePath, ...rest } = item;
  return rest;
}

/** 슬러그 기반 도메인 공용 처리 — 모든 도메인 공통: 신규는 INSERT, 기존 row는 SKIP(--force 시에만 UPDATE). */
async function processSlugDomain<T extends { slug: string }>(opts: {
  name: string;
  items: T[];
  existingSlugs: Set<string>;
  save: (item: T) => Promise<string>;
}) {
  const { name, items, existingSlugs } = opts;
  console.log(`── ${name} — 로컬 ${items.length}건, DB 기존 ${existingSlugs.size}건`);
  if (force && existingSlugs.size > 0) {
    console.log(`  ⚠️  --force: 기존 ${existingSlugs.size}건이 로컬 파일 값으로 덮어써질 예정입니다.`);
  }
  for (const item of items) {
    const exists = existingSlugs.has(item.slug);

    if (exists && !force) {
      console.log(`  ⏭  ${item.slug} — 이미 존재 (운영 데이터 보호, 건너뜀 — 덮어쓰려면 --force)`);
      totalSkipped++;
      continue;
    }

    const willInsert = !exists;
    if (dryRun) {
      console.log(`  ${willInsert ? '＋ INSERT' : '↻ UPDATE (--force)'}  ${item.slug}`);
      willInsert ? totalInserted++ : totalUpdated++;
      continue;
    }

    try {
      await opts.save(item);
      console.log(`  ✔ ${item.slug}${willInsert ? ' (신규)' : ' (강제 덮어씀)'}`);
      willInsert ? totalInserted++ : totalUpdated++;
    } catch (error) {
      console.error(`  ✘ ${item.slug} — ${error instanceof Error ? error.message : String(error)}`);
      totalFailed++;
    }
  }
  console.log('');
}

// ── builders ─────────────────────────────────────────────────
if (requested.has('builders')) {
  const { builders, errors } = await builderFileRepository.getAll();
  for (const e of errors) console.error(`[builders] 파싱 실패 (건너뜀): ${e}`);
  const { builders: existing } = await builderSupabaseRepository.getAll();
  await processSlugDomain({
    name: 'builders',
    items: builders,
    existingSlugs: new Set(existing.map((b) => b.slug)),
    save: (b) => {
      const { bio, filePath: _filePath, ...frontmatter } = b;
      return builderSupabaseRepository.save(frontmatter, bio);
    },
  });
}

// ── works ────────────────────────────────────────────────────
if (requested.has('works')) {
  const { works, errors } = await workFileRepository.getAll();
  for (const e of errors) console.error(`[works] 파싱 실패 (건너뜀): ${e}`);
  const { works: existing } = await workSupabaseRepository.getAll();
  await processSlugDomain({
    name: 'works',
    items: works,
    existingSlugs: new Set(existing.map((w) => w.slug)),
    save: (w) => workSupabaseRepository.save(stripFilePath(w)),
  });
}

// ── videos ───────────────────────────────────────────────────
if (requested.has('videos')) {
  const { videos, errors } = await videoFileRepository.getAll();
  for (const e of errors) console.error(`[videos] 파싱 실패 (건너뜀): ${e}`);
  const { videos: existing } = await videoSupabaseRepository.getAll();
  await processSlugDomain({
    name: 'videos',
    items: videos,
    existingSlugs: new Set(existing.map((v) => v.slug)),
    save: (v) => videoSupabaseRepository.save(stripFilePath(v)),
  });
}

// ── faq-categories (faqs 보다 먼저 — category_id FK 대상) ─────
if (requested.has('faq-categories')) {
  const { categories, errors } = await faqCategoryFileRepository.getAll();
  for (const e of errors) console.error(`[faq-categories] 파싱 실패 (건너뜀): ${e}`);
  const { categories: existing } = await faqCategorySupabaseRepository.getAll();
  await processSlugDomain({
    name: 'faq-categories',
    items: categories,
    existingSlugs: new Set(existing.map((c) => c.slug)),
    save: (c) => faqCategorySupabaseRepository.save(stripFilePath(c)),
  });
}

// ── faqs ─────────────────────────────────────────────────────
if (requested.has('faqs')) {
  const { faqs, errors } = await faqFileRepository.getAll();
  for (const e of errors) console.error(`[faqs] 파싱 실패 (건너뜀): ${e}`);
  const { faqs: existing } = await faqSupabaseRepository.getAll();
  await processSlugDomain({
    name: 'faqs',
    items: faqs,
    existingSlugs: new Set(existing.map((f) => f.slug)),
    save: (f) => {
      const { answer, filePath: _filePath, ...frontmatter } = f;
      return faqSupabaseRepository.save(frontmatter, answer);
    },
  });
}

// ── admin-accounts ───────────────────────────────────────────
if (requested.has('admin-accounts')) {
  const { accounts, errors } = await adminAccountFileRepository.getAll();
  for (const e of errors) console.error(`[admin-accounts] 파싱 실패 (건너뜀): ${e}`);
  const { accounts: existing } = await adminAccountSupabaseRepository.getAll();
  await processSlugDomain({
    name: 'admin-accounts',
    items: accounts,
    existingSlugs: new Set(existing.map((a) => a.slug)),
    save: (a) => adminAccountSupabaseRepository.save(stripFilePath(a)),
  });
}

// ── site-settings (싱글톤) ──────────────────────────────────────
// 로컬 파일이 없으면 --force 여도 절대 쓰지 않는다(하드 룰). 파일이 있고 DB row가 이미
// 있으면(마이그레이션으로 항상 시드되므로 사실상 항상 있음) --force 없이는 건드리지 않는다.
if (requested.has('site-settings')) {
  const { settings, error: readError } = await siteSettingsFileRepository.get();
  const localFileExists = fs.existsSync(settings.filePath);

  console.log('── site-settings');
  if (!localFileExists) {
    console.log(`  ⏭  로컬 파일 없음(${settings.filePath}) — DB를 건드리지 않고 건너뜁니다.`);
    console.log('     (빈 기본값으로 기존 설정을 덮어쓰는 사고를 막기 위한 하드 룰 — --force 로도 우회할 수 없습니다.)\n');
    totalSkipped++;
  } else if (readError) {
    console.error(`  ✘ 로컬 파일 파싱 실패 — 건너뜀: ${readError}\n`);
    totalFailed++;
  } else if (!force) {
    console.log('  ⏭  DB에 이미 site_settings row가 있음(마이그레이션으로 항상 시드됨) — 운영 데이터 보호, 건너뜀 (덮어쓰려면 --force)\n');
    totalSkipped++;
  } else if (dryRun) {
    console.log('  ↻ UPDATE (--force)  site-settings\n');
    totalUpdated++;
  } else {
    try {
      await siteSettingsSupabaseRepository.save(stripFilePath(settings));
      console.log('  ✔ site-settings (강제 덮어씀)\n');
      totalUpdated++;
    } catch (error) {
      console.error(`  ✘ site-settings — ${error instanceof Error ? error.message : String(error)}\n`);
      totalFailed++;
    }
  }
}

console.log(
  `${dryRun ? '[dry-run 계획]' : '[실행 결과]'} INSERT 예정/완료 ${totalInserted}건, ` +
    `UPDATE 예정/완료 ${totalUpdated}건, 보호되어 건너뜀 ${totalSkipped}건, 실패 ${totalFailed}건.`,
);

if (totalFailed > 0) process.exit(1);

if (!dryRun) {
  console.log(
    '\n다음: .env 에서 CONTENT_DRIVER 를 비워두면 자동으로 Supabase 를 사용합니다.\n' +
      '파일은 그대로 두었습니다. 동작을 확인한 뒤 정리하세요.',
  );
}
