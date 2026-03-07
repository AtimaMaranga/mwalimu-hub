import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import { MessageCircle, Search, LogOut, Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "teacher") redirect("/dashboard/teacher");

  // Fetch this student's inquiries
  const { data: inquiries } = await supabase
    .from("student_inquiries")
    .select("*, teachers(name, slug, profile_image_url, specializations)")
    .eq("student_email", user.email!)
    .order("created_at", { ascending: false })
    .limit(10);

  const name = profile?.full_name || user.email?.split("@")[0] || "Student";
  const initials = getInitials(name);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-0.5">
                  Student Dashboard
                </p>
                <h1 className="text-2xl font-bold font-heading text-slate-900">
                  Habari, {name.split(" ")[0]}!
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Link href="/teachers" className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Search className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Find a Teacher</p>
                  <p className="text-sm text-slate-500">Browse all native Swahili teachers</p>
                </div>
              </div>
            </Link>

            <Link href="/how-it-works" className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">How It Works</p>
                  <p className="text-sm text-slate-500">Learn about the lesson process</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Inquiries */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Your Inquiries</h2>
                {inquiries && inquiries.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {inquiries.length}
                  </span>
                )}
              </div>
            </div>

            {!inquiries || inquiries.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <MessageCircle className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-medium text-slate-600 mb-1">No inquiries yet</p>
                <p className="text-sm text-slate-400 mb-5">
                  Browse our teachers and send your first inquiry.
                </p>
                <Link href="/teachers">
                  <Button variant="primary" size="sm">Browse Teachers</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {inquiries.map((inq: any) => (
                  <div key={inq.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                        {getInitials((inq.teachers as any)?.name ?? "T")}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {(inq.teachers as any)?.name ?? "Teacher"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {inq.message || "No message"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">
                        {inq.experience_level || "Not set"}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(inq.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
