import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import BlogCard from "@/components/sections/BlogCard";
import Badge from "@/components/ui/Badge";
import {
  getBlogPostBySlug,
  getBlogPostSlugs,
  getRelatedPosts,
} from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import JsonLd from "@/components/seo/JsonLd";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimuwangu.com";

export async function generateStaticParams() {
  const posts = await getBlogPostSlugs();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image_url ? [{ url: post.featured_image_url, alt: post.title }] : ["/og-image.png"],
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: [post.author],
      siteName: "Mwalimu Wangu",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : ["/og-image.png"],
    },
  };
}

/** Simple markdown-to-HTML renderer (no external dep needed for MVP) */
function renderContent(raw: string): string {
  return raw
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^---$/gm, "<hr/>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, post.category, 3);

  const date = post.published_at
    ? formatDate(post.published_at)
    : formatDate(post.created_at);

  const shareUrl = encodeURIComponent(`${BASE}/blog/${post.slug}`);
  const shareTitle = encodeURIComponent(post.title);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    ...(post.featured_image_url && { image: post.featured_image_url }),
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Mwalimu Wangu",
      url: BASE,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/og-image.png`,
      },
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE}/blog/${post.slug}`,
    },
    ...(post.tags && post.tags.length > 0 && { keywords: post.tags.join(", ") }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE}/blog/${post.slug}` },
    ],
  };

  return (
    <PageWrapper>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-700 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Blog
        </Link>

        {post.category && (
          <div className="mb-4">
            <Badge variant="primary">{post.category}</Badge>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" aria-hidden="true" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <time dateTime={post.published_at || post.created_at}>{date}</time>
          </span>
          {post.read_time && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.read_time} min read
            </span>
          )}
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-md">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-3">
            Share this article
          </p>
          <div className="flex gap-3">
            {[
              {
                label: "Share on Twitter",
                href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
                Icon: Twitter,
                color: "hover:bg-sky-100 hover:text-sky-600",
              },
              {
                label: "Share on Facebook",
                href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
                Icon: Facebook,
                color: "hover:bg-blue-100 hover:text-blue-700",
              },
              {
                label: "Share on LinkedIn",
                href: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`,
                Icon: Linkedin,
                color: "hover:bg-blue-100 hover:text-blue-800",
              },
            ].map(({ label, href, Icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors ${color}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Author bio */}
        <div className="mt-8 p-6 bg-indigo-50 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{post.author}</p>
              <p className="text-xs text-slate-500">
                Mwalimu Wangu Contributor
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            A Swahili language expert and educator sharing knowledge to help
            learners around the world connect with East African culture and
            language.
          </p>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-100"
        >
          <h2
            id="related-heading"
            className="text-2xl font-bold font-heading text-slate-900 mb-8"
          >
            Related Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
