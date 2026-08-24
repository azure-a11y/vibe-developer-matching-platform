import { createAdminSupabase as createAdminSupabaseClient, createPublicSupabase, isSupabaseWritable } from '@orca/supabase';
import type { AdminAccountRow, BuilderRow, FaqCategoryRow, FaqRow, PostRow, SiteSettingsRow, VideoRow, WorkRow } from '@orca/supabase';

import { readingTime } from '../posts.ts';
import {
  type AdminAccount,
  type AdminAccountFrontmatterInput,
  AdminAccountFrontmatterSchema,
  type Builder,
  type BuilderFrontmatterInput,
  BuilderFrontmatterSchema,
  type Faq,
  type FaqCategory,
  type FaqCategoryFrontmatterInput,
  FaqCategoryFrontmatterSchema,
  type FaqFrontmatterInput,
  FaqFrontmatterSchema,
  type Post,
  type PostFrontmatterInput,
  PostFrontmatterSchema,
  type SiteSettings,
  type SiteSettingsFrontmatterInput,
  SiteSettingsFrontmatterSchema,
  type Video,
  type VideoFrontmatterInput,
  VideoFrontmatterSchema,
  type Work,
  type WorkFrontmatterInput,
  WorkFrontmatterSchema,
} from '../schema.ts';
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

/**
 * Public deployments have only anon credentials; admin deployments also have
 * the service-role key and therefore retain unrestricted admin reads/writes.
 */
function createAdminSupabase() {
  return isSupabaseWritable() ? createAdminSupabaseClient() : createPublicSupabase();
}

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
    ownerBuilderId: row.owner_builder_id,
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
    owner_builder_id: v.ownerBuilderId,
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

  async getOwnedByBuilder(builderId: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('posts').select('*').eq('owner_builder_id', builderId).order('updated_at', { ascending: false });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toPost);
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
    id: row.id,
    displayName: row.display_name,
    slug: row.slug,
    avatar: row.avatar ?? undefined,
    specialties: row.specialties,
    education: row.education,
    communityActivity: row.community_activity,
    verifications: row.verifications,
    status: row.status,
    permissions: row.permissions,
    role: row.role,
    focus: row.focus,
    principles: row.principles,
    badgeLabel: row.badge_label,
    isLead: row.is_lead,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, bio: row.bio, filePath: '' };
}

/**
 * Includes `id` so a builder migrated in from the file driver (or created
 * there while `CONTENT_DRIVER=file` overrides an active Supabase config)
 * keeps the same uuid in both places instead of Postgres minting a new one
 * via `builders.id`'s `gen_random_uuid()` default on insert — the two
 * drivers would otherwise disagree on a Builder's identity, breaking
 * `AdminAccount.builderId`/`ownerBuilderId` links across a driver switch.
 * `save()` below strips `id` back out before updating an existing row, so
 * this only ever takes effect on insert.
 */
function toBuilderRow(frontmatter: BuilderFrontmatterInput, bio: string) {
  const v = BuilderFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    id: v.id,
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
    role: v.role,
    focus: v.focus,
    principles: v.principles,
    badge_label: v.badgeLabel,
    is_lead: v.isLead,
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
    const { data, error } = await supabase
      .from('builders')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toBuilder);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('builders').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toBuilder(data) : null;
  },

  async getById(id: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('builders').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toBuilder(data) : null;
  },

  /**
   * Insert vs. update, not a slug-conflict upsert — an upsert would put `id`
   * in the `DO UPDATE SET` list along with every other column, so an existing
   * Builder's primary key would move if the caller's `id` ever disagreed
   * with the stored one. Splitting the two paths makes that structurally
   * impossible: the update branch's payload never contains `id` at all.
   */
  async save(frontmatter: BuilderFrontmatterInput, bio: string) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const { id, ...row } = toBuilderRow(frontmatter, bio);

    const { data: existing, error: lookupError } = await supabase
      .from('builders')
      .select('id')
      .eq('slug', row.slug)
      .maybeSingle();
    if (lookupError) throw new Error(`Supabase 조회 실패: ${lookupError.message}`);

    const { error } = existing
      ? await supabase.from('builders').update(row).eq('slug', row.slug)
      : await supabase.from('builders').insert({ id, ...row });
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
    ownerBuilderId: row.owner_builder_id,
    status: row.status,
    category: row.category,
    tag: row.tag,
    year: row.year,
    partner: row.partner,
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
    owner_builder_id: v.ownerBuilderId,
    status: v.status,
    category: v.category,
    tag: v.tag,
    year: v.year,
    partner: v.partner,
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
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toWork);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('works').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toWork(data) : null;
  },

  async getOwnedByBuilder(builderId: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('works').select('*').eq('owner_builder_id', builderId).order('updated_at', { ascending: false });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toWork);
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
 * FAQ category domain, Postgres driver. Same shape as `builderSupabaseRepository`.
 */

function toFaqCategory(row: FaqCategoryRow): FaqCategory {
  const parsed = FaqCategoryFrontmatterSchema.safeParse({
    name: row.name,
    slug: row.slug,
    order: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, filePath: '' };
}

function toFaqCategoryRow(frontmatter: FaqCategoryFrontmatterInput) {
  const v = FaqCategoryFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    name: v.name,
    sort_order: v.order,
    is_active: v.isActive,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

export const faqCategorySupabaseRepository: FaqCategoryRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('faq_categories').select('*').order('sort_order', { ascending: true });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const categories: FaqCategory[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        categories.push(toFaqCategory(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { categories, errors };
  },

  async getActive() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from('faq_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toFaqCategory);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('faq_categories').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toFaqCategory(data) : null;
  },

  async save(frontmatter: FaqCategoryFrontmatterInput) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const row = toFaqCategoryRow(frontmatter);
    const { error } = await supabase.from('faq_categories').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase.from('faq_categories').delete({ count: 'exact' }).eq('slug', slug);
    if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);
    return (count ?? 0) > 0;
  },
};

/**
 * FAQ domain, Postgres driver. `category_id` is a `faq_categories.slug`
 * reference — see the comment on `FaqRow` in `@orca/supabase` for why it's
 * slug-keyed rather than a uuid FK to `faq_categories.id`.
 */

function toFaq(row: FaqRow): Faq {
  const parsed = FaqFrontmatterSchema.safeParse({
    question: row.question,
    slug: row.slug,
    categoryId: row.category_id,
    order: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`Invalid record for slug "${row.slug}"\n  - ${issues.join('\n  - ')}`);
  }

  return { ...parsed.data, answer: row.answer, filePath: '' };
}

function toFaqRow(frontmatter: FaqFrontmatterInput, answer: string) {
  const v = FaqFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    question: v.question,
    answer: answer.trim(),
    category_id: v.categoryId,
    sort_order: v.order,
    status: v.status,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

export const faqSupabaseRepository: FaqRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('category_id', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const faqs: Faq[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        faqs.push(toFaq(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { faqs, errors };
  },

  async getPublished() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .order('category_id', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('question', { ascending: true });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return (data ?? []).map(toFaq);
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('faqs').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toFaq(data) : null;
  },

  async save(frontmatter: FaqFrontmatterInput, answer: string) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const row = toFaqRow(frontmatter, answer);
    const { error } = await supabase.from('faqs').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase.from('faqs').delete({ count: 'exact' }).eq('slug', slug);
    if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);
    return (count ?? 0) > 0;
  },
};

/**
 * Video domain, Postgres driver. No publish gate — mirrors `faqCategorySupabaseRepository`
 * in shape. `save` clears `featured` on every other row first, same rule as
 * the file driver's `writeVideo`.
 */

function toVideo(row: VideoRow): Video {
  const parsed = VideoFrontmatterSchema.safeParse({
    title: row.title,
    slug: row.slug,
    youtubeUrl: row.youtube_url,
    youtubeId: row.youtube_id,
    order: row.sort_order,
    featured: row.featured,
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

function toVideoRow(frontmatter: VideoFrontmatterInput) {
  const v = VideoFrontmatterSchema.parse({ ...frontmatter, updatedAt: new Date().toISOString() });
  return {
    slug: v.slug,
    title: v.title,
    youtube_url: v.youtubeUrl,
    youtube_id: v.youtubeId,
    sort_order: v.order,
    featured: v.featured,
    status: v.status,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

export const videoSupabaseRepository: VideoRepository = {
  driver: 'supabase',

  async getAll() {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('videos').select('*').order('sort_order', { ascending: true });
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);

    const videos: Video[] = [];
    const errors: string[] = [];
    for (const row of data ?? []) {
      try {
        videos.push(toVideo(row));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return { videos, errors };
  },

  async getBySlug(slug: string) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from('videos').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    return data ? toVideo(data) : null;
  },

  async save(frontmatter: VideoFrontmatterInput) {
    if (!isSupabaseWritable()) {
      throw new Error('Supabase 쓰기가 비활성입니다. SUPABASE_SERVICE_ROLE_KEY 를 .env 에 넣으세요.');
    }
    const supabase = createAdminSupabase();
    const row = toVideoRow(frontmatter);

    if (row.featured) {
      const { error: clearError } = await supabase
        .from('videos')
        .update({ featured: false, updated_at: new Date().toISOString() })
        .eq('featured', true)
        .neq('slug', row.slug);
      if (clearError) throw new Error(`Supabase 저장 실패: ${clearError.message}`);
    }

    const { error } = await supabase.from('videos').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`Supabase 저장 실패: ${error.message}`);
    return row.slug;
  },

  async remove(slug: string) {
    const supabase = createAdminSupabase();
    const { error, count } = await supabase.from('videos').delete({ count: 'exact' }).eq('slug', slug);
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
    role: row.role,
    builderId: row.builder_id,
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
    role: v.role,
    builder_id: v.builderId,
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
