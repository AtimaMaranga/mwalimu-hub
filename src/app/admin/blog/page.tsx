import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { BlogPost } from "@/types";

export default async function AdminBlogPage() {
  const supabase = await createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Blog Posts
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {posts?.length ?? 0} posts total
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {!posts || posts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg font-medium text-slate-500 mb-2">
              No posts yet
            </p>
            <p className="text-sm mb-6">Write your first blog post.</p>
            <Link href="/admin/blog/new">
              <Button variant="primary">Write First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  {["Title", "Author", "Category", "Date", "Status", "Actions"].map(
                    (h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(posts as BlogPost[]).map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        /{post.slug}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{post.author}</td>
                    <td className="px-5 py-4">
                      {post.category ? (
                        <Badge variant="primary">{post.category}</Badge>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {post.published_at
                        ? formatDate(post.published_at)
                        : formatDate(post.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.is_published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {post.is_published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
