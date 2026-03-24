"use client";
import { useState } from "react";
import { respondToInvite } from "@/app/actions/group";
import toast from "react-hot-toast";

export function InviteCard({ invite }: { invite: any }) {
  const [loading, setLoading] = useState(false);

  async function handleResponse(accept: boolean) {
    setLoading(true);
    try {
      const res = await respondToInvite(invite.id, accept);
      if (res.success) toast.success(accept ? "Invite accepted!" : "Invite declined");
    } catch (err: any) {
      toast.error(err.message || "Failed to process invite");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-5 text-sm text-center text-slate-500">Processing...</div>;

  return (
    <div className="p-5">
      <p className="text-sm text-slate-900 font-medium whitespace-pre-wrap">
        <span className="font-bold">{invite.sender?.name || "Someone"}</span> invited you to <span className="font-bold">{invite.group.name}</span>
      </p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => handleResponse(true)} className="flex-1 bg-slate-900 text-white text-sm font-medium py-2 rounded-xl hover:bg-slate-800 transition-colors">
          Accept
        </button>
        <button onClick={() => handleResponse(false)} className="flex-1 bg-slate-100 text-slate-700 text-sm font-medium py-2 rounded-xl hover:bg-slate-200 transition-colors">
          Decline
        </button>
      </div>
    </div>
  );
}
