import { ChevronRight, Ticket } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, Poster, Skeleton } from "../components/ui";
import useFetch from "../hooks/useFetch";
import { dayLabel, formatMoney, formatTime, screenLabel } from "../lib/format";

function TicketStub({ booking, past }) {
  const { movie, show } = booking;
  return (
    <Link
      to={`/my-bookings/${booking.id}`}
      className={`ticket group grid grid-cols-[64px_1fr] gap-4 p-4 transition [--cut:200%] hover:border-line-strong sm:grid-cols-[72px_1fr_auto] sm:[--cut:calc(100%-148px)] ${past ? "opacity-70" : ""}`}
    >
      <div className="overflow-hidden rounded-md">
        <Poster movie={movie} />
      </div>
      <div className="min-w-0 self-center">
        <h3 className="truncate font-bold group-hover:text-marquee">{movie.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {dayLabel(show.showDate)} · {formatTime(show.showTime)}
        </p>
        <p className="text-sm text-muted">{screenLabel(show)}</p>
        <p className="mt-2 text-sm">
          <span className="text-subtle">Seats </span>
          <span className="font-semibold">{booking.seats.join(", ")}</span>
        </p>
      </div>
      <div className="perforation col-span-2 flex items-center justify-between gap-3 border-t border-l-0 border-dashed border-line-strong pt-3 sm:col-span-1 sm:w-[132px] sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l-2 sm:pt-0 sm:pl-4">
        <div className="sm:text-right">
          <p className="text-[11px] font-bold tracking-widest text-subtle uppercase">Paid</p>
          <p className="font-bold tabular-nums">{formatMoney(booking.amount)}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-marquee">
          Ticket <ChevronRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export default function MyBookingsPage() {
  const { data, error, loading, reload } = useFetch("/bookings/mine");
  const [tab, setTab] = useState("upcoming");
  const bookings = data?.bookings || [];
  const upcoming = bookings.filter((b) => !b.show.hasStarted).reverse(); // soonest first
  const past = bookings.filter((b) => b.show.hasStarted);
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="page max-w-4xl py-10">
      <p className="eyebrow">Wallet</p>
      <h1 className="display mt-1 text-5xl sm:text-6xl">My bookings</h1>

      <div role="group" aria-label="Filter bookings" className="mt-6 mb-6 flex gap-2">
        <button type="button" className="chip" aria-pressed={tab === "upcoming"} onClick={() => setTab("upcoming")}>
          Upcoming {data && <span className="tabular-nums">({upcoming.length})</span>}
        </button>
        <button type="button" className="chip" aria-pressed={tab === "past"} onClick={() => setTab("past")}>
          Past {data && <span className="tabular-nums">({past.length})</span>}
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : list.length ? (
        <ul className="space-y-4">
          {list.map((b) => (
            <li key={b.id} className="animate-rise">
              <TicketStub booking={b} past={tab === "past"} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Ticket}
          title={tab === "upcoming" ? "No upcoming tickets" : "No past bookings yet"}
          action={
            <Link to="/movies" className="btn-primary">
              Find a film
            </Link>
          }
        >
          {tab === "upcoming" ? "Your next movie night is a few taps away." : "Films you've watched will show up here."}
        </EmptyState>
      )}
    </div>
  );
}
