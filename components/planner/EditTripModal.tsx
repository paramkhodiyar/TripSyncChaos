"use client";
import { useState } from "react";
import { Edit2, X } from "lucide-react";
import toast from "react-hot-toast";
import { updateTripAdminSettings } from "@/app/actions/group";
import { useRouter } from "next/navigation";

export function EditTripModal({ groupId, initialData }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    destination: initialData?.destination || "",
    dates: initialData?.dates || "",
    budget: initialData?.budget || "",
    maxMembers: initialData?.maxMembers || "",
    isArchived: initialData?.isArchived || false,
    isStarted: initialData?.isStarted || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTripAdminSettings(groupId, {
        destination: formData.destination,
        dates: formData.dates,
        budget: formData.budget,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers.toString()) : null,
        isArchived: formData.isArchived,
        isStarted: formData.isStarted
      });
      toast.success("Trip updated!");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-full transition-colors">
        <Edit2 size={16} /> Edit Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Trip Metadata</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 p-2 rounded-full transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Destination</label>
                <input 
                  type="text" 
                  value={formData.destination} 
                  onChange={e => setFormData({ ...formData, destination: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none text-sm transition-colors" 
                  placeholder="e.g. Kyoto, Japan"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Dates</label>
                <input 
                  type="text" 
                  value={formData.dates} 
                  onChange={e => setFormData({ ...formData, dates: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none text-sm transition-colors" 
                  placeholder="e.g. Oct 12 - Oct 20"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Budget</label>
                  <input 
                    type="text" 
                    value={formData.budget} 
                    onChange={e => setFormData({ ...formData, budget: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none text-sm transition-colors" 
                    placeholder="e.g. ₹15,000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Max People</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.maxMembers} 
                    onChange={e => setFormData({ ...formData, maxMembers: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none text-sm transition-colors" 
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {/* Mark as Started Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl mt-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">Trip Ongoing</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight pr-4">Once started, no more people can join the public trip.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => setFormData({...formData, isStarted: !formData.isStarted})}
                  className={`relative w-10 h-6 shrink-0 rounded-full transition-colors focus:outline-none ${formData.isStarted ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.isStarted ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Archive Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">Archive Trip</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight pr-4">Move to past trips. Preserves memory but hides from dashboard.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => setFormData({...formData, isArchived: !formData.isArchived})}
                  className={`relative w-10 h-6 shrink-0 rounded-full transition-colors focus:outline-none ${formData.isArchived ? "bg-red-500" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.isArchived ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 shadow-sm text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
