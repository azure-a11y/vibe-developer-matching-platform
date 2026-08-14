import type {
  AdminAccount,
  AdminAccountFrontmatterInput,
  Builder,
  BuilderFrontmatterInput,
  Post,
  PostFrontmatterInput,
  SiteSettings,
  SiteSettingsFrontmatterInput,
  Work,
  WorkFrontmatterInput,
} from '../schema.ts';

/**
 * Storage-agnostic content API.
 *
 * Two drivers implement this: `file` (markdown on disk, the default) and
 * `supabase` (Postgres, active once keys are present). Everything above this
 * interface — web pages, admin screens, the audit CLI — is driver-agnostic,
 * so switching backends does not touch app code.
 *
 * The API is async even for the file driver, so the two are interchangeable.
 */
export interface ContentRepository {
  /** Which driver is running. Surfaced in the admin banner and `pnpm check`. */
  readonly driver: 'file' | 'supabase';

  /** Every post, newest first. Invalid records are reported, not swallowed. */
  getAll(): Promise<{ posts: Post[]; errors: string[] }>;

  /** Posts the public site may render: published, not noindex, not future-dated. */
  getPublished(): Promise<Post[]>;

  getBySlug(slug: string): Promise<Post | null>;

  /** Create or overwrite. Returns the stored slug. */
  save(frontmatter: PostFrontmatterInput, body: string): Promise<string>;

  remove(slug: string): Promise<boolean>;
}

/**
 * Same shape as `ContentRepository`, for the Builder domain
 * (docs/project/06_데이터모델.md §3.2).
 */
export interface BuilderRepository {
  readonly driver: 'file' | 'supabase';

  getAll(): Promise<{ builders: Builder[]; errors: string[] }>;

  /** Builders the public site may render: `active` only. */
  getActive(): Promise<Builder[]>;

  getBySlug(slug: string): Promise<Builder | null>;

  save(frontmatter: BuilderFrontmatterInput, bio: string): Promise<string>;

  remove(slug: string): Promise<boolean>;
}

/**
 * Same shape again, for the Work domain (docs/project/06_데이터모델.md §3.3).
 */
export interface WorkRepository {
  readonly driver: 'file' | 'supabase';

  getAll(): Promise<{ works: Work[]; errors: string[] }>;

  /** Work the public site may render: `published` only. */
  getPublished(): Promise<Work[]>;

  getBySlug(slug: string): Promise<Work | null>;

  save(frontmatter: WorkFrontmatterInput): Promise<string>;

  remove(slug: string): Promise<boolean>;
}

/**
 * Admin auth domain (docs/project/06_데이터모델.md §3.6).
 */
export interface AdminAccountRepository {
  readonly driver: 'file' | 'supabase';

  getAll(): Promise<{ accounts: AdminAccount[]; errors: string[] }>;

  getBySlug(slug: string): Promise<AdminAccount | null>;

  getByEmail(email: string): Promise<AdminAccount | null>;

  save(frontmatter: AdminAccountFrontmatterInput): Promise<string>;

  remove(slug: string): Promise<boolean>;
}

/**
 * Site settings (docs/project/06_데이터모델.md §3.7) — singleton, so this
 * shape is `get`/`save` rather than list/getBySlug/remove.
 */
export interface SiteSettingsRepository {
  readonly driver: 'file' | 'supabase';

  get(): Promise<{ settings: SiteSettings; error: string | null }>;

  save(frontmatter: SiteSettingsFrontmatterInput): Promise<void>;
}
