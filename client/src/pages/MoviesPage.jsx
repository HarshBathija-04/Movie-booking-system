import { Search, SearchX } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard, { MovieCardSkeleton, MovieGrid } from "../components/MovieCard";
import { EmptyState, ErrorState } from "../components/ui";
import useFetch from "../hooks/useFetch";

export default function MoviesPage() {
  const { data, error, loading, reload } = useFetch("/movies");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const genre = params.get("genre") || "";
  const language = params.get("lang") || "";

  const movies = useMemo(() => data?.movies || [], [data]);
  const genres = useMemo(() => [...new Set(movies.flatMap((m) => m.genres))].sort(), [movies]);
  const languages = useMemo(() => [...new Set(movies.map((m) => m.language))].sort(), [movies]);

  // shortcut: filters client-side, fine for a single cinema's catalog; switch to the API's ?search/&genre at ~500 titles.
  const filtered = movies.filter(
    (m) =>
      (!q || m.title.toLowerCase().includes(q.toLowerCase())) &&
      (!genre || m.genres.includes(genre)) &&
      (!language || m.language === language),
  );

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div className="page py-10">
      <header className="mb-8">
        <p className="eyebrow">Programme</p>
        <h1 className="display mt-1 text-5xl sm:text-6xl">All films</h1>
      </header>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle"
            />
            <label htmlFor="movie-search" className="sr-only">
              Search films
            </label>
            <input
              id="movie-search"
              type="search"
              value={q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Search by title"
              className="field pl-10"
            />
          </div>
          <label htmlFor="lang" className="sr-only">
            Language
          </label>
          <select id="lang" value={language} onChange={(e) => set("lang", e.target.value)} className="field sm:w-48">
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div
          role="group"
          aria-label="Filter by genre"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button type="button" className="chip shrink-0" aria-pressed={!genre} onClick={() => set("genre", "")}>
            All genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              className="chip shrink-0"
              aria-pressed={genre === g}
              onClick={() => set("genre", genre === g ? "" : g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <MovieGrid>
          {Array.from({ length: 10 }, (_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </MovieGrid>
      ) : filtered.length ? (
        <>
          <p className="mb-4 text-sm text-subtle" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "film" : "films"}
          </p>
          <MovieGrid>
            {filtered.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </MovieGrid>
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No films match those filters"
          action={
            <button type="button" className="btn-outline" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
          }
        >
          Try a different title, genre or language.
        </EmptyState>
      )}
    </div>
  );
}
