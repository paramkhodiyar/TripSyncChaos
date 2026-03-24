"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-6 tracking-tight">Welcome Back</h2>
        
        {/* Quick Tester Logins */}
        <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail("rahul@example.com");
                  setPassword("password123");
                }}
                className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">R</div>
                <span className="text-xs font-bold text-slate-700">Rahul</span>
                <span className="text-[10px] text-slate-400">rahul@example.com</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setEmail("priya@example.com");
                  setPassword("password123");
                }}
                className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">P</div>
                <span className="text-xs font-bold text-slate-700">Priya</span>
                <span className="text-[10px] text-slate-400">priya@example.com</span>
              </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all font-medium" 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all font-medium" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link href="/signup" className="font-semibold text-slate-900 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
