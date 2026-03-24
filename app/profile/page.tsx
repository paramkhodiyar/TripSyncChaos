import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProfileClient } from "@/components/profile/ProfileClient";
import Link from "next/link";
import { ChevronRight, ArchiveRestore, Archive } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const archivedGroups = await prisma.groupMember.findMany({
    where: { userId: session.user.id, group: { isArchived: true } },
    include: {
      group: { include: { _count: { select: { members: true } } } }
    },
    orderBy: { group: { createdAt: "desc" } }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ProfileClient initialName={session.user.name} initialEmail={session.user.email} />

      <div className="max-w-md w-full mt-10">
        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5"><Archive size={18} /> Archived Trips</h3>
        {archivedGroups.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
             <p className="text-sm font-medium text-slate-500">No archived trips found.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {archivedGroups.map(gm => (
                <Link key={gm.groupId} href={`/group/${gm.groupId}`} className="group flex flex-col gap-3 bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all grayscale opacity-70 hover:grayscale-0 hover:opacity-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <ArchiveRestore size={14} className="text-slate-500" />
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate leading-tight">{gm.group.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Archived Memory</p>
                  </div>
                </Link>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
