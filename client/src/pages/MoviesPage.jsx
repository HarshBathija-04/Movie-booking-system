import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";

const genres = ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Thriller", "Adventure", "Romance", "Biography", "Musical"];

const MoviesPage = () => {
  const { fetchMovies, loading, movies } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => fetchMovies(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter movies locally based on genre for instant feedback
  const filteredMovies = activeGenre === "All" 
    ? movies 
    : movies.filter(m => m.genre?.includes(activeGenre));

  return (
    <div className="section-shell py-12 md:py-20">
      <div className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="text-center md:text-left">
          <h1 className="font-display text-6xl uppercase tracking-tighter md:text-7xl">
            Explore <span className="text-brand">Movies</span>
          </h1>
          <p className="mt-2 text-muted max-w-md">
            Find your next favorite film from our curated library of Bollywood and Hollywood hits.
          </p>
        </div>
        
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-muted">
            <Search size={20} />
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="field field-with-icon text-lg"
            placeholder="Search by title..."
          />
        </div>
      </div>

      {/* Genre Filter Bar */}
      <div className="mb-12 flex flex-wrap items-center justify-center md:justify-start gap-3">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`rounded-2xl border px-6 py-2.5 text-xs font-bold transition-all duration-300 ${
              activeGenre === genre
                ? "border-brand bg-brand text-black shadow-lg shadow-brand/20"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/5] animate-pulse rounded-[32px] bg-white/5" />
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-white/5 p-6 mb-4">
            <Search size={40} className="text-muted" />
          </div>
          <p className="text-xl font-bold">No movies found</p>
          <p className="mt-2 text-muted">Try adjusting your search terms or filters.</p>
          <button onClick={() => setSearch("")} className="mt-6 text-brand font-bold hover:underline">
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
