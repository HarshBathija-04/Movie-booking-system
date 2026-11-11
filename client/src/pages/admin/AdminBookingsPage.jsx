import { ReceiptText, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { formatDay, formatMoney, formatTime } from "../../lib/format";

export function BookingsTable({ bookings }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-xs tracking-wider text-subtle uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Code
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Customer
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Film &amp; show
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Seats
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-raised/60">
              <td className="px-4 py-3 font-mono text-xs text-muted">{b.bookingCode}</td>
              <td className="px-4 py-3">
                <p className="font-semibold">{b.user.name}</p>
                <p className="text-xs text-subtle">{b.user.email}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold">{b.movie.title}</p>
                <p className="text-xs text-subtle">
                  {formatDay(b.show.showDate)} · {formatTime(b.show.showTime)} · {b.show.screenName}
                </p>
              </td>
              <td className="max-w-48 truncate px-4 py-3 text-muted" title={b.seats.join(", ")}>
                {b.seatCount} · {b.seats.join(", ")}
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(b.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminBookingsPage() {
  const { data, error, loading, reload } = useFetch("/admin/bookings");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const bookings = (data?.bookings || []).filter(
    (b) =>
      !needle ||
      [b.bookingCode, b.user.name, b.user.email, b.movie.title].some((v) => v.toLowerCase().includes(needle)),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-4xl">Bookings</h1>
          <p className="text-sm text-muted">Most recent 500 bookings, including box-office sales.</p>
        </div>
        <div className="relative sm:w-72">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
          />
          <label htmlFor="booking-search" className="sr-only">
            Search bookings
          </label>
          <input
            id="booking-search"
            type="search"
            className="field pl-9"
            placeholder="Code, customer or film"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </header>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-96" />
      ) : bookings.length ? (
        <BookingsTable bookings={bookings} />
      ) : (
        <EmptyState icon={ReceiptText} title={needle ? "No bookings match your search" : "No bookings yet"} />
      )}
    </div>
  );
}
