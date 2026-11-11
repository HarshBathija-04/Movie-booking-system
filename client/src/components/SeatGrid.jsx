import { useRef } from "react";
import { formatMoney } from "../lib/format";

const TIERS = {
  Regular: { swatch: "border-line-strong bg-raised hover:border-copy", dot: "bg-muted" },
  Premium: { swatch: "border-sky/60 bg-sky/10 hover:border-sky", dot: "bg-sky" },
  Recliner: { swatch: "border-teal/60 bg-teal/10 hover:border-teal", dot: "bg-teal" },
};

const AISLE_AFTER = 5;

/**
 * Interactive seat map. Arrow keys move between seats (roving tabindex), Space/Enter toggles.
 * Booked seats are announced but skipped by keyboard navigation.
 */
export default function SeatGrid({ seats, selected, prices, onToggle, disabled }) {
  const refs = useRef(new Map());
  const rows = Object.entries(
    seats.reduce((acc, s) => {
      (acc[s.row] ||= []).push(s);
      return acc;
    }, {}),
  );
  const firstFree = selected[0] || seats.find((s) => !s.isBooked)?.seatNumber;

  const move = (rowIdx, colIdx, dRow, dCol) => {
    let r = rowIdx;
    let c = colIdx;
    for (let i = 0; i < 60; i++) {
      r += dRow;
      c += dCol;
      if (r < 0 || r >= rows.length) return;
      const row = rows[r][1];
      const seat = dRow ? row[Math.min(c, row.length - 1)] : row[c];
      if (!seat) return;
      if (!seat.isBooked) {
        refs.current.get(seat.seatNumber)?.focus();
        return;
      }
      if (dRow) c = Math.min(c, row.length - 1);
    }
  };

  const onKeyDown = (e, r, c) => {
    const dirs = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    if (dirs[e.key]) {
      e.preventDefault();
      move(r, c, ...dirs[e.key]);
    }
  };

  return (
    <div className="card p-4 sm:p-8">
      <div aria-hidden className="mx-auto mb-10 max-w-lg text-center">
        <div className="h-2 rounded-[50%] bg-marquee/70 shadow-[0_10px_40px_6px_rgb(245_185_66/0.35)]" />
        <p className="mt-3 text-[11px] font-bold tracking-[0.5em] text-subtle uppercase">Screen</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div role="group" aria-label="Seat map" className="mx-auto flex w-max flex-col gap-2 sm:gap-2.5">
          {rows.map(([row, rowSeats], r) => (
            <div
              key={row}
              className={`flex items-center gap-1 sm:gap-1.5 ${rowSeats[0].category === "Recliner" ? "mt-3" : ""}`}
            >
              <span aria-hidden className="w-4 text-center text-xs font-bold text-subtle sm:w-6">
                {row}
              </span>
              {rowSeats.map((seat, c) => {
                const isSelected = selected.includes(seat.seatNumber);
                const recliner = seat.category === "Recliner";
                const state = seat.isBooked ? "booked" : isSelected ? "selected" : "available";
                return (
                  <button
                    key={seat.seatNumber}
                    ref={(el) => (el ? refs.current.set(seat.seatNumber, el) : refs.current.delete(seat.seatNumber))}
                    type="button"
                    tabIndex={seat.seatNumber === firstFree ? 0 : -1}
                    aria-pressed={isSelected}
                    aria-disabled={seat.isBooked || disabled || undefined}
                    aria-label={`${seat.seatNumber}, ${seat.category}, ${formatMoney(prices[seat.category])}, ${state}`}
                    onClick={() => !seat.isBooked && !disabled && onToggle(seat)}
                    onKeyDown={(e) => onKeyDown(e, r, c)}
                    className={[
                      "grid h-6 place-items-center rounded-t-md rounded-b-sm border text-[10px] font-bold tabular-nums transition duration-100 sm:h-8 sm:text-[11px]",
                      recliner ? "w-8 sm:w-11" : "w-6 sm:w-8",
                      c === AISLE_AFTER && rowSeats.length > 8 ? "ml-3 sm:ml-5" : "",
                      seat.isBooked
                        ? "cursor-not-allowed border-transparent bg-line [background-image:repeating-linear-gradient(45deg,transparent_0_3px,rgb(0_0_0/0.35)_3px_5px)] text-transparent"
                        : isSelected
                          ? "scale-105 border-marquee bg-marquee text-marquee-ink shadow-(--shadow-glow)"
                          : `${TIERS[seat.category].swatch} text-transparent sm:text-subtle`,
                    ].join(" ")}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-line pt-5 text-xs text-muted">
        {Object.entries(TIERS).map(([tier, t]) => (
          <li key={tier} className="inline-flex items-center gap-2">
            <span aria-hidden className={`size-4 rounded-sm border ${t.swatch}`} />
            {tier} <span className="font-semibold text-copy">{formatMoney(prices[tier])}</span>
          </li>
        ))}
        <li className="inline-flex items-center gap-2">
          <span aria-hidden className="size-4 rounded-sm bg-marquee" /> Selected
        </li>
        <li className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="size-4 rounded-sm bg-line [background-image:repeating-linear-gradient(45deg,transparent_0_3px,rgb(0_0_0/0.35)_3px_5px)]"
          />{" "}
          Sold
        </li>
      </ul>
    </div>
  );
}
