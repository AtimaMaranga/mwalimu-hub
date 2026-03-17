import Link from "next/link";
import Image from "next/image";
import { Clock, User, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types";
import { formatDate, truncate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

/** Brand placeholder shown when a post has no featured image */
function ImagePlaceholder() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex items-center justify-center">
      <div className="text-center px-6 select-none">
        <img src="/logo.png" alt="Swahili Tutors" className="h-16 w-16 rounded-xl object-cover mx-auto opacity-40" />
        <p className="text-white/25 text-xs font-medium uppercase tracking-[0.2em] mt-3">
          Swahili Tutors
        </p>
      </div>
    </div>
  );
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const date = post.published_at ? formatDate(post.published_at) : formatDate(post.created_at);

  if (featured) {
    return (
      <article className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden grid md:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 md:h-auto overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          {post.category && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-white/95 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                {post.author}
              </span>
              <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
              <span>{date}</span>
              {post.read_time && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {post.read_time} min read
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-indigo-700 transition-colors duration-200">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group/link"
          >
            Read article
            <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 shrink-0 overflow-hidden">
        {post.featured_image_url ? (
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        {post.category && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {post.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <span>{date}</span>
          {post.read_time && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {post.read_time} min read
              </span>
            </>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
            {truncate(post.excerpt, 150)}
          </p>
        )}

        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group/link"
          aria-label={`Read article: ${post.title}`}
        >
          Read article
          <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
