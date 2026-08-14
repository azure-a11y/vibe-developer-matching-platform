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
  deletePost,
  getAllPosts,
  getPostBySlug,
  getPublishedPosts,
  writePost,
} from '../posts.ts';
import type {
  AdminAccountFrontmatterInput,
  BuilderFrontmatterInput,
  PostFrontmatterInput,
  WorkFrontmatterInput,
} from '../schema.ts';
import { deleteWork, getAllWorks, getPublishedWorks, getWorkBySlug, writeWork } from '../works.ts';
import type { AdminAccountRepository, BuilderRepository, ContentRepository, WorkRepository } from './types.ts';

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

  async save(frontmatter: WorkFrontmatterInput) {
    writeWork(frontmatter);
    return frontmatter.slug;
  },

  async remove(slug: string) {
    return deleteWork(slug);
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
