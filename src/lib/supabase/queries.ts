import { createClient, createStaticClient } from "./server";
import type { Teacher, BlogPost, Review } from "@/types";

/** Returns true only when real Supabase credentials are present */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.startsWith("https://") &&
    !url.includes("your-project") &&
    key.length > 20 &&
    !key.includes("your-anon-key")
  );
}

// ─── Teachers ──────────────────────────────────────────────────────────────

/** Fetch all published teachers */
export async function getTeachers(): Promise<Teacher[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getTeachers error:", error.message);
      return [];
    }
    return data as Teacher[];
  } catch (err) {
    console.error("getTeachers error:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Fetch a single teacher by slug */
export async function getTeacherBySlug(slug: string): Promise<Teacher | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error("getTeacherBySlug error:", error.message);
      return null;
    }
    return data as Teacher;
  } catch (err) {
    console.error("getTeacherBySlug error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Fetch featured teachers (first 4 published) */
export async function getFeaturedTeachers(): Promise<Teacher[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .limit(4);

    if (error) {
      console.error("getFeaturedTeachers error:", error.message);
      return [];
    }
    return data as Teacher[];
  } catch (err) {
    console.error("getFeaturedTeachers error:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── Blog Posts ────────────────────────────────────────────────────────────

/** Fetch all published blog posts */
export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("getBlogPosts error:", error.message);
      return [];
    }
    return data as BlogPost[];
  } catch (err) {
    console.error("getBlogPosts error:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Fetch a single blog post by slug */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error("getBlogPostBySlug error:", error.message);
      return null;
    }
    return data as BlogPost;
  } catch (err) {
    console.error("getBlogPostBySlug error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Fetch related posts by category */
export async function getRelatedPosts(
  currentSlug: string,
  category: string | undefined,
  limit = 3
): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .neq("slug", currentSlug)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getRelatedPosts error:", error.message);
      return [];
    }
    return data as BlogPost[];
  } catch (err) {
    console.error("getRelatedPosts error:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── Reviews ───────────────────────────────────────────────────────────────

/** Fetch approved reviews for a teacher */
export async function getTeacherReviews(teacherId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getTeacherReviews error:", error.message);
      return [];
    }
    return data as Review[];
  } catch (err) {
    console.error("getTeacherReviews error:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── Static-generation helpers (no cookies / request scope) ────────────────

/** Fetch all published teacher slugs — safe to call in generateStaticParams */
export async function getTeacherSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("slug, updated_at")
    .eq("is_published", true);
  if (error) {
    console.error("getTeacherSlugs error:", error.message);
    return [];
  }
  return (data ?? []) as { slug: string; updated_at: string }[];
}

/** Fetch all published blog post slugs — safe to call in generateStaticParams */
export async function getBlogPostSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);
  if (error) {
    console.error("getBlogPostSlugs error:", error.message);
    return [];
  }
  return (data ?? []) as { slug: string; updated_at: string }[];
}
