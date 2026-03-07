"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { slugify, estimateReadTime } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(5, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().min(100, "Content must be at least 100 characters"),
  featured_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  author: z.string().min(2, "Author name required"),
  category: z.string().optional(),
  tags: z.string().optional(),
  is_published: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      author: "Mwalimu Wangu Team",
      is_published: false,
    },
  });

  const content = watch("content", "");
  const readTime = estimateReadTime(content);

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      const supabase = createClient();
      const slug =
        slugify(data.title) + "-" + Math.random().toString(36).slice(2, 6);

      const tags = data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [];

      const { error } = await supabase.from("blog_posts").insert({
        slug,
        title: data.title,
        excerpt: data.excerpt || null,
        content: data.content,
        featured_image_url: data.featured_image_url || null,
        author: data.author,
        category: data.category || null,
        tags,
        read_time: readTime,
        is_published: data.is_published ?? false,
        published_at: data.is_published ? new Date().toISOString() : null,
      });

      if (error) throw new Error(error.message);
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to create post"
      );
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-heading text-slate-900">
          New Blog Post
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Main fields */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Post Details</h2>

          <div>
            <label htmlFor="title" className={labelClass}>
              Title *
            </label>
            <input
              id="title"
              {...register("title")}
              className={inputClass}
              placeholder="10 Swahili Phrases Every Beginner Should Know"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Excerpt (shown in post lists)
            </label>
            <textarea
              id="excerpt"
              {...register("excerpt")}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="A brief summary shown in blog cards and SEO descriptions..."
            />
          </div>

          <div>
            <label htmlFor="content" className={labelClass}>
              Content * — Supports Markdown{" "}
              <span className="text-slate-400 font-normal">
                ({readTime} min read)
              </span>
            </label>
            <textarea
              id="content"
              {...register("content")}
              rows={20}
              className={`${inputClass} resize-y font-mono text-xs`}
              placeholder="## Introduction&#10;&#10;Write your article here using Markdown...&#10;&#10;## Section 1&#10;&#10;Your content..."
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">
                {errors.content.message}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Use ## for headings, **bold**, *italic*, and --- for dividers.
            </p>
          </div>
        </section>

        {/* Meta */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Meta & Media</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="author" className={labelClass}>
                Author *
              </label>
              <input
                id="author"
                {...register("author")}
                className={inputClass}
                placeholder="Amina Odhiambo"
              />
              {errors.author && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.author.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <input
                id="category"
                {...register("category")}
                className={inputClass}
                placeholder="Beginner Tips"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className={labelClass}>
              Tags{" "}
              <span className="text-slate-400 font-normal">
                (comma-separated)
              </span>
            </label>
            <input
              id="tags"
              {...register("tags")}
              className={inputClass}
              placeholder="beginner, phrases, vocabulary"
            />
          </div>

          <div>
            <label htmlFor="featured_image_url" className={labelClass}>
              Featured Image URL
            </label>
            <input
              id="featured_image_url"
              {...register("featured_image_url")}
              className={inputClass}
              placeholder="https://images.unsplash.com/photo-..."
            />
            {errors.featured_image_url && (
              <p className="text-xs text-red-500 mt-1">
                {errors.featured_image_url.message}
              </p>
            )}
          </div>
        </section>

        {/* Publishing */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Publishing</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("is_published")}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              Publish immediately (visible on the website)
            </span>
          </label>
          <p className="text-xs text-slate-400 mt-2 ml-7">
            Leave unchecked to save as a draft.
          </p>
        </section>

        {serverError && (
          <div
            className="rounded-xl bg-red-50 border border-red-200 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/blog">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Post
          </Button>
        </div>
      </form>
    </div>
  );
}
