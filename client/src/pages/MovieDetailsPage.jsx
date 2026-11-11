import { ArrowLeft, CalendarX, Clock, Languages, PlayCircle, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorState, Poster, Skeleton } from "../components/ui";
import useFetch from "../hooks/useFetch";
import { dayLabel, formatDay, formatMoney, formatRuntime, formatTime } from "../lib/format";

function Availability({ show }) {
  const left = show.totalSeats - show.bookedSeatsCount;
  const ratio = left / show.totalSeats;
  const [tone, label] =
    left === 0
      ? ["text-velvet", "Sold out"]
      : ratio < 0.25
        ? ["text-velvet", `${left} left`]
        : ratio < 0.5
          ? ["text-marquee", "Filling fast"]
          : ["text-teal", "Available"];
  return <span className={`text-xs font-semibold ${tone}`}>{label}</span>;
}

function Showtimes({ shows }) {
  const days = useMemo(() => [...new Set(shows.map((s) => s.showDate))], [shows]);
  const [picked, setPicked] = useState(null);
  const day = picked && days.includes(picked) ? picked : days[0];

  if (!shows.length) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No upcoming shows"
        action={
          <Link to="/movies" className="btn-outline">
            Browse other films
          </Link>
        }
      >
        This film has no scheduled screenings right now.
      </EmptyState>
    );
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Choose a date"
        className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {days.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={d === day}
            onClick={() => setPicked(d)}
            className="flex min-w-20 shrink-0 flex-col items-center rounded-xl border border-line-strong px-4 py-2.5 transition hover:border-muted aria-pressed:border-marquee aria-pressed:bg-marquee/10"
          >
            <span className="text-xs font-semibold text-subtle">
              {dayLabel(d).includes(" ") ? formatDay(d, { weekday: "short" }) : dayLabel(d)}
            </span>
            <span className="text-lg font-bold">{formatDay(d, { day: "numeric" })}</span>
            <span className="text-xs text-muted">{formatDay(d, { month: "short" })}</span>
          </button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shows
          .filter((s) => s.showDate === day)
          .map((s) => {
            const soldOut = s.bookedSeatsCount >= s.totalSeats;
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold tabular-nums">{formatTime(s.showTime)}</span>
                  <span className="tag">{s.format}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted">
                  <span className="truncate">{s.screenName}</span>
                  <span>from {formatMoney(s.ticketPrice)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Availability show={s} />
                  <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line" aria-hidden>
                    <span
                      className="block h-full bg-marquee/70"
                      style={{ width: `${(s.bookedSeatsCount / s.totalSeats) * 100}%` }}
                    />
                  </span>
                </div>
              </>
            );
            return (
              <li key={s.id}>
                {soldOut ? (
                  <div className="card block p-4 opacity-60" aria-disabled="true">
                    {body}
                  </div>
                ) : (
                  <Link
                    to={`/book/${s.id}`}
                    aria-label={`${formatTime(s.showTime)} in ${s.screenName}, ${s.format}`}
                    className="card block p-4 transition hover:border-marquee/60 hover:bg-raised"
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
      </ul>
      <p className="mt-3 text-xs text-subtle">All times are in cinema local time (IST).</p>
    </div>
  );
}

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const { data, error, loading, reload } = useFetch(`/movies/${movieId}`);

  if (error) {
    return (
      <div className="page py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const movie = data?.movie;
  return (
    <article>
      <div className="relative isolate overflow-hidden border-b border-line">
        {movie && (movie.bannerUrl || movie.posterUrl) && (
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 -z-20 size-full object-cover opacity-30 blur-[2px]"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/85 to-ink/50" />
        <div className="page py-8 md:py-14">
          <Link to="/movies" className="btn-ghost btn-sm mb-6 -ml-3">
            <ArrowLeft aria-hidden className="size-4" /> All films
          </Link>
          <div className="grid gap-8 sm:grid-cols-[180px_1fr] md:grid-cols-[240px_1fr]">
            <div className="w-40 overflow-hidden rounded-xl border border-line-strong shadow-(--shadow-pop) sm:w-full">
              {movie ? <Poster movie={movie} eager /> : <Skeleton className="aspect-[2/3] w-full" />}
            </div>
            <div className="min-w-0 self-end">
              {loading || !movie ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <Link key={g} to={`/movies?genre=${encodeURIComponent(g)}`} className="tag hover:text-copy">
                        {g}
                      </Link>
                    ))}
                  </div>
                  <h1 className="display mt-3 text-[clamp(2.75rem,7vw,5.5rem)]">{movie.title}</h1>
                  <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                    <div className="inline-flex items-center gap-1.5">
                      <dt className="sr-only">Rating</dt>
                      <Star aria-hidden className="size-4 fill-marquee text-marquee" />
                      <dd className="font-semibold text-copy">{Number(movie.rating).toFixed(1)}/10</dd>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <dt className="sr-only">Runtime</dt>
                      <Clock aria-hidden className="size-4" />
                      <dd>{formatRuntime(movie.durationMinutes)}</dd>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <dt className="sr-only">Language</dt>
                      <Languages aria-hidden className="size-4" />
                      <dd>{movie.language}</dd>
                    </div>
                    {movie.releaseDate && (
                      <div>
                        <dt className="sr-only">Released</dt>
                        <dd>{movie.releaseDate.slice(0, 4)}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-5 max-w-3xl leading-relaxed text-muted">{movie.description}</p>
                  {movie.cast.length > 0 && (
                    <p className="mt-4 text-sm text-subtle">
                      <span className="font-semibold text-muted">Starring </span>
                      {movie.cast.join(", ")}
                    </p>
                  )}
                  {movie.trailerUrl && (
                    <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm mt-6">
                      <PlayCircle aria-hidden className="size-4" /> Watch trailer
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="showtimes" className="page mt-10">
        <h2 id="showtimes" className="display mb-5 text-4xl">
          Showtimes
        </h2>
        {loading || !data ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <Showtimes shows={data.shows} />
        )}
      </section>
    </article>
  );
}
