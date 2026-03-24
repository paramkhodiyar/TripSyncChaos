import { ChatContainer } from "@/components/chat/ChatContainer";
import { PlannerContainer } from "@/components/planner/PlannerContainer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { InviteMemberButton } from "@/components/InviteMemberButton";
import { EditTripModal } from "@/components/planner/EditTripModal";

export default async function GroupPage({ params }: { params: { id: string } }) {
  // await params before using its properties in Next.js 15+ App Router
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
    isArchived: group.isArchived
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-bold text-slate-900 tracking-tight">{group.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {!group.isArchived && (
            <>
              {isAdmin && <EditTripModal groupId={group.id} initialData={initialData} />}
              <InviteMemberButton groupId={group.id} />
            </>
          )}
          {group.isArchived && (
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200">
              Archived Trip
            </span>
          )}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Chat */}
        <div className="w-1/2 h-full border-r border-slate-100 flex flex-col">
          <ChatContainer 
            groupId={id} 
            initialMessages={group.messages} 
            currentUserId={session.user.id} 
            currentUserName={session.user.name || "User"} 
            isArchived={group.isArchived}
          />
        </div>

        {/* Right Panel: AI Planner & Splits */}
        <div className="w-1/2 h-full overflow-y-auto">
          <PlannerContainer 
            groupId={id} 
            initialTripState={group.tripState} 
            initialNotes={group.notes} 
            initialExpenses={group.expenses}
            members={group.members}
            currentUserId={session.user.id}
            isArchived={group.isArchived}
          />
        </div>
      </div>
    </div>
  );
}
