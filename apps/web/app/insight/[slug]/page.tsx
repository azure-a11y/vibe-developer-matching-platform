import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPostingJsonLd, faqJsonLd, getRepository, postUrl } from '@orca/content';

import { formatDate, renderMarkdown } from '@/lib/markdown';
import { absoluteUrl, twitterSite } from '@/lib/site';

import FaqToc from './FaqToc';
import InsightDetailTrack from './track';
import { CATEGORY_LABEL } from '../view';
import './insight-detail.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getRepository().getPublished();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getRepository().getBySlug(decodeURIComponent(slug));
  if (!post) return {};

  const { seo, geo } = post;
  const title = seo.title ?? post.title;
  const description = seo.description ?? post.description;
  const image = seo.ogImage ?? post.cover?.src;
  const absoluteImage = image ? absoluteUrl(image) : undefined;

  // Extra robots directives (max-snippet, max-image-preview, …) control how
  // much an answer engine may quote — a direct GEO lever.
  const extraDirectives = Object.fromEntries(
    seo.robotsDirectives
      .map((directive) => directive.split(':'))
      .filter((parts): parts is [string, string] => parts.length === 2)
      .map(([key, value]) => [key.trim(), value.trim()]),
  );

  return {
    title,
    description,
    keywords: seo.keywords,
    authors: [{ name: post.author }],
    category: post.category,
    alternates: {
      canonical: seo.canonical ?? postUrl(post.slug),
      ...(seo.alternates.length > 0
        ? {
            languages: Object.fromEntries(
              seo.alternates.map((alternate) => [alternate.hreflang, alternate.href]),
            ),
          }
        : {}),
    },
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
      googleBot: {
        index: !seo.noindex,
        follow: !seo.nofollow,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        ...extraDirectives,
      },
    },
    openGraph: {
      type: seo.ogType,
      title: seo.ogTitle ?? title,
      description: seo.ogDescription ?? description,
      url: postUrl(post.slug),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      section: post.category,
      locale: geo.locale.replace('-', '_'),
      ...(absoluteImage ? { images: [{ url: absoluteImage, alt: post.cover?.alt ?? title }] } : {}),
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.ogTitle ?? title,
      description: seo.ogDescription ?? description,
      ...(seo.twitterSite ?? twitterSite ? { site: seo.twitterSite ?? twitterSite } : {}),
      ...(seo.twitterCreator ? { creator: seo.twitterCreator } : {}),
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getRepository().getBySlug(decodeURIComponent(slug));

  // Drafts and in-review posts are invisible to the public site.
  if (!post || post.status !== 'published') notFound();

  const faq = faqJsonLd(post);
  const categoryLabel = CATEGORY_LABEL[post.category] ?? post.category;

  return (
    <main id="main">
      <script
        type="application/ld+json"
        // JSON-LD is generated from validated frontmatter, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd(post)) }}
      />
      {faq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      )}
      <InsightDetailTrack slug={post.slug} category={post.category} />

      <div className="wrap art-head">
        <Link className="backlink" href="/insight">인사이트 목록으로</Link>
        <h1>{post.title}</h1>
        <p className="meta">
          {categoryLabel} · <b>{post.author}</b> ·{' '}
          <time dateTime={post.publishedAt ?? post.createdAt}>{formatDate(post.publishedAt, post.geo.locale)}</time> · 읽는 데 {post.readingTimeMinutes}분
        </p>
      </div>

      <div className="wrap art-body">
        <article className="art">
          {post.cover ? (
            <img className="ph ph--tall" src={post.cover.src} alt={post.cover.alt} style={{ width: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="ph ph--tall" data-label="Cover Image"><span className="fx">{post.slug} / COVER</span></div>
          )}

          <p>{post.description}</p>

          {post.geo.answerSummary && (
            <blockquote>{post.geo.answerSummary}</blockquote>
          )}

          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />

          {post.tags.length > 0 && (
            <div className="tags">
              {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
          )}
        </article>

        <FaqToc items={post.geo.faq} />
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 776 }}>
          <div className="cta-banner" style={{ marginTop: 52 }}>
            <div>
              <h3>글이 도움되셨나요?</h3>
              <p>프로젝트 이야기를 들려주세요.</p>
            </div>
            <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="insight_detail">문의하기 <span className="arr">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
