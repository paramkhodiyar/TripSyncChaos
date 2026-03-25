import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProfileClient } from "@/components/profile/ProfileClient";
import Link from "next/link";
import { ChevronRight, ArchiveRestore, Archive } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, archivedGroups] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, bio: true, profilePic: true }
    }),
    prisma.groupMember.findMany({
      where: { userId: session.user.id, group: { isArchived: true } },
      include: {
        group: { include: { _count: { select: { members: true } } } }
      },
      orderBy: { group: { createdAt: "desc" } }
    })
  ]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <ProfileClient 
        initialName={user.name} 
        initialEmail={user.email} 
        initialBio={user.bio} 
        initialProfilePic={user.profilePic} 
      />

      <div className="max-w-md w-full mt-14">
        <div className="flex items-center justify-between mb-8 px-2 border-b border-slate-200 pb-4">
          <h3 className="flex items-center gap-2 font-black text-slate-900 tracking-tight text-xl uppercase tracking-widest"><Archive size={18} className="text-slate-400" /> Past Memories</h3>
          <span className="text-xs font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{archivedGroups.length}</span>
        </div>
        
        {archivedGroups.length === 0 ? (
          <div className="p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-2">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-2">
                <Archive size={20} className="text-slate-200" />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">No archived trips yet</p>
             <Link href="/dashboard" className="text-xs font-black text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-[0.1em]">Explore Active Trips</Link>
          </div>
        ) : (
          <div className="space-y-4">
             {archivedGroups.map(gm => (
                <Link key={gm.groupId} href={`/group/${gm.groupId}`} className="group flex flex-col gap-3 bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl transition-all grayscale opacity-70 hover:grayscale-0 hover:opacity-100 relative overflow-hidden active:scale-95 duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <ArchiveRestore size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all mt-0.5 group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 truncate leading-tight tracking-tight text-lg">{gm.group.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black flex items-center gap-2 group-hover:text-indigo-400">
                      <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-indigo-300 transition-colors" /> Archived Memory
                    </p>
                  </div>
                </Link>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
