"use client";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

export function ProfileClient({ initialName, initialEmail }: any) {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [name, setName] = useState(initialName || "");

  const handleUpload = (result: any) => {
    if (result.info && typeof result.info === "object" && result.info.secure_url) {
      setProfilePic(result.info.secure_url);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-3xl font-semibold text-slate-900 mb-8 text-center tracking-tight">Your Profile</h2>
      
      <div className="flex flex-col items-center mb-8">
        <div className="h-28 w-28 rounded-full overflow-hidden bg-slate-100 mb-4 border border-slate-200 relative">
          {profilePic ? (
            <Image src={profilePic} alt="Profile" fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
          )}
        </div>
        
        <CldUploadWidget uploadPreset="tripsync_users" onSuccess={handleUpload}>
          {({ open }) => (
            <button 
              type="button"
              onClick={() => open()}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 px-4 py-2 rounded-full"
            >
              Upload avatar
            </button>
          )}
        </CldUploadWidget>
      </div>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-800 transition-all font-medium" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            value={initialEmail || "john.doe@example.com"}
            disabled
            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl text-slate-500 font-medium cursor-not-allowed" 
          />
          <p className="text-xs text-slate-400 mt-2">Email is safely managed by auth provider.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Traveler Bio</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us about your travel style..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-800 transition-all font-medium resize-none" 
          ></textarea>
        </div>

        <button 
          type="button"
          className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
