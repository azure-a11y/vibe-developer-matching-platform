import { z } from 'zod';

/**
 * Content lifecycle. The admin app moves a post through these states;
 * the web app only ever renders `published`.
 */
export const PostStatus = z.enum(['draft', 'in_review', 'scheduled', 'published', 'archived']);
export type PostStatus = z.infer<typeof PostStatus>;

/**
 * Provenance of every image in the repo.
 *
 * HARD RULE (see CLAUDE.md § Image Policy): the only machine-generated
 * value allowed here is `codex-imagegen`. An agent may never write
 * `claude` or any other model — Claude image synthesis is forbidden.
 *
 * `user-upload` covers images a human attaches through the admin editor,
 * including Supabase Storage uploads. Uploading is not generating.
 */
export const ImageSource = z.enum(['codex-imagegen', 'user-upload', 'web-search', 'none']);
export type ImageSource = z.infer<typeof ImageSource>;

export const ImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1, 'alt text is required for accessibility and SEO'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** Where the image came from. Required so review can audit provenance. */
  source: ImageSource,
  /** Original prompt (codex-imagegen) or source URL (web-search). */
  origin: z.string().optional(),
  credit: z.string().optional(),
  license: z.string().optional(),
});
export type Image = z.infer<typeof ImageSchema>;

/** Sitemap hints, surfaced per-post so editors can prioritise cornerstone content. */
export const ChangeFreq = z.enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);
export type ChangeFreq = z.infer<typeof ChangeFreq>;

export const TwitterCard = z.enum(['summary', 'summary_large_image']);
export const OgType = z.enum(['article', 'website']);

/**
 * Technical SEO metadata.
 *
 * Everything here maps to something a crawler actually reads — a meta tag,
 * a link rel, a sitemap field, or a robots directive. Nothing is decorative.
 */
export const SeoSchema = z.object({
  title: z.string().max(60, 'SEO title should stay under 60 chars').optional(),
  description: z.string().max(160, 'meta description should stay under 160 chars').optional(),
  keywords: z.array(z.string()).default([]),

  // ── Indexing control ─────────────────────────────────────
  canonical: z.string().optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  /**
   * Extra robots directives, e.g. `max-snippet:-1`, `max-image-preview:large`.
   * These matter for GEO: they control how much an answer engine may quote.
   */
  robotsDirectives: z.array(z.string()).default([]),

  // ── Open Graph ───────────────────────────────────────────
  ogType: OgType.default('article'),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),

  // ── Twitter / X ──────────────────────────────────────────
  twitterCard: TwitterCard.default('summary_large_image'),
  twitterSite: z.string().optional(),
  twitterCreator: z.string().optional(),

  // ── Sitemap ──────────────────────────────────────────────
  changefreq: ChangeFreq.default('monthly'),
  priority: z.number().min(0).max(1).default(0.7),

  // ── i18n ─────────────────────────────────────────────────
  /** hreflang alternates. `hreflang: 'x-default'` is allowed. */
  alternates: z
    .array(z.object({ hreflang: z.string().min(1), href: z.string().min(1) }))
    .default([]),

  /** Include this post in `/llms.txt`. Turn off for thin or time-bound pages. */
  llmsTxt: z.boolean().default(true),
});
export type Seo = z.infer<typeof SeoSchema>;

/**
 * GEO = Generative Engine Optimization.
 * Structured signals that answer engines (ChatGPT, Claude, Perplexity,
 * AI Overviews) extract when citing a page — plus locale targeting.
 */
export const GeoSchema = z.object({
  /** BCP-47 locale, e.g. `ko-KR`. */
  locale: z.string().default('ko-KR'),
  /** Markets this post targets, e.g. ['KR', 'US']. */
  targetMarkets: z.array(z.string()).default([]),
  /** One-paragraph extractive summary an answer engine can quote verbatim. */
  answerSummary: z.string().optional(),
  /** Named entities the post should be associated with. */
  entities: z.array(z.string()).default([]),
  /** Q&A pairs rendered as FAQPage JSON-LD — the highest-yield GEO signal. */
  faq: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .default([]),
  /** Primary sources cited in the body; answer engines weight cited pages higher. */
  citations: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .default([]),
});
export type Geo = z.infer<typeof GeoSchema>;

/** Editorial review record produced by the admin review screen. */
export const ReviewSchema = z.object({
  reviewer: z.string().optional(),
  reviewedAt: z.string().optional(),
  checks: z
    .object({
      factual: z.boolean().default(false),
      tone: z.boolean().default(false),
      seo: z.boolean().default(false),
      geo: z.boolean().default(false),
      images: z.boolean().default(false),
      links: z.boolean().default(false),
    })
    // zod 4: `.default()` expects the parsed output; `.prefault()` feeds the
    // value through parsing so the inner field defaults still apply.
    .prefault({}),
  notes: z.string().optional(),
});
export type Review = z.infer<typeof ReviewSchema>;

/**
 * Slug rules.
 *
 * Natural-language slugs are allowed and preferred: keeping the target keyword
 * in the URL is a real ranking and click-through signal, and Korean/Japanese
 * readers see a legible URL rather than transliterated mush. Browsers
 * percent-encode non-ASCII on the wire and display it decoded.
 *
 * Constraints: lowercase, no whitespace, hyphen-separated. `\p{Lo}` covers
 * Hangul, Kana and Han; `\p{Ll}` covers lowercase Latin/Cyrillic/Greek.
 */
export const SLUG_PATTERN = /^[\p{Ll}\p{Lo}\p{N}]+(?:-[\p{Ll}\p{Lo}\p{N}]+)*$/u;

export const PostFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  description: z.string().default(''),
  status: PostStatus.default('draft'),
  /** Agent or human that authored the draft. */
  author: z.string().default('unknown'),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().default('general'),
  cover: ImageSchema.optional(),
  seo: SeoSchema.prefault({}),
  geo: GeoSchema.prefault({}),
  review: ReviewSchema.prefault({}),
});
export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

/**
 * The shape callers pass to `writePost`. Fields with schema defaults are
 * optional here — the parse step fills them in.
 */
export type PostFrontmatterInput = z.input<typeof PostFrontmatterSchema>;

export interface Post extends PostFrontmatter {
  /** Markdown body, frontmatter stripped. */
  body: string;
  /** Absolute path on disk. Empty when the post came from Supabase. */
  filePath: string;
  readingTimeMinutes: number;
}

/**
 * Builder domain (docs/project/06_데이터모델.md §3.2).
 *
 * Status mirrors the approval flow described in the policy doc
 * (docs/project/04_정책정의.md §3.3): a builder signs up `pending`, an admin
 * flips them to `active` before they're surfaced anywhere public.
 */
export const BuilderStatus = z.enum(['pending', 'active', 'inactive']);
export type BuilderStatus = z.infer<typeof BuilderStatus>;

/**
 * Per-builder Insight permissions. Defaults are all `false` — an admin grants
 * each individually (docs/project/04_정책정의.md §4.2). Work upload is not a
 * toggle here: every builder may submit Work, it just always lands in
 * `pending_review` regardless of these flags.
 */
export const BuilderPermissionsSchema = z.object({
  canWriteInsight: z.boolean().default(false),
  canEditInsight: z.boolean().default(false),
  canDeleteInsight: z.boolean().default(false),
});
export type BuilderPermissions = z.infer<typeof BuilderPermissionsSchema>;

export const BuilderFrontmatterSchema = z.object({
  displayName: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  avatar: ImageSchema.optional(),
  specialties: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  communityActivity: z.array(z.string()).default([]),
  verifications: z.array(z.string()).default([]),
  status: BuilderStatus.default('pending'),
  permissions: BuilderPermissionsSchema.prefault({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BuilderFrontmatter = z.infer<typeof BuilderFrontmatterSchema>;

export type BuilderFrontmatterInput = z.input<typeof BuilderFrontmatterSchema>;

export interface Builder extends BuilderFrontmatter {
  /** Bio, markdown, frontmatter stripped — same split as Post. */
  bio: string;
  filePath: string;
}

/**
 * Work domain (docs/project/06_데이터모델.md §3.3).
 *
 * No `scheduled` state — Work only has an approval gate, not a publish
 * calendar (docs/project/04_정책정의.md §3.3): every Work lands in
 * `pending_review` until an admin flips it to `published`.
 */
export const WorkStatus = z.enum(['pending_review', 'published', 'archived']);
export type WorkStatus = z.infer<typeof WorkStatus>;

export const WorkFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  summary: z.string().default(''),
  scope: z.string().default(''),
  builderRole: z.string().default(''),
  period: z.string().default(''),
  techStack: z.array(z.string()).default([]),
  problem: z.string().default(''),
  solution: z.string().default(''),
  result: z.string().default(''),
  assets: z.array(ImageSchema).default([]),
  /** Participating builders — N:M, resolved against Builder.slug at read time. */
  builderIds: z.array(z.string()).default([]),
  status: WorkStatus.default('pending_review'),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkFrontmatter = z.infer<typeof WorkFrontmatterSchema>;

export type WorkFrontmatterInput = z.input<typeof WorkFrontmatterSchema>;

export interface Work extends WorkFrontmatter {
  filePath: string;
}

/**
 * Admin auth domain (docs/project/06_데이터모델.md §3.6, 04_정책정의.md §4).
 *
 * `full` > `edit_approve` > `view` > `none` — the four levels the admin
 * mockup used. `edit_approve` covers create/edit/status-change; only `full`
 * may delete (04_정책정의.md doesn't define a separate delete tier, so this
 * is the minimal reading, not an invented one).
 */
export const PermissionLevel = z.enum(['full', 'edit_approve', 'view', 'none']);
export type PermissionLevel = z.infer<typeof PermissionLevel>;

/**
 * One entry per admin nav item (components/AdminShell.tsx). Defaults are
 * `view` on the dashboard only — every other menu starts `none` so a fresh
 * account can't touch anything until explicitly granted.
 */
export const AdminMenuPermissionsSchema = z.object({
  dashboard: PermissionLevel.default('view'),
  builder: PermissionLevel.default('none'),
  work: PermissionLevel.default('none'),
  insight: PermissionLevel.default('none'),
  inquiry: PermissionLevel.default('none'),
  settings: PermissionLevel.default('none'),
  accountPermission: PermissionLevel.default('none'),
});
export type AdminMenuPermissions = z.infer<typeof AdminMenuPermissionsSchema>;
export type MenuKey = keyof AdminMenuPermissions;

export const AdminAccountStatus = z.enum(['active', 'inactive']);
export type AdminAccountStatus = z.infer<typeof AdminAccountStatus>;

export const AdminAccountFrontmatterSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  email: z.string().email(),
  name: z.string().min(1),
  /**
   * Free text, not an enum — grade names/count are unconfirmed (Q21,
   * 06_데이터모델.md §6). Authorization reads `menuPermissions` directly,
   * never this field, so an unconfirmed label can't accidentally gate access.
   */
  grade: z.string().default('미지정'),
  passwordHash: z.string().min(1),
  menuPermissions: AdminMenuPermissionsSchema.prefault({}),
  status: AdminAccountStatus.default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminAccountFrontmatter = z.infer<typeof AdminAccountFrontmatterSchema>;

export type AdminAccountFrontmatterInput = z.input<typeof AdminAccountFrontmatterSchema>;

export interface AdminAccount extends AdminAccountFrontmatter {
  filePath: string;
}

/**
 * Site settings (docs/project/06_데이터모델.md §3.7) — a singleton, not a
 * list. Exists so values that keep coming up as unconfirmed (brand name Q1,
 * domain Q3, pluug form link Q7/Q20) never get hardcoded into app code; the
 * admin edits them here and the public site reads them at render time.
 *
 * Company/footer fields track PRD §8 Q12 — flagged there as *unverified*
 * facts copied from the mockup, not confirmed legal info. Never generate or
 * guess a value for these; leave blank until a human enters the real one.
 *
 * No secrets here: env vars stay in .env (PLUUG_ADMIN_URL, ADMIN_SESSION_SECRET,
 * etc.) — this schema only holds values that are safe to read from a public
 * page.
 */
export const SiteSettingsFrontmatterSchema = z.object({
  brandName: z.string().default(''),
  domain: z.string().default(''),
  /** Public "문의하기" form link (FR-5 AC-5.3) — distinct from PLUUG_ADMIN_URL (admin-only, env var). */
  pluugFormUrl: z.string().default(''),
  companyName: z.string().default(''),
  ceoName: z.string().default(''),
  businessRegistrationNumber: z.string().default(''),
  operatedBy: z.string().default(''),
  updatedAt: z.string(),
});
export type SiteSettingsFrontmatter = z.infer<typeof SiteSettingsFrontmatterSchema>;

export type SiteSettingsFrontmatterInput = z.input<typeof SiteSettingsFrontmatterSchema>;

export interface SiteSettings extends SiteSettingsFrontmatter {
  filePath: string;
}
