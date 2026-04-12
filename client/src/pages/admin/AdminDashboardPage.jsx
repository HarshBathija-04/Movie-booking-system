import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import api from "../../services/api";
import { Users, Film, Ticket, Calendar, IndianRupee, Activity, ArrowUpRight } from "lucide-react";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      } catch (e) {
        console.error("Dashboard error", e);
      }
    };

    loadDashboard();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-tighter">
          Platform <span className="text-brand">Overview</span>
        </h1>
        <p className="text-muted">Real-time performance metrics and recent activity for CineVerse.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          label="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          colorClass="text-brand-soft"
          gradient="bg-brand/20"
        />
        <StatCard 
          label="Movies Active" 
          value={stats.totalMovies} 
          icon={Film} 
          colorClass="text-brand"
        />
        <StatCard 
          label="Total Shows" 
          value={stats.totalShows} 
          icon={Calendar} 
          colorClass="text-emerald-400"
          gradient="bg-emerald-500/10"
        />
        <StatCard 
          label="Tickets Sold" 
          value={stats.totalTicketsSold} 
          icon={Ticket} 
          colorClass="text-brand-soft"
        />
        <StatCard 
          label="Total Bookings" 
          value={stats.totalBookings} 
          icon={Activity} 
          colorClass="text-brand"
        />
        <StatCard 
          label="Gross Revenue" 
          value={`₹${stats.totalRevenue}`} 
          icon={IndianRupee} 
          colorClass="text-emerald-400"
          gradient="bg-emerald-500/10"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <h2 className="font-title text-xl font-black text-white flex items-center gap-2">
            <Activity size={20} className="text-brand" />
            Recent Booking Activity
          </h2>
          <button className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
            View All Bookings <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="divide-y divide-white/5">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                   <div className="h-12 w-10 overflow-hidden rounded-lg bg-white/5 border border-white/5">
                      <img src={booking.movie?.posterUrl} className="h-full w-full object-cover" alt="" />
                   </div>
                   <div>
                      <p className="font-bold text-white">{booking.movie?.title}</p>
                      <p className="text-xs text-muted">
                        Booked by <span className="text-white/80">{booking.user?.name}</span> • {booking.bookingId}
                      </p>
                   </div>
                </div>
                
                <div className="text-right">
                   <p className="font-title font-bold text-brand-soft">₹{booking.amount}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                     {new Date(booking.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-muted">No recent bookings recorded today.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
