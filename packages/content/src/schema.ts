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
  ownerBuilderId: z.string().uuid().nullable().default(null),
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

/** One "일하는 원칙" card on the Builder profile page. */
export const BuilderPrincipleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});
export type BuilderPrinciple = z.infer<typeof BuilderPrincipleSchema>;

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
  /** Short title shown under the name, e.g. "프로덕트 빌더 · 기획+개발". */
  role: z.string().default(''),
  /** One-line focus area, e.g. "프로덕트 전체 · MVP · 검증". */
  focus: z.string().default(''),
  /** "일하는 원칙" cards on the profile page — 2~3 items in the 1안 design. */
  principles: z.array(BuilderPrincipleSchema).default([]),
  /** Badge text on the card/hero, e.g. "✳ 이달의 빌더" or "NEW". Empty = no badge. */
  badgeLabel: z.string().default(''),
  /** Drives the lead-styled badge variant (vs the plain "NEW" variant). */
  isLead: z.boolean().default(false),
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

/**
 * Work category — drives the filter chips on the public Work list
 * (artifact/ai-builder-group/05-서비스-nextjs `app/work/view.tsx`).
 */
export const WorkCategory = z.enum(['aiax', 'commerce', 'platform', 'finance']);
export type WorkCategory = z.infer<typeof WorkCategory>;

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
  ownerBuilderId: z.string().uuid().nullable().default(null),
  status: WorkStatus.default('pending_review'),
  /** Filter-chip category. Added for the 지홍님 1안 Work 목록 필터 (아이엑스/커머스/플랫폼/파이낸스). */
  category: WorkCategory.default('platform'),
  /** Free-text display tag shown on the card, e.g. "SaaS · Admin", "O2O" — more specific than `category`. */
  tag: z.string().default(''),
  /** Display year on the card/detail, e.g. "2026". Free text because a project can span years. */
  year: z.string().default(''),
  /** "with 똑똑한개발자 · 빌더 조쉬" style partner credit line shown on the card. */
  partner: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkFrontmatter = z.infer<typeof WorkFrontmatterSchema>;

export type WorkFrontmatterInput = z.input<typeof WorkFrontmatterSchema>;

export interface Work extends WorkFrontmatter {
  filePath: string;
}

/**
 * FAQ domain — Q&A board managed from the admin, rendered on the public FAQ
 * page and mirrored into the home page's FAQ preview so both read the same
 * source of truth.
 *
 * Categories are their own entity (`FaqCategory`), not a free-text field on
 * `Faq` — admins manage the category list (create/rename/reorder/activate)
 * independently of individual entries.
 */
export const FaqCategoryFrontmatterSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  /** Lower sorts first. */
  order: z.number().int().default(0),
  /** Inactive categories are hidden from the public site but keep their FAQ entries (reassign before deleting). */
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FaqCategoryFrontmatter = z.infer<typeof FaqCategoryFrontmatterSchema>;

export type FaqCategoryFrontmatterInput = z.input<typeof FaqCategoryFrontmatterSchema>;

export interface FaqCategory extends FaqCategoryFrontmatter {
  filePath: string;
}

export const FaqStatus = z.enum(['archived', 'published']);
export type FaqStatus = z.infer<typeof FaqStatus>;

export const FaqFrontmatterSchema = z.object({
  question: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  /**
   * `FaqCategory.slug` — a real reference, not free text. Kept slug-keyed
   * (not a synthetic id) for the same reason `Work.builderIds` is a slug
   * array: the file driver has no uuid concept, and this keeps both drivers
   * structurally identical. The Supabase migration enforces it with an
   * actual foreign key against `faq_categories(slug)`.
   */
  categoryId: z.string().min(1),
  /** Lower sorts first, within a category. */
  order: z.number().int().default(0),
  status: FaqStatus.default('archived'),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FaqFrontmatter = z.infer<typeof FaqFrontmatterSchema>;

export type FaqFrontmatterInput = z.input<typeof FaqFrontmatterSchema>;

export interface Faq extends FaqFrontmatter {
  /** Answer body, markdown, frontmatter stripped — same split as Post/Builder. */
  answer: string;
  filePath: string;
}

/**
 * Video domain — 유튜브 영상 관리. 콘텐츠 페이지(`/content`)에 노출되는 영상
 * 목록의 진실 공급원. 발행 상태 개념은 없다: 등록된 영상은 전부 공개
 * 사이트에 보인다 (Post/Work처럼 별도 검수 게이트가 필요하다는 요청이 없었음).
 *
 * `youtubeId`는 `youtubeUrl`에서 저장 시점에 파싱해 같이 저장한다 — 공개
 * 페이지가 클라이언트 컴포넌트라 `@orca/content`(node:fs 의존)를 직접 import할
 * 수 없으므로, 썸네일/임베드에 필요한 값은 서버에서 미리 계산해 내려준다.
 *
 * `featured`는 한 번에 하나만 true — 저장 시 다른 영상의 featured는 자동 해제된다
 * (videos.ts `writeVideo` 참고).
 */
export const VideoFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(120, 'slug should stay under 120 chars')
    .regex(SLUG_PATTERN, 'slug must be lowercase, hyphen-separated, with no whitespace'),
  youtubeUrl: z.string().url(),
  /** 11-char YouTube video id, parsed from `youtubeUrl`. */
  youtubeId: z.string().min(1),
  /** Lower sorts first. */
  order: z.number().int().default(0),
  /** 대표영상 — 공개 페이지 상단에 고정 노출. 한 번에 하나만 true. */
  featured: z.boolean().default(false),
  status: z.enum(['published', 'private']).default('published'),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type VideoFrontmatter = z.infer<typeof VideoFrontmatterSchema>;

export type VideoFrontmatterInput = z.input<typeof VideoFrontmatterSchema>;

export interface Video extends VideoFrontmatter {
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
  video: PermissionLevel.default('none'),
  faq: PermissionLevel.default('none'),
  inquiry: PermissionLevel.default('none'),
  settings: PermissionLevel.default('none'),
  accountPermission: PermissionLevel.default('none'),
});
export type AdminMenuPermissions = z.infer<typeof AdminMenuPermissionsSchema>;
export type MenuKey = keyof AdminMenuPermissions;

export const AdminAccountStatus = z.enum(['active', 'inactive']);
export type AdminAccountStatus = z.infer<typeof AdminAccountStatus>;
export const AdminAccountRole = z.enum(['admin', 'builder']);
export type AdminAccountRole = z.infer<typeof AdminAccountRole>;

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
  role: AdminAccountRole.default('admin'),
  builderId: z.string().uuid().nullable().default(null),
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
