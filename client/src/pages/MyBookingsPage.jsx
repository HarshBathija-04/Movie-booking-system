import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Ticket, ChevronRight, Search } from "lucide-react";
import api from "../services/api";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data } = await api.get("/bookings/mine");
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Failed to load bookings", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="section-shell py-12 md:py-20">
      <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h1 className="font-display text-6xl uppercase tracking-tighter md:text-7xl">
            My <span className="text-brand">History</span>
          </h1>
          <p className="mt-2 text-muted">
            Track all your past and upcoming movie experiences.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-3">
           <div className="text-center">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Total</p>
              <p className="font-title font-black text-brand-soft leading-none">
                {bookings.length} Bookings
              </p>
           </div>
        </div>
      </div>

      {bookings.length > 0 ? (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/my-bookings/${booking._id}`}
              className="glass-card group flex flex-col overflow-hidden border-white/5 transition-all duration-300 hover:border-brand/30 hover:bg-white/[0.04] md:flex-row"
            >
              <div className="relative h-48 w-full shrink-0 md:h-auto md:w-48 lg:w-64">
                <img
                  src={booking.movie.posterUrl}
                  alt={booking.movie.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-brand px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black md:hidden">
                   View Ticket
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                <div>
                   <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-title text-2xl font-black text-white group-hover:text-brand-soft transition-colors">
                          {booking.movie.title}
                        </h3>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                          Booking ID: {booking.bookingId}
                        </p>
                      </div>
                      <div className="hidden rounded-full bg-brand/10 border border-brand/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-soft md:block">
                        {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </div>
                   </div>

                   <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-brand" />
                        <div>
                           <p className="text-[10px] font-bold text-muted uppercase">Date</p>
                           <p className="text-xs font-bold">{new Date(booking.show.showDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-brand" />
                        <div>
                           <p className="text-[10px] font-bold text-muted uppercase">Time</p>
                           <p className="text-xs font-bold">{booking.show.showTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-brand" />
                        <div>
                           <p className="text-[10px] font-bold text-muted uppercase">Venue</p>
                           <p className="text-xs font-bold truncate max-w-[120px]">{booking.show.theaterName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Ticket size={18} className="text-brand" />
                        <div>
                           <p className="text-[10px] font-bold text-muted uppercase">Seats</p>
                           <p className="text-xs font-bold">{booking.seats.length} ({booking.seats.join(", ")})</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                   <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-muted">Total Paid:</span>
                       <span className="font-title text-xl font-black text-white md:text-2xl">₹{booking.amount}</span>
                   </div>
                   <div className="flex items-center gap-2 font-title font-bold text-brand-soft group-hover:gap-3 transition-all">
                      Digital Ticket
                      <ChevronRight size={18} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-white/5 p-8 mb-6 border border-white/10">
            <Ticket size={48} className="text-muted opacity-20" />
          </div>
          <h3 className="text-2xl font-bold">No bookings yet</h3>
          <p className="mt-2 text-muted max-w-sm">
            It looks like you haven't booked any movies yet. Head over to the movies page to find something exciting!
          </p>
          <Link to="/movies" className="btn-primary mt-8">
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
