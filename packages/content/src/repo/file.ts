import {
  deleteAdminAccount,
  getAdminAccountByEmail,
  getAdminAccountBySlug,
  getAllAdminAccounts,
  writeAdminAccount,
} from '../admin-accounts.ts';
import {
  deleteBuilder,
  getActiveBuilders,
  getAllBuilders,
  getBuilderBySlug,
  writeBuilder,
} from '../builders.ts';
import {
  deleteFaqCategory,
  getActiveFaqCategories,
  getAllFaqCategories,
  getFaqCategoryBySlug,
  writeFaqCategory,
} from '../faq-categories.ts';
import { deleteFaq, getAllFaqs, getFaqBySlug, getPublishedFaqs, writeFaq } from '../faq.ts';
import { deleteVideo, getAllVideos, getVideoBySlug, writeVideo } from '../videos.ts';
import {
  deletePost,
  getAllPosts,
  getPostBySlug,
  getPublishedPosts,
  writePost,
} from '../posts.ts';
import type {
  AdminAccountFrontmatterInput,
  BuilderFrontmatterInput,
  FaqCategoryFrontmatterInput,
  FaqFrontmatterInput,
  PostFrontmatterInput,
  SiteSettingsFrontmatterInput,
  VideoFrontmatterInput,
  WorkFrontmatterInput,
} from '../schema.ts';
import { getSiteSettings, writeSiteSettings } from '../site-settings.ts';
import { deleteWork, getAllWorks, getPublishedWorks, getWorkBySlug, writeWork } from '../works.ts';
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
 * Markdown-on-disk driver. The default, and the one the template ships with.
 *
 * Everything is synchronous underneath; the async surface exists so the
 * Supabase driver can be swapped in without touching call sites.
 */
export const fileRepository: ContentRepository = {
  driver: 'file',

  async getAll() {
    return getAllPosts();
  },

  async getPublished() {
    return getPublishedPosts();
  },

  async getBySlug(slug: string) {
    return getPostBySlug(slug);
  },

  async getOwnedByBuilder(builderId: string) {
    return getAllPosts().posts.filter((post) => post.ownerBuilderId === builderId);
  },

  async save(frontmatter: PostFrontmatterInput, body: string) {
    writePost(frontmatter, body);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deletePost(slug);
  },
};

export const builderFileRepository: BuilderRepository = {
  driver: 'file',

  async getAll() {
    return getAllBuilders();
  },

  async getActive() {
    return getActiveBuilders();
  },

  async getBySlug(slug: string) {
    return getBuilderBySlug(slug);
  },

  async getById(_id: string) {
    return null;
  },

  async save(frontmatter: BuilderFrontmatterInput, bio: string) {
    writeBuilder(frontmatter, bio);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteBuilder(slug);
  },
};

export const workFileRepository: WorkRepository = {
  driver: 'file',

  async getAll() {
    return getAllWorks();
  },

  async getPublished() {
    return getPublishedWorks();
  },

  async getBySlug(slug: string) {
    return getWorkBySlug(slug);
  },

  async getOwnedByBuilder(builderId: string) {
    return getAllWorks().works.filter((work) => work.ownerBuilderId === builderId);
  },

  async save(frontmatter: WorkFrontmatterInput) {
    writeWork(frontmatter);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteWork(slug);
  },
};

export const faqCategoryFileRepository: FaqCategoryRepository = {
  driver: 'file',

  async getAll() {
    return getAllFaqCategories();
  },

  async getActive() {
    return getActiveFaqCategories();
  },

  async getBySlug(slug: string) {
    return getFaqCategoryBySlug(slug);
  },

  async save(frontmatter: FaqCategoryFrontmatterInput) {
    writeFaqCategory(frontmatter);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteFaqCategory(slug);
  },
};

export const faqFileRepository: FaqRepository = {
  driver: 'file',

  async getAll() {
    return getAllFaqs();
  },

  async getPublished() {
    return getPublishedFaqs();
  },

  async getBySlug(slug: string) {
    return getFaqBySlug(slug);
  },

  async save(frontmatter: FaqFrontmatterInput, answer: string) {
    writeFaq(frontmatter, answer);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteFaq(slug);
  },
};

export const videoFileRepository: VideoRepository = {
  driver: 'file',

  async getAll() {
    return getAllVideos();
  },

  async getBySlug(slug: string) {
    return getVideoBySlug(slug);
  },

  async save(frontmatter: VideoFrontmatterInput) {
    writeVideo(frontmatter);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteVideo(slug);
  },
};

export const adminAccountFileRepository: AdminAccountRepository = {
  driver: 'file',

  async getAll() {
    return getAllAdminAccounts();
  },

  async getBySlug(slug: string) {
    return getAdminAccountBySlug(slug);
  },

  async getByEmail(email: string) {
    return getAdminAccountByEmail(email);
  },

  async save(frontmatter: AdminAccountFrontmatterInput) {
    writeAdminAccount(frontmatter);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteAdminAccount(slug);
  },
};

export const siteSettingsFileRepository: SiteSettingsRepository = {
  driver: 'file',

  async get() {
    return getSiteSettings();
  },

  async save(frontmatter: SiteSettingsFrontmatterInput) {
    writeSiteSettings(frontmatter);
  },
};
