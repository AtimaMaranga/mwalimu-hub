import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Teacher } from "@/types";

export default async function AdminTeachersPage() {
  const supabase = await createAdminClient();
  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Teachers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {teachers?.length ?? 0} teachers total
          </p>
        </div>
        <Link href="/admin/teachers/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Teacher
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {!teachers || teachers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg font-medium text-slate-500 mb-2">
              No teachers yet
            </p>
            <p className="text-sm mb-6">
              Add your first teacher to get started.
            </p>
            <Link href="/admin/teachers/new">
              <Button variant="primary">Add First Teacher</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  {[
                    "Teacher",
                    "Specialisations",
                    "Rate",
                    "Rating",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(teachers as Teacher[]).map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Teacher */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {teacher.profile_image_url ? (
                          <Image
                            src={teacher.profile_image_url}
                            alt={teacher.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover w-10 h-10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {getInitials(teacher.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Specialisations */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(teacher.specializations ?? [])
                          .slice(0, 2)
                          .map((s) => (
                            <Badge key={s} variant="primary">
                              {s}
                            </Badge>
                          ))}
                        {(teacher.specializations ?? []).length > 2 && (
                          <Badge variant="default">
                            +{(teacher.specializations ?? []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="px-5 py-4 text-slate-700">
                      {teacher.hourly_rate
                        ? formatCurrency(teacher.hourly_rate)
                        : "—"}
                      /hr
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-4 text-slate-700">
                      {teacher.rating > 0
                        ? `${teacher.rating.toFixed(1)} ★`
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.is_published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {teacher.is_published ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teachers/${teacher.slug}`}
                          target="_blank"
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/teachers/${teacher.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          aria-label={`Edit ${teacher.name}`}
                        >
                          <Edit className="h-4 w-4" />
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
