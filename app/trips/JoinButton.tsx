"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinPublicGroup } from "@/app/actions/group";
import toast from "react-hot-toast";

export function JoinButton({ groupId, isLoggedIn, isStarted }: { groupId: string, isLoggedIn: boolean, isStarted?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    if (!isLoggedIn) {
      toast.error("Please login to join a trip");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await joinPublicGroup(groupId);
      if (res.success) {
        toast.success("Successfully joined the trip!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to join trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={loading || isStarted}
      className={`w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-70 ${isStarted ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
    >
      {isStarted ? "Trip Started" : (loading ? "Joining..." : "Join Trip")}
    </button>
  );
}
