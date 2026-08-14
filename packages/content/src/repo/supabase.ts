import { createAdminSupabase, isSupabaseWritable } from '@orca/supabase';
import type { AdminAccountRow, BuilderRow, PostRow, SiteSettingsRow, WorkRow } from '@orca/supabase';

import { readingTime } from '../posts.ts';
import {
  type AdminAccount,
  type AdminAccountFrontmatterInput,
  AdminAccountFrontmatterSchema,
  type Builder,
  type BuilderFrontmatterInput,
  BuilderFrontmatterSchema,
  type Post,
  type PostFrontmatterInput,
  PostFrontmatterSchema,
  type SiteSettings,
  type SiteSettingsFrontmatterInput,
  SiteSettingsFrontmatterSchema,
  type Work,
  type WorkFrontmatterInput,
  WorkFrontmatterSchema,
} from '../schema.ts';
import type {
  AdminAccountRepository,
  BuilderRepository,
  ContentRepository,
  SiteSettingsRepository,
  WorkRepository,
} from './types.ts';

/**
 * Postgres driver. Inactive until Supabase keys are set and the migration in
 * `packages/supabase/migrations` has been applied.
 *
 * Reads go through the service-role client so the admin can see drafts. The
 * public site's RLS policy (published + not noindex) is the safety net for
 * anon access — see `0001_init.sql`.
 */

/** DB row → validated domain object. Throws with the slug on schema violation. */
function toPost(row: PostRow): Post {
  const parsed = PostFrontmatterSchema.safeParse({
    title: row.title,
    slug: row.slug,
    description: row.description,
    status: row.status,
    author: row.author,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
    tags: row.tags,
    category: row.category,
    cover: row.cover ?? undefined,
    seo: row.seo,
    geo: row.geo,
    review: row.review,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return {
    ...parsed.data,
    body: row.body,
    filePath: '',
    readingTimeMinutes: readingTime(row.body),
  };
}

/** Domain object → DB row. */
function toRow(frontmatter: PostFrontmatterInput, body: string) {
  const v = PostFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    title: v.title,
    description: v.description,
    body: body.trim(),
    status: v.status,
    author: v.author,
    category: v.category,
    tags: v.tags,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
    published_at: v.publishedAt ?? null,
    cover: v.cover ?? null,
    seo: v.seo,
    geo: v.geo,
    review: v.review,
  };
}

export const supabaseRepository: ContentRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const posts: Post[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        posts.push(toPost(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { posts, errors };
  },

  async getPublished() {
    const supabase = createAdminSupabase();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .or(`published_at.is.null,published_at.lte.${now}`)
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    return (data ?? [])
      .map(toPost)
      // noindex is stored inside the seo jsonb, so it is filtered here rather
      // than in SQL. The RLS policy enforces the same rule for anon reads.
      .filter((post) => !post.seo.noindex);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toPost(data) : null;
  },

  async save(frontmatter: PostFrontmatterInput, body: string) {
    if (!isSupabaseWritable()) {
      throw new Error(
        'Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.',
      );
    }
    const supabase = createAdminSupabase();
    const row = toRow(frontmatter, body);
    const { error } = await supabase.from('posts').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase
      .from('posts')
      .delete({ count: 'exact' })
      .eq('slug', slug);
    if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);
    return (count ?? 0) > 0;
  },
};

/**
 * Builder domain, Postgres driver. Same shape as `supabaseRepository` above —
 * inactive until keys + `0002_builder_group_domains.sql` are applied.
 */

function toBuilder(row: BuilderRow): Builder {
  const parsed = BuilderFrontmatterSchema.safeParse({
    displayName: row.display_name,
    slug: row.slug,
    avatar: row.avatar ?? undefined,
    specialties: row.specialties,
    education: row.education,
    communityActivity: row.community_activity,
    verifications: row.verifications,
    status: row.status,
    permissions: row.permissions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, bio: row.bio, filePath: '' };
}

function toBuilderRow(frontmatter: BuilderFrontmatterInput, bio: string) {
  const v = BuilderFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    display_name: v.displayName,
    bio: bio.trim(),
    avatar: v.avatar ?? null,
    specialties: v.specialties,
    education: v.education,
    community_activity: v.communityActivity,
    verifications: v.verifications,
    status: v.status,
    permissions: v.permissions,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

export const builderSupabaseRepository: BuilderRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('builders').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const builders: Builder[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        builders.push(toBuilder(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { builders, errors };
  },

  async getActive() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('builders').select('*').eq('status', 'active');
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toBuilder);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('builders').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toBuilder(data) : null;
  },

  async save(frontmatter: BuilderFrontmatterInput, bio: string) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const row = toBuilderRow(frontmatter, bio);
    const { error } = await supabase.from('builders').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase.from('builders').delete({ count: 'exact' }).eq('slug', slug);
    if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);
    return (count ?? 0) > 0;
  },
};

/** Work domain, Postgres driver. `builder_ids` is a slug array — same relation shape as the file driver. */

function toWork(row: WorkRow): Work {
  const parsed = WorkFrontmatterSchema.safeParse({
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    scope: row.scope,
    builderRole: row.builder_role,
    period: row.period,
    techStack: row.tech_stack,
    problem: row.problem,
    solution: row.solution,
    result: row.result,
    assets: row.assets,
    builderIds: row.builder_ids,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath: '' };
}

function toWorkRow(frontmatter: WorkFrontmatterInput) {
  const v = WorkFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    title: v.title,
    summary: v.summary,
    scope: v.scope,
    builder_role: v.builderRole,
    period: v.period,
    tech_stack: v.techStack,
    problem: v.problem,
    solution: v.solution,
    result: v.result,
    assets: v.assets,
    builder_ids: v.builderIds,
    status: v.status,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

export const workSupabaseRepository: WorkRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('works').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const works: Work[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        works.push(toWork(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { works, errors };
  },

  async getPublished() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('works').select('*').eq('status', 'published');
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toWork);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('works').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toWork(data) : null;
  },

  async save(frontmatter: WorkFrontmatterInput) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const row = toWorkRow(frontmatter);
    const { error } = await supabase.from('works').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase.from('works').delete({ count: 'exact' }).eq('slug', slug);
    if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);
    return (count ?? 0) > 0;
  },
};

/**
 * Admin auth domain, Postgres driver. No RLS policy grants anon/authenticated
 * access to `admin_accounts` (see 0002 migration) — every read here goes
 * through the service-role client, same as the file driver's unrestricted
 * disk access.
 */

function toAdminAccount(row: AdminAccountRow): AdminAccount {
  const parsed = AdminAccountFrontmatterSchema.safeParse({
    slug: row.slug,
    email: row.email,
    name: row.name,
    grade: row.grade,
    passwordHash: row.password_hash,
    menuPermissions: row.menu_permissions,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath: '' };
}

function toAdminAccountRow(frontmatter: AdminAccountFrontmatterInput) {
  const v = AdminAccountFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    email: v.email,
    name: v.name,
    grade: v.grade,
    password_hash: v.passwordHash,
    menu_permissions: v.menuPermissions,
    status: v.status,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

export const adminAccountSupabaseRepository: AdminAccountRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('admin_accounts').select('*').order('email', { ascending: true });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const accounts: AdminAccount[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        accounts.push(toAdminAccount(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { accounts, errors };
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('admin_accounts').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toAdminAccount(data) : null;
  },

  async getByEmail(email: string) {
    const supabase = createAdminSupabase();
    // `ilike` with no wildcards behaves as a case-insensitive equality check,
    // matching the file driver's `email.toLowerCase()` comparison.
    const { data, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toAdminAccount(data) : null;
  },

  async save(frontmatter: AdminAccountFrontmatterInput) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const row = toAdminAccountRow(frontmatter);
    const { error } = await supabase.from('admin_accounts').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase.from('admin_accounts').delete({ count: 'exact' }).eq('slug', slug);
    if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);
    return (count ?? 0) > 0;
  },
};

/** Site settings, Postgres driver. Singleton row keyed by `id = true`. */

function toSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    brandName: row.brand_name,
    domain: row.domain,
    pluugFormUrl: row.pluug_form_url,
    companyName: row.company_name,
    ceoName: row.ceo_name,
    businessRegistrationNumber: row.business_registration_number,
    operatedBy: row.operated_by,
    updatedAt: row.updated_at,
    filePath: '',
  };
}

export const siteSettingsSupabaseRepository: SiteSettingsRepository = {
  driver: 'supabase',

  async get() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', true).maybeSingle();

    if (error) {
      return {
        settings: { ...SiteSettingsFrontmatterSchema.parse({ updatedAt: new Date().toISOString() }), filePath: '' },
        error: `Supabase 조회 실패: ${error.message}`,
      };
    }
    if (!data) {
      return {
        settings: { ...SiteSettingsFrontmatterSchema.parse({ updatedAt: new Date().toISOString() }), filePath: '' },
        error: null,
      };
    }
    return { settings: toSiteSettings(data), error: null };
  },

  async save(frontmatter: SiteSettingsFrontmatterInput) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const v = SiteSettingsFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
    const supabase = createAdminSupabase();
    const { error } = await supabase.from('site_settings').upsert(
      {
        id: true,
        brand_name: v.brandName,
        domain: v.domain,
        pluug_form_url: v.pluugFormUrl,
        company_name: v.companyName,
        ceo_name: v.ceoName,
        business_registration_number: v.businessRegistrationNumber,
        operated_by: v.operatedBy,
        updated_at: v.updatedAt,
      },
      { onConflict: 'id' },
    );
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
  },
};
