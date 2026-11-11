import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState, Poster, Skeleton } from "../components/ui";
import useFetch from "../hooks/useFetch";
import { formatDay, formatMoney, formatRuntime, formatTime } from "../lib/format";

const Field = ({ label, children }) => (
  <div>
    <dt className="text-[11px] font-bold tracking-widest text-subtle uppercase">{label}</dt>
    <dd className="mt-0.5 font-semibold">{children}</dd>
  </div>
);

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const { data, error, loading, reload } = useFetch(`/bookings/mine/${bookingId}`);
  const b = data?.booking;

  return (
    <div className="page max-w-3xl py-8">
      <Link to="/my-bookings" className="no-print btn-ghost btn-sm mb-4 -ml-3">
        <ArrowLeft aria-hidden className="size-4" /> My bookings
      </Link>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !b ? (
        <Skeleton className="h-[520px]" />
      ) : (
        <>
          {!b.show.hasStarted && (
            <p
              role="status"
              className="no-print mb-5 flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-teal"
            >
              <CheckCircle2 aria-hidden className="size-5 shrink-0" />
              Booking confirmed. Show this QR code at the entrance.
            </p>
          )}

          <article aria-label={`Ticket for ${b.movie.title}`} className="card overflow-hidden">
            <div className="grid gap-6 p-6 sm:grid-cols-[120px_1fr] sm:p-8">
              <div className="w-24 overflow-hidden rounded-lg sm:w-full">
                <Poster movie={b.movie} />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">Admit {b.seatCount}</p>
                <h1 className="display mt-1 text-4xl sm:text-5xl">{b.movie.title}</h1>
                <p className="mt-1 text-sm text-muted">
                  {b.movie.language} · {formatRuntime(b.movie.durationMinutes)} · {b.show.format}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Field label="Date">
                    {formatDay(b.show.showDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </Field>
                  <Field label="Time">{formatTime(b.show.showTime)}</Field>
                  <Field label="Screen">{b.show.screenName}</Field>
                  <Field label="Seats">{b.seats.join(", ")}</Field>
                  <Field label="Cinema">{b.show.theaterName}</Field>
                  <Field label="Paid">{formatMoney(b.amount)}</Field>
                </dl>
              </div>
            </div>

            <div className="relative border-t-2 border-dashed border-line-strong">
              <span aria-hidden className="absolute -top-3 -left-3 size-6 rounded-full bg-ink" />
              <span aria-hidden className="absolute -top-3 -right-3 size-6 rounded-full bg-ink" />
            </div>

            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between sm:p-8">
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-bold tracking-widest text-subtle uppercase">Booking code</p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider break-all">{b.bookingCode}</p>
                <p className="mt-1 text-xs text-subtle">
                  Booked {new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                  {b.paymentMethod === "simulation" ? "demo payment, no card charged" : `${b.paymentMethod} payment`}
                </p>
              </div>
              <img
                src={b.qrCode}
                alt={`QR code for booking ${b.bookingCode}`}
                width="160"
                height="160"
                className="rounded-lg bg-white p-2"
              />
            </div>
          </article>

          <div className="no-print mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-outline" onClick={() => window.print()}>
              <Printer aria-hidden className="size-4" /> Print ticket
            </button>
            <Link to="/movies" className="btn-ghost">
              Book another film
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
