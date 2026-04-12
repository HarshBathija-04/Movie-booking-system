import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";

const HomePage = () => {
  const { movies } = useAppContext();
  const featured = movies.slice(0, 4);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10">
        {/* Background blobs for depth */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 animate-pulse-slow rounded-full bg-brand/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 animate-pulse-slow rounded-full bg-brand-soft/5 blur-[80px]" />

        <div className="section-shell relative z-10">
          <div className="flex flex-col items-center py-12 text-center md:py-20 lg:items-start lg:text-left animate-fade-in-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-1.5 text-xs font-bold tracking-widest text-brand-soft uppercase">
              <Sparkles size={14} />
              Aditya University MCA Project 2026
            </div>
            
            <h1 className="max-w-4xl font-display text-7xl uppercase leading-[0.9] text-white md:text-[110px]">
              Step into the <span className="text-brand">Magic</span> of <br className="hidden lg:block" />
              the Big Screen.
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
              From the latest Bollywood blockbusters to Hollywood's most anticipated sequels, 
              book your perfect seat in seconds. Experience cinema like never before.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link to="/movies" className="btn-primary gap-2">
                <Play size={20} fill="currentColor" />
                Book Tickets Now
              </Link>
              <Link to="/my-bookings" className="btn-secondary">
                My Booking History
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="section-shell mt-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <h2 className="font-display text-5xl uppercase tracking-wider">
              Now <span className="text-white/40">Showing</span>
            </h2>
            <div className="h-1 w-20 bg-brand rounded-full" />
            <p className="max-w-md text-muted">
              Check out the most popular movies currently playing at Aditya Cinemas.
            </p>
          </div>
          <Link to="/movies" className="group flex items-center gap-2 font-title font-bold text-brand-soft transition-all hover:gap-3">
            View All Movies
            <ArrowRight size={20} />
          </Link>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
