import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { MessageSquare, FileText } from "lucide-react";
import ApplicationsClient from "./ApplicationsClient";
import ContactsClient from "./ContactsClient";

export default async function SubmissionsPage() {
  noStore();
  const supabase = await createAdminClient();

  const [{ data: contacts }, { data: applications }] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("teacher_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold font-heading text-slate-900">Submissions</h1>

      {/* Teacher Applications */}
      <section aria-labelledby="applications-heading">
        <h2
          id="applications-heading"
          className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"
        >
          <FileText className="h-5 w-5 text-amber-500" aria-hidden="true" />
          Teacher Applications ({applications?.length ?? 0})
        </h2>
        <ApplicationsClient applications={applications ?? []} />
      </section>

      {/* Contact Submissions */}
      <section aria-labelledby="contacts-heading">
        <h2
          id="contacts-heading"
          className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"
        >
          <MessageSquare className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          Contact Form Submissions ({contacts?.length ?? 0})
        </h2>
        <ContactsClient contacts={contacts ?? []} />
      </section>
    </div>
  );
}
