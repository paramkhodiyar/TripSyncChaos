import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { InviteMemberButton } from "@/components/InviteMemberButton";
import { EditTripModal } from "@/components/planner/EditTripModal";
import { GroupClientLayout } from "./GroupClientLayout";

export default async function GroupPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;



  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      expenses: { include: { paidBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      tripState: true,
      messages: {
        include: { sender: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      },
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!group) return <div className="p-10 text-center font-bold text-2xl text-slate-500">Group not found</div>;

  const currentMember = group.members.find(m => m.userId === session.user!.id);
  const isAdmin = currentMember?.role === "admin";
  const initialData = {
    destination: group.tripState?.destination,
    dates: group.tripState?.dates,
    budget: group.tripState?.budget,
    maxMembers: group.maxMembers,
    isArchived: group.isArchived,
    isStarted: group.isStarted
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 sm:py-6 border-b border-slate-100 bg-white z-20 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all active:scale-90">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-900 tracking-tight text-lg line-clamp-1">{group.name}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.isPublic ? "Public Group" : "Private Session"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {!group.isArchived && (
            <>
              {isAdmin && <EditTripModal groupId={group.id} initialData={initialData} />}
              <InviteMemberButton groupId={group.id} />
            </>
          )}
          {group.isArchived && (
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200 shrink-0">
              Archived Trip
            </span>
          )}
        </div>
      </header>

      <GroupClientLayout id={id} group={group} session={session} />
    </div>
  );
}
