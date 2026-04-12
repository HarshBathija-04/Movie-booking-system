import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, CreditCard, Info, Ticket, ShieldCheck } from "lucide-react";
import SeatGrid from "../components/SeatGrid";
import api from "../services/api";

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const loadShow = async () => {
      try {
        const { data } = await api.get(`/shows/${showId}`);
        setShow(data.show);
        setSeats(data.seats || []);
      } catch (error) {
        toast.error("Failed to load show details");
      }
    };

    loadShow();
    window.scrollTo(0, 0);
  }, [showId]);

  const total = useMemo(
    () => selectedSeats.length * (show?.ticketPrice || 0),
    [selectedSeats, show]
  );

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    if (!selectedSeats.length) {
      toast.error("Please select at least one seat to continue");
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post("/bookings", {
        showId,
        seats: selectedSeats,
        paymentMethod: "simulation",
      });
      toast.success("Ticket Booked Successfully!");
      navigate(`/my-bookings/${data.booking._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (!show) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pb-20 pt-10">
      <div className="section-shell">
        <Link 
          to={`/movies/${show.movie._id}`} 
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Movie Details
        </Link>

        <div className="grid gap-10 xl:grid-cols-[1fr_400px]">
          {/* Left Side: Seat Layout */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-5xl uppercase tracking-wider text-white">
                  Pick Your <span className="text-brand">Seats</span>
                </h1>
                <p className="text-muted mt-1">Tap on available seats to select them.</p>
              </div>
              
              <div className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-3">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Selected</p>
                    <p className="font-title font-black text-brand-soft leading-none">
                      {selectedSeats.length} Tickets
                    </p>
                 </div>
                 <div className="h-8 w-px bg-white/10" />
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Price</p>
                    <p className="font-title font-black text-white leading-none">
                      ₹{total}
                    </p>
                 </div>
              </div>
            </div>

            <SeatGrid seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} />
          </div>

          {/* Right Side: Booking Summary Panel */}
          <aside className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="glass-card p-8 border-brand/20 bg-brand/[0.02]">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-title text-2xl font-black text-white leading-tight">
                    {show.movie.title}
                  </h2>
                  <p className="text-brand-soft text-xs font-bold uppercase tracking-widest mt-1">
                    Booking Summary
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-2 text-muted border border-white/10">
                  <Ticket size={24} />
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-muted">Theater</span>
                  <span className="text-right font-semibold">{show.theaterName}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-muted">Screen</span>
                  <span className="text-right font-semibold">{show.screenName}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-muted">Date & Time</span>
                  <span className="text-right font-semibold">
                    {new Date(show.showDate).toLocaleDateString()} @ {show.showTime}
                  </span>
                </div>
                
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between items-center text-muted">
                    <span>Seats ({selectedSeats.length})</span>
                    <span className="font-title font-bold text-white max-w-[150px] truncate text-right">
                      {selectedSeats.join(", ") || "None selected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>Convenience Fee</span>
                    <span className="text-white">₹0 (Free)</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center rounded-2xl bg-white/5 p-5 border border-white/10">
                  <span className="font-title font-bold uppercase tracking-widest text-muted">Amount Payable</span>
                  <span className="font-title text-3xl font-black text-white">₹{total}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex gap-2 rounded-xl bg-brand/5 border border-brand/10 p-4 text-[10px] font-bold text-brand-soft uppercase leading-relaxed text-center">
                  <Info size={16} className="shrink-0" />
                  Testing Mode: Payment is simulated for project demonstration.
                </div>

                <button 
                  disabled={booking || selectedSeats.length === 0} 
                  onClick={handleBooking} 
                  className="btn-primary w-full py-4 text-lg"
                >
                  <CreditCard size={20} className="mr-2" />
                  {booking ? "Confirming..." : "Pay & Book Tickets"}
                </button>
              </div>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="glass-card p-6 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/5">
                <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
                   <ShieldCheck size={20} />
                </div>
                <p className="text-xs text-emerald-100/60 leading-relaxed font-semibold">
                  Safe & Secure Checkout. Instant digital ticket generation with QR verification.
                </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingPage;
