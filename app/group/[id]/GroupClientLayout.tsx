"use client";
import { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { PlannerContainer } from "@/components/planner/PlannerContainer";
import { MessageSquare, Layout } from "lucide-react";

export function GroupClientLayout({ 
  id, 
  group, 
  session 
}: { 
  id: string, 
  group: any, 
  session: any 
}) {
  const [activeTab, setActiveTab] = useState<"chat" | "planner">("chat");

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-slate-100 bg-white">
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all ${activeTab === "chat" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400"}`}
        >
          <MessageSquare size={16} /> Chat
        </button>
        <button 
          onClick={() => setActiveTab("planner")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all ${activeTab === "planner" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400"}`}
        >
          <Layout size={16} /> Planner
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Chat */}
        <div className={`h-full border-r border-slate-100 flex flex-col transition-all duration-300 ${activeTab === "chat" ? "w-full lg:w-1/2" : "hidden lg:flex lg:w-1/2"}`}>
          <ChatContainer 
            groupId={id} 
            initialMessages={group.messages} 
            currentUserId={session.user.id} 
            currentUserName={session.user.name || "User"} 
            isArchived={group.isArchived}
          />
        </div>

        {/* Right Panel: AI Planner & Splits */}
        <div className={`h-full overflow-y-auto transition-all duration-300 ${activeTab === "planner" ? "w-full lg:w-1/2" : "hidden lg:flex lg:w-1/2"}`}>
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
