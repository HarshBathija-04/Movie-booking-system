import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatMoney, formatRuntime } from "../lib/format";
import { Poster, Skeleton } from "./ui";

export default function MovieCard({ movie, eager }) {
  const bookable = movie.upcomingShows > 0;
  return (
    <Link to={`/movies/${movie.id}`} className="group block focus-visible:outline-offset-4">
      <div className="relative overflow-hidden rounded-xl border border-line bg-raised transition duration-300 group-hover:-translate-y-1 group-hover:border-line-strong group-hover:shadow-(--shadow-pop)">
        <Poster movie={movie} eager={eager} className="transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-ink/85 px-2 py-1 text-xs font-bold backdrop-blur">
          <Star aria-hidden className="size-3.5 fill-marquee text-marquee" />
          {Number(movie.rating).toFixed(1)}
        </span>
        {!bookable && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-1.5 text-center text-xs font-bold text-muted backdrop-blur">
            No upcoming shows
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1 px-0.5">
        <h3 className="line-clamp-1 font-bold group-hover:text-marquee">{movie.title}</h3>
        <p className="line-clamp-1 text-sm text-muted">
          {movie.genres.slice(0, 2).join(" · ")} · {formatRuntime(movie.durationMinutes)}
        </p>
        {bookable && movie.priceFrom != null && (
          <p className="text-sm text-subtle">
            From <span className="font-semibold text-copy">{formatMoney(movie.priceFrom)}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

export const MovieCardSkeleton = () => (
  <div>
    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
    <Skeleton className="mt-3 h-4 w-3/4" />
    <Skeleton className="mt-2 h-3 w-1/2" />
  </div>
);

export const MovieGrid = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>
);
