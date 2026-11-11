import { ArrowLeft, Info, Loader2, Ticket } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import SeatGrid from "../components/SeatGrid";
import { EmptyState, ErrorState, Poster, Skeleton } from "../components/ui";
import useFetch from "../hooks/useFetch";
import { dayLabel, formatMoney, formatTime, screenLabel } from "../lib/format";
import api, { errorMessage } from "../services/api";

const MAX_SEATS = 10;

export default function SeatBookingPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useFetch(`/shows/${showId}`);
  const [selected, setSelected] = useState([]); // seat objects, in pick order
  const [submitting, setSubmitting] = useState(false);

  const show = data?.show;
  const total = selected.reduce((sum, s) => sum + show.prices[s.category], 0);

  const toggle = (seat) =>
    setSelected((prev) => {
      if (prev.some((s) => s.seatNumber === seat.seatNumber))
        return prev.filter((s) => s.seatNumber !== seat.seatNumber);
      if (prev.length >= MAX_SEATS) {
        toast.error(`You can book up to ${MAX_SEATS} seats at a time`);
        return prev;
      }
      return [...prev, seat];
    });

  const checkout = async () => {
    setSubmitting(true);
    try {
      const { data: res } = await api.post("/bookings", {
        showId: Number(showId),
        seats: selected.map((s) => s.seatNumber),
      });
      toast.success("You're booked! Enjoy the show.");
      navigate(`/my-bookings/${res.booking.id}`, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Booking failed, please try again"));
      const taken = err.response?.data?.error?.details?.taken;
      if (taken) {
        setSelected((prev) => prev.filter((s) => !taken.includes(s.seatNumber)));
        reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="page py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-[460px]" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (show.hasStarted) {
    return (
      <div className="page py-16">
        <EmptyState
          icon={Ticket}
          title="This show has already started"
          action={
            <Link to={`/movies/${show.movie.id}`} className="btn-primary">
              Pick another showtime
            </Link>
          }
        >
          Bookings close when the film begins.
        </EmptyState>
      </div>
    );
  }

  const summary = (
    <>
      <div className="flex gap-4">
        <div className="w-16 shrink-0 overflow-hidden rounded-md">
          <Poster movie={show.movie} />
        </div>
        <div className="min-w-0">
          <h2 className="leading-tight font-bold">{show.movie.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {dayLabel(show.showDate)}, {formatTime(show.showTime)}
          </p>
          <p className="text-sm text-muted">{screenLabel(show)}</p>
        </div>
      </div>

      <div className="my-5 border-t border-dashed border-line-strong" />

      {selected.length ? (
        <ul className="space-y-2 text-sm" aria-label="Selected seats">
          {selected.map((s) => (
            <li key={s.seatNumber} className="flex items-center justify-between gap-2">
              <span>
                <span className="font-bold">{s.seatNumber}</span> <span className="text-muted">· {s.category}</span>
              </span>
              <span className="flex items-center gap-3 tabular-nums">
                {formatMoney(show.prices[s.category])}
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  className="text-xs text-subtle underline-offset-2 hover:text-velvet hover:underline"
                >
                  Remove<span className="sr-only"> seat {s.seatNumber}</span>
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-subtle">Tap seats on the map to add them here.</p>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Convenience fee</span>
        <span className="text-sm font-semibold text-teal">Free</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-bold tabular-nums" aria-live="polite">
          {formatMoney(total)}
        </span>
      </div>
      <button
        type="button"
        className="btn-primary mt-5 w-full"
        disabled={!selected.length || submitting}
        onClick={checkout}
      >
        {submitting ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <Ticket aria-hidden className="size-4" />
        )}
        {submitting ? "Confirming seats…" : selected.length ? `Pay ${formatMoney(total)}` : "Select seats"}
      </button>
      <p className="mt-3 flex items-start gap-2 text-xs text-subtle">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" /> Demo checkout: no card is charged. Seats are locked
        the moment you pay.
      </p>
    </>
  );

  return (
    <div className="page py-8 pb-28 lg:pb-10">
      <Link to={`/movies/${show.movie.id}`} className="btn-ghost btn-sm mb-4 -ml-3">
        <ArrowLeft aria-hidden className="size-4" /> {show.movie.title}
      </Link>
      <div className="mb-6">
        <h1 className="display text-4xl sm:text-5xl">Choose your seats</h1>
        <p className="mt-1 text-sm text-muted">
          Pick up to {MAX_SEATS} seats. Prices rise toward the back rows.
          <span className="hidden sm:inline"> Arrow keys move around the map.</span>
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <SeatGrid
          seats={data.seats}
          selected={selected.map((s) => s.seatNumber)}
          prices={show.prices}
          onToggle={toggle}
          disabled={submitting}
        />
        <aside aria-label="Order summary" className="card p-6 lg:sticky lg:top-24">
          {summary}
        </aside>
      </div>

      {/* Mobile checkout bar: the full summary sits under the map, this keeps the action in reach. */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div className="min-w-0 text-sm">
            <p className="truncate text-muted">
              {selected.length ? selected.map((s) => s.seatNumber).join(", ") : "No seats selected"}
            </p>
            <p className="font-bold tabular-nums">{formatMoney(total)}</p>
          </div>
          <button type="button" className="btn-primary" disabled={!selected.length || submitting} onClick={checkout}>
            {submitting ? "Confirming…" : selected.length ? `Pay ${formatMoney(total)}` : "Select seats"}
          </button>
        </div>
      </div>
    </div>
  );
}
