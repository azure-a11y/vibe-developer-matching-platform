/**
 * Supabase 테이블 타입.
 *
 * `migrations/0001_init.sql` 과 **수동으로 동기화**합니다.
 * 마이그레이션을 바꾸면 이 파일도 함께 고치세요. (`supabase gen types` 를 쓸 수도 있지만,
 * 데모 상태에서 CLI 의존성을 추가하지 않기 위해 손으로 관리합니다.)
 */

/**
 * posts 테이블의 한 행. 프론트매터 스키마와 1:1 대응됩니다.
 *
 * `interface` 가 아니라 `type` 이어야 합니다. supabase-js 의 `GenericTable` 은
 * `Row extends Record<string, unknown>` 을 요구하는데, 인터페이스에는 암묵적
 * 인덱스 시그니처가 붙지 않아 이 제약을 통과하지 못하고 모든 쿼리 결과 타입이
 * 조용히 `never` 로 무너집니다.
 */
export type PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  status: string;
  author: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  /** 프론트매터의 cover 블록 전체. */
  cover: Record<string, unknown> | null;
  /** 프론트매터의 seo 블록 전체 (canonical · robots · og · twitter · sitemap). */
  seo: Record<string, unknown>;
  /** 프론트매터의 geo 블록 전체 (answerSummary · faq · entities · citations). */
  geo: Record<string, unknown>;
  /** 프론트매터의 review 블록 전체. */
  review: Record<string, unknown>;
};

export type PostInsert = Omit<PostRow, 'id'> & { id?: string };

/** builders 테이블의 한 행. Builder 프론트매터 스키마와 1:1 대응됩니다. */
export type BuilderRow = {
  id: string;
  slug: string;
  display_name: string;
  bio: string;
  avatar: Record<string, unknown> | null;
  specialties: string[];
  education: string[];
  community_activity: string[];
  verifications: string[];
  status: string;
  permissions: Record<string, unknown>;
  /** 0003_work_builder_fields.sql 에서 추가 — 프로필 헤더 타이틀. */
  role: string;
  focus: string;
  /** {title, description}[] — Builder.principles 와 1:1. */
  principles: Record<string, unknown>[];
  badge_label: string;
  is_lead: boolean;
  created_at: string;
  updated_at: string;
};

export type BuilderInsert = Omit<BuilderRow, 'id'> & { id?: string };

/**
 * works 테이블의 한 행. `builder_ids` 는 Builder.slug 배열이다 — 별도
 * join 테이블이 아니라 file 드라이버(Work.builderIds)와 동일한 방식.
 */
export type WorkRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  scope: string;
  builder_role: string;
  period: string;
  tech_stack: string[];
  problem: string;
  solution: string;
  result: string;
  assets: Record<string, unknown>[];
  builder_ids: string[];
  status: string;
  /** 0003_work_builder_fields.sql 에서 추가 — Work 목록 필터/카드 표기용. */
  category: string;
  tag: string;
  year: string;
  partner: string;
  created_at: string;
  updated_at: string;
};

export type WorkInsert = Omit<WorkRow, 'id'> & { id?: string };

/** admin_accounts 테이블의 한 행. anon 키로는 절대 조회되지 않는다(RLS 정책 없음). */
export type AdminAccountRow = {
  id: string;
  slug: string;
  email: string;
  name: string;
  grade: string;
  password_hash: string;
  menu_permissions: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AdminAccountInsert = Omit<AdminAccountRow, 'id'> & { id?: string };

/** site_settings 테이블의 유일한 행 (id 는 항상 true). */
export type SiteSettingsRow = {
  id: boolean;
  brand_name: string;
  domain: string;
  pluug_form_url: string;
  company_name: string;
  ceo_name: string;
  business_registration_number: string;
  operated_by: string;
  updated_at: string;
};

export type SiteSettingsInsert = Partial<Omit<SiteSettingsRow, 'id'>> & { id?: boolean };

/**
 * supabase-js checks this against its internal `GenericSchema`. Omitting
 * `Views` / `Functions` / `Enums` / `CompositeTypes` / `Relationships` makes
 * the constraint fail silently and every query result collapses to `never`,
 * so the empty members below are load-bearing, not boilerplate.
 */
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: PostRow;
        Insert: PostInsert;
        Update: Partial<PostInsert>;
        Relationships: [];
      };
      builders: {
        Row: BuilderRow;
        Insert: BuilderInsert;
        Update: Partial<BuilderInsert>;
        Relationships: [];
      };
      works: {
        Row: WorkRow;
        Insert: WorkInsert;
        Update: Partial<WorkInsert>;
        Relationships: [];
      };
      admin_accounts: {
        Row: AdminAccountRow;
        Insert: AdminAccountInsert;
        Update: Partial<AdminAccountInsert>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: SiteSettingsInsert;
        Update: Partial<SiteSettingsInsert>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
