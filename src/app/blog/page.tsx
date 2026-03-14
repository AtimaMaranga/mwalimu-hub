import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import BlogCard from "@/components/sections/BlogCard";
import { getBlogPosts } from "@/lib/supabase/queries";
import { BookOpen } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Swahili Learning Blog — Tips, Guides & Stories",
  description:
    "Explore Swahili language learning tips, beginner guides, cultural insights, and advice from native teachers on the Swahili Tutors blog.",
  alternates: { canonical: `${BASE}/blog` },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            Swahili Learning Blog
          </h1>
          <p className="text-indigo-100 text-lg">
            Tips, guides, and stories to fuel your Swahili journey — written by native speakers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-40" aria-hidden="true" />
            <p className="text-lg font-medium text-slate-500">Articles coming soon!</p>
            <p className="text-sm mt-1">
              Our teachers are writing great content for you.
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <section aria-labelledby="featured-heading" className="mb-16">
                <h2
                  id="featured-heading"
                  className="text-xl font-bold text-slate-900 mb-6"
                >
                  Featured Article
                </h2>
                <BlogCard post={featured} featured />
              </section>
            )}

            {rest.length > 0 && (
              <section aria-labelledby="latest-heading">
                <h2
                  id="latest-heading"
                  className="text-xl font-bold text-slate-900 mb-6"
                >
                  Latest Articles
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
