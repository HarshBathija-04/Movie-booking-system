import { AlertTriangle, Coffee, Film, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeWaking } from "../services/api";

const POSTER_HUES = [12, 38, 200, 265, 330, 160, 220, 290];

/** Movie poster with a designed typographic fallback when the image is missing or fails to load. */
export function Poster({ movie, className = "", sizes, eager = false }) {
  const [failed, setFailed] = useState(false);
  if (movie?.posterUrl && !failed) {
    return (
      <img
        src={movie.posterUrl}
        alt={`${movie.title} poster`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        onError={() => setFailed(true)}
        className={`aspect-[2/3] w-full bg-raised object-cover ${className}`}
      />
    );
  }
  const hue = POSTER_HUES[(movie?.id || 0) % POSTER_HUES.length];
  return (
    <div
      role="img"
      aria-label={`${movie?.title || "Movie"} poster`}
      className={`relative flex aspect-[2/3] w-full flex-col justify-end overflow-hidden p-4 ${className}`}
      style={{
        background: `radial-gradient(120% 80% at 20% 0%, hsl(${hue} 70% 45% / 0.55), transparent 60%),
                     linear-gradient(160deg, hsl(${hue} 35% 16%), #0c0b10 75%)`,
      }}
    >
      <Film aria-hidden className="absolute top-4 right-4 size-5 text-white/40" />
      <span className="display text-[clamp(1.6rem,4vw,2.4rem)] text-white drop-shadow">{movie?.title}</span>
      {movie?.language && (
        <span className="mt-1 text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase">{movie.language}</span>
      )}
    </div>
  );
}

export const Skeleton = ({ className = "" }) => <div aria-hidden className={`skeleton ${className}`} />;

export function EmptyState({ icon: Icon = Film, title, children, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-raised text-marquee">
        <Icon aria-hidden className="size-6" />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      {children && <p className="mt-1.5 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-velvet/10 text-velvet">
        <AlertTriangle aria-hidden className="size-6" />
      </span>
      <h2 className="text-lg font-bold">We couldn&apos;t load this</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-6">
          <RotateCw aria-hidden className="size-4" /> Try again
        </button>
      )}
    </div>
  );
}

/** Shown while the free-tier API is cold-starting (any request slower than ~3s). */
export function WakingBanner() {
  const [waking, setWaking] = useState(false);
  useEffect(() => subscribeWaking(setWaking), []);
  if (!waking) return null;
  return (
    <div role="status" className="no-print fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="card flex max-w-md items-center gap-3 px-4 py-3 shadow-(--shadow-pop)">
        <Coffee aria-hidden className="size-5 shrink-0 animate-pulse text-marquee" />
        <p className="text-sm">
          <span className="font-bold">Waking up the server&hellip;</span>{" "}
          <span className="text-muted">The free-tier backend naps when idle. This can take up to a minute.</span>
        </p>
      </div>
    </div>
  );
}
