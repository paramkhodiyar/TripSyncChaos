import Link from "next/link";
import { Plane, Search, ChevronLeft, Filter, LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/db";
import { JoinButton } from "./JoinButton";
import { auth } from "@/auth";

export default async function TripsPage({ searchParams }: { searchParams: { query?: string, page?: string, days?: string } }) {
  const session = await auth();
  const searchParamsResolved = await searchParams;
  const query = searchParamsResolved.query || "";
  const days = searchParamsResolved.days ? parseInt(searchParamsResolved.days, 10) : undefined;
  const page = parseInt(searchParamsResolved.page || "1", 10);
  const take = 5;
  const skip = (page - 1) * take;

  const whereClause: any = {
    isPublic: true,
    ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
    ...(days ? { days: { lte: days } } : {})
  };

  const [publicGroups, totalGroups] = await Promise.all([
    prisma.group.findMany({
      where: whereClause,
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip
    }),
    prisma.group.count({
      where: whereClause
    })
  ]);

  const totalPages = Math.ceil(totalGroups / take);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100 py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Plane className="text-slate-900 hidden xs:block" size={20} />
            <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base">Explore Trips</span>
          </div>
        </div>
        {session ? (
          <Link href="/dashboard" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 sm:px-4 py-2 rounded-full hover:bg-slate-200 transition-colors shadow-sm">
            <LayoutDashboard size={14} className="sm:size-4" /> <span className="hidden sm:inline">Go to</span> Dashboard
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6 py-10">
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Discover Public Trips</h1>
            <p className="text-slate-500 text-base sm:text-lg">Browse curated group trips, or request to join community adventures.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-72 shrink-0">
            <form method="GET" action="/trips" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={18} className="text-slate-900" />
                <h2 className="font-bold text-slate-900 text-lg">Filters</h2>
              </div>
              
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Destination</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      name="query" 
                      defaultValue={query} 
                      placeholder="e.g. Kyoto, Japan..." 
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Duration (Days)</label>
                  <input 
                    type="number" 
                    name="days" 
                    defaultValue={days || ""} 
                    placeholder="Any" 
                    min="1"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all" 
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
                Apply Filters
              </button>
              <Link href="/trips" className="block text-center mt-3 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                Clear All
              </Link>
            </form>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="grid lg:grid-cols-2 gap-6">
          {publicGroups.map((group) => (
             <div key={group.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{group.name}</h3>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider">{group.days ? `${group.days} Days` : "Flexible"}</span>
                      {group.isStarted && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-100">Ongoing</span>}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    {group.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Members</span>
                      <span className="font-bold text-slate-700 text-lg">{group._count.members} <span className="text-slate-400 font-medium text-sm">/ {group.maxMembers || "Unlimited"}</span></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Budget</span>
                      <span className="font-bold text-emerald-600 text-lg truncate max-w-[120px]">{group.targetBudget || "TBD"}</span>
                    </div>
                  </div>
                </div>
                <JoinButton groupId={group.id} isLoggedIn={!!session?.user} isStarted={group.isStarted} />
              </div>
          ))}
          {publicGroups.length === 0 && (
            <p className="col-span-2 text-center text-slate-500">No public trips found matching your filters!</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            {page > 1 && (
              <Link href={`/trips?page=${page - 1}${query ? `&query=${query}` : ""}${days ? `&days=${days}` : ""}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Previous</Link>
            )}
            <span className="px-4 py-2 text-slate-500 text-sm font-medium bg-slate-100 rounded-xl">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/trips?page=${page + 1}${query ? `&query=${query}` : ""}${days ? `&days=${days}` : ""}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Next</Link>
            )}
          </div>
        )}
      </div>
    </div>
    </main>
  </div>
  );
}
