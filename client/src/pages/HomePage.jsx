import { ArrowRight, CalendarX, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Concierge from "../components/Concierge";
import MovieCard, { MovieCardSkeleton, MovieGrid } from "../components/MovieCard";
import { EmptyState, ErrorState, Poster, Skeleton } from "../components/ui";
import useFetch from "../hooks/useFetch";
import { dayLabel, formatRuntime, formatTime } from "../lib/format";

function Hero({ movie, loading }) {
  const { data } = useFetch(movie ? `/movies/${movie.id}` : null);
  const nextShows = data?.shows?.slice(0, 4) || [];
  const backdrop = movie?.bannerUrl || movie?.posterUrl;

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-line">
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-20 size-full object-cover object-top opacity-40"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="page grid items-end gap-10 py-14 md:grid-cols-[1fr_auto] md:py-24">
        <div className="max-w-2xl animate-rise">
          <p className="eyebrow">Tonight&apos;s headliner</p>
          {movie ? (
            <>
              <h1 id="hero-title" className="display mt-3 text-[clamp(3.25rem,9vw,6.5rem)]">
                {movie.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1 font-semibold text-copy">
                  <Star aria-hidden className="size-4 fill-marquee text-marquee" /> {Number(movie.rating).toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden className="size-4" /> {formatRuntime(movie.durationMinutes)}
                </span>
                <span>{movie.genres.join(" · ")}</span>
                <span>{movie.language}</span>
              </div>
              <p className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {movie.description}
              </p>

              {nextShows.length > 0 && (
                <div className="mt-7">
                  <p className="mb-2.5 text-xs font-bold tracking-widest text-subtle uppercase">Next showtimes</p>
                  <ul className="flex flex-wrap gap-2">
                    {nextShows.map((s) => (
                      <li key={s.id}>
                        <Link to={`/book/${s.id}`} className="chip">
                          <span className="text-subtle">{dayLabel(s.showDate)}</span>
                          <span className="text-copy">{formatTime(s.showTime)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={`/movies/${movie.id}`} className="btn-primary">
                  Book tickets <ArrowRight aria-hidden className="size-4" />
                </Link>
                <Link to="/movies" className="btn-outline">
                  Browse all films
                </Link>
              </div>
            </>
          ) : loading ? (
            <div className="mt-4 space-y-4">
              <h1 id="hero-title" className="sr-only">
                CineVerse
              </h1>
              <Skeleton className="h-20 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <>
              <h1 id="hero-title" className="display mt-3 text-[clamp(3.25rem,9vw,6.5rem)]">
                Your seat is <span className="text-marquee">waiting.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Pick a film, choose exact seats on a live map and walk in with a QR ticket.
              </p>
              <Link to="/movies" className="btn-primary mt-8">
                Browse all films <ArrowRight aria-hidden className="size-4" />
              </Link>
            </>
          )}
        </div>
        {movie && (
          <div className="hidden w-56 rotate-2 overflow-hidden rounded-xl border border-line-strong shadow-(--shadow-pop) md:block lg:w-64">
            <Poster movie={movie} eager />
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data, error, loading, reload } = useFetch("/movies");
  const movies = data?.movies || [];
  const headliner = movies.find((m) => m.bannerUrl && m.upcomingShows > 0) || movies[0];
  const nowShowing = movies.filter((m) => m.upcomingShows > 0).slice(0, 10);

  return (
    <>
      <Hero movie={headliner} loading={loading} />

      <div className="page mt-12 space-y-16">
        <Concierge />

        <section aria-labelledby="now-showing">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">In cinemas</p>
              <h2 id="now-showing" className="display mt-1 text-4xl sm:text-5xl">
                Now showing
              </h2>
            </div>
            <Link to="/movies" className="btn-ghost btn-sm shrink-0">
              See all <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : !loading && !nowShowing.length ? (
            <EmptyState icon={CalendarX} title="No shows scheduled right now">
              New showtimes are added every day. Check back soon.
            </EmptyState>
          ) : (
            <MovieGrid>
              {loading
                ? Array.from({ length: 10 }, (_, i) => <MovieCardSkeleton key={i} />)
                : nowShowing.map((m, i) => <MovieCard key={m.id} movie={m} eager={i < 5} />)}
            </MovieGrid>
          )}
        </section>
      </div>
    </>
  );
}
