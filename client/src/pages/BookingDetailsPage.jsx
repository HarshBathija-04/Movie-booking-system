import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Download, Mail, MapPin, Printer, Share2, Ticket, CheckCircle2 } from "lucide-react";
import api from "../services/api";

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/mine/${bookingId}`);
        setBooking(data.booking);
      } catch (e) {
        console.error("Failed to load ticket", e);
      }
    };

    loadBooking();
    window.scrollTo(0, 0);
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="section-shell py-12 md:py-20 lg:min-h-screen">
      <Link 
        to="/my-bookings" 
        className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Bookings
      </Link>

      <div className="mx-auto max-w-lg lg:max-w-4xl">
        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row md:items-end">
           <div>
             <h1 className="font-display text-5xl uppercase tracking-wider text-white">Your <span className="text-brand">Ticket</span></h1>
             <p className="text-muted flex items-center gap-2 mt-1 font-bold">
               <CheckCircle2 size={16} className="text-emerald-400" />
               Booking Confirmed - Enjoy your movie!
             </p>
           </div>
           
           <div className="flex gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                <Download size={18} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                <Printer size={18} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                <Share2 size={18} />
              </button>
           </div>
        </div>

        {/* Digital Ticket Concept */}
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1c1c22] to-[#0a0a0c] border border-white/5 shadow-2xl lg:flex">
          
          {/* Main Ticket Info */}
          <div className="flex-1 p-8 md:p-12 relative">
             <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-brand/10 p-2.5 text-brand border border-brand/20">
                   <Ticket size={28} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-soft">Aditya Cinemas Digital Ticket</p>
                   <p className="font-title font-bold text-white">ID: #{booking.bookingId}</p>
                </div>
             </div>

             <h2 className="font-display text-6xl uppercase tracking-tighter text-white md:text-7xl leading-none">
               {booking.movie.title}
             </h2>

             <div className="mt-10 grid grid-cols-2 gap-y-8 md:grid-cols-3">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">Show Date</p>
                   <p className="font-title font-bold text-white text-lg">{new Date(booking.show.showDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">Show Time</p>
                   <p className="font-title font-bold text-white text-lg">{booking.show.showTime}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">Screen</p>
                   <p className="font-title font-bold text-white text-lg">{booking.show.screenName}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">Venue</p>
                   <p className="font-title font-bold text-white text-lg flex items-center gap-2">
                     <MapPin size={16} className="text-brand" />
                     {booking.show.theaterName}
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">Seats</p>
                   <p className="font-title font-bold text-white text-lg">{booking.seats.join(", ")}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted">Price</p>
                   <p className="font-title font-bold text-brand-soft text-lg">₹{booking.amount}</p>
                </div>
             </div>
             
             {/* Perforation line for visual effect (only on large) */}
             <div className="hidden lg:block absolute -right-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          </div>

          {/* QR Side (Redemption part) */}
          <div className="w-full lg:w-[320px] bg-black/40 p-8 md:p-12 flex flex-col items-center justify-center text-center">
             <div className="relative p-3 bg-white rounded-3xl mb-6 shadow-xl">
                <img src={booking.qrCode} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                <div className="absolute inset-0 border-[12px] border-white rounded-3xl pointer-events-none" />
             </div>
             <p className="text-xs font-bold text-muted uppercase tracking-widest max-w-[200px]">
               Scan this QR code at the cinema entrance for entry.
             </p>
             
             <div className="mt-8 flex gap-3 text-muted">
                <div className="flex flex-col items-center">
                   <Mail size={16} className="mb-1" />
                   <span className="text-[9px] font-bold uppercase tracking-tighter">emailed</span>
                </div>
                <div className="flex flex-col items-center">
                   <Printer size={16} className="mb-1" />
                   <span className="text-[9px] font-bold uppercase tracking-tighter">printable</span>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 glass-card p-6 border-white/5 flex flex-col items-center justify-between gap-6 md:flex-row">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted">Payment Status</p>
                <p className="font-title font-bold text-white">Payment of ₹{booking.amount} Successful via {booking.paymentMethod}</p>
              </div>
           </div>
           <Link to="/movies" className="btn-secondary py-2 border-brand/20 text-brand-soft">
             Book Another Movie
           </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
