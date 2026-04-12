import { Minus, Octagon } from "lucide-react";

const seatTone = {
  Regular: "bg-white/10 hover:bg-white/20 border-white/10",
  Premium: "bg-brand/10 hover:bg-brand/20 border-brand/20 text-brand-soft",
  Recliner: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
};

const SeatGrid = ({ seats, selectedSeats, onToggle }) => {
  const grouped = seats.reduce((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="glass-card p-8 md:p-12 relative overflow-hidden">
      {/* Cinematic Screen */}
      <div className="mb-20 text-center">
        <div className="mx-auto h-2 w-[80%] rounded-[50%] bg-brand/40 blur-[4px] shadow-[0_0_30px_rgba(247,92,3,0.5)]" />
        <div className="mx-auto mt-2 h-16 w-full rounded-[100%/100%] bg-gradient-to-b from-brand/10 to-transparent flex items-start justify-center pt-2">
           <span className="text-[10px] font-bold tracking-[0.8em] text-brand uppercase opacity-60">SCREEN THIS WAY</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([row, rowSeats]) => (
          <div key={row} className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
            <span className="shrink-0 font-display text-xl text-muted w-8 text-center">{row}</span>
            <div className="flex flex-wrap justify-center gap-3">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);
                const baseTone = seatTone[seat.category] || seatTone.Regular;

                return (
                  <button
                    key={seat._id}
                    type="button"
                    disabled={seat.isBooked}
                    onClick={() => onToggle(seat.seatNumber)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl border text-[10px] font-black transition-all duration-300 sm:h-12 sm:w-12 sm:text-xs ${
                      seat.isBooked
                        ? "cursor-not-allowed border-red-500/10 bg-red-500/5 text-red-500/40"
                        : isSelected
                          ? "scale-110 border-brand bg-brand text-black shadow-[0_0_20px_rgba(247,92,3,0.4)]"
                          : `${baseTone} hover:scale-110`
                    }`}
                  >
                    {seat.isBooked ? <Minus size={14} className="opacity-40" /> : seat.seatNumber}
                    
                    {/* Visual indicator for different categories */}
                    {!seat.isBooked && !isSelected && seat.category === 'Recliner' && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    {!seat.isBooked && !isSelected && seat.category === 'Premium' && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand" />
                    )}
                  </button>
                );
              })}
            </div>
             <span className="hidden shrink-0 font-display text-xl text-muted w-8 text-center lg:block">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-16 flex flex-wrap justify-center gap-6 border-t border-white/5 pt-8">
        <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
          <div className="h-6 w-6 rounded-lg border border-white/10 bg-white/5" />
          Regular
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
          <div className="h-6 w-6 rounded-lg border border-brand/20 bg-brand/10" />
          Premium
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
          <div className="h-6 w-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10" />
          Recliner
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-500/40">
            <Minus size={12} />
          </div>
          Booked
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
          <div className="h-6 w-6 rounded-lg bg-brand shadow-[0_0_10px_rgba(247,92,3,0.3)]" />
          Selected
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
