"use client";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { updateProfile } from "@/app/actions/user";
import toast from "react-hot-toast";
import { Camera, Sparkles, User, Mail, AlignLeft, ShieldCheck } from "lucide-react";

export function ProfileClient({ 
  initialName, 
  initialEmail, 
  initialBio, 
  initialProfilePic 
}: any) {
  const [profilePic, setProfilePic] = useState<string | null>(initialProfilePic || null);
  const [bio, setBio] = useState(initialBio || "");
  const [name, setName] = useState(initialName || "");
  const [loading, setLoading] = useState(false);

  const handleUpload = (result: any) => {
    if (result.info && typeof result.info === "object" && result.info.secure_url) {
      setProfilePic(result.info.secure_url);
      toast.success("Photo uploaded! Click save to apply.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile({ name, bio, profilePic: profilePic || undefined });
      if (res.success) {
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden group">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 -z-10 group-hover:scale-110 transition-transform duration-700" />
      
      <h2 className="text-3xl font-black text-slate-900 mb-1 text-center tracking-tight">Profile Settings</h2>
      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Personalize your journey</p>
      
      <div className="flex flex-col items-center mb-10 relative">
        <div className="h-32 w-32 rounded-full p-1.5 bg-white border border-slate-100 shadow-xl mb-4 relative z-10 group/pic">
          <div className="h-full w-full rounded-full overflow-hidden bg-slate-100 relative">
            {profilePic ? (
              <Image src={profilePic} alt="Profile" fill className="object-cover transition-transform group-hover/pic:scale-110 duration-500" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                <User size={32} strokeWidth={1.5} />
              </div>
            )}
          </div>
          
          <CldUploadWidget uploadPreset="tripsync_users" onSuccess={handleUpload}>
            {({ open }) => (
              <button 
                type="button"
                onClick={() => open()}
                className="absolute bottom-0 right-0 p-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-90 border-4 border-white z-20"
              >
                <Camera size={16} />
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 relative">
        <div>
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            <User size={12} className="text-indigo-400" /> Full Name
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your travel name..."
            className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 transition-all font-bold placeholder:text-slate-300 bg-slate-50/50" 
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            <Mail size={12} className="text-blue-400" /> Verified Email
          </label>
          <div className="relative">
            <input 
              type="email" 
              value={initialEmail || ""}
              disabled
              className="w-full px-5 py-4 border border-slate-100 bg-slate-50 rounded-2xl text-slate-400 font-bold cursor-not-allowed pr-12" 
            />
            <ShieldCheck size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium px-1 uppercase tracking-wide">Managed by your Auth Provider</p>
        </div>

        <div>
           <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            <AlignLeft size={12} className="text-purple-400" /> Traveler Bio
          </label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us about your next dream destination or favorite travel hack..."
            className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 transition-all font-medium resize-none placeholder:text-slate-300 bg-slate-50/50" 
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Syncing..." : (
            <>
              <Sparkles size={18} /> Save Profile Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
