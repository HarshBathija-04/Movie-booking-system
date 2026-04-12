import { useEffect, useState } from "react";
import api from "../../services/api";
import { ReceiptText, Search, Download } from "lucide-react";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data } = await api.get("/admin/bookings");
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.movie?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
         <div>
            <h1 className="font-display text-5xl uppercase tracking-tighter">
              Sales <span className="text-brand">& Bookings</span>
            </h1>
            <p className="text-muted">Monitor all transaction history and seat reservations.</p>
         </div>
         
         <div className="flex gap-3">
            <div className="relative">
               <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" size={16} />
               <input 
                  className="field py-2 text-xs pl-10 h-10 min-w-[240px]" 
                  placeholder="Search ID, User, or Movie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="flex h-10 items-center justify-center rounded-xl bg-white/5 px-4 text-xs font-bold text-muted border border-white/5 hover:text-white transition-all">
               <Download size={16} className="mr-2" />
               Export
            </button>
         </div>
      </div>

      <div className="glass-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Movie</th>
                <th className="px-6 py-5">Show Details</th>
                <th className="px-6 py-5">Seats</th>
                <th className="px-6 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                       <span className="font-title font-bold text-white group-hover:text-brand-soft transition-colors">#{booking.bookingId}</span>
                       <p className="text-[10px] text-muted">{new Date(booking.createdAt || Date.now()).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5 font-semibold text-white/80">{booking.user?.name}</td>
                    <td className="px-6 py-5 font-bold text-white">{booking.movie?.title}</td>
                    <td className="px-6 py-5">
                      <div className="text-xs">
                        <p className="text-white/80 font-bold">{booking.show?.showTime}</p>
                        <p className="text-muted">{booking.show?.theaterName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {booking.seats.map(s => (
                          <span key={s} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-muted border border-white/5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-title text-lg font-black text-brand-soft">₹{booking.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-muted">
                     <div className="flex flex-col items-center">
                        <ReceiptText size={40} className="mb-4 opacity-10" />
                        <p>No bookings found matching your request.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
