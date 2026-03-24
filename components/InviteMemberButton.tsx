"use client";
import { useState } from "react";
import { sendInvite } from "@/app/actions/group";
import toast from "react-hot-toast";
import { UserPlus, X } from "lucide-react";

export function InviteMemberButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      const res = await sendInvite(groupId, email.trim());
      if (res.success) {
        toast.success("Invite sent successfully!");
        setOpen(false);
        setEmail("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors"
      >
        <UserPlus size={16} /> Invite
      </button>

      {open && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invite to Trip</h2>
            <p className="text-slate-500 text-sm mb-6">Enter a user's email address to send them an invite to this trip. Only admins can invite new members.</p>
            
            <form onSubmit={handleInvite} className="flex gap-2">
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="User's email address..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-70 transition-colors"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
