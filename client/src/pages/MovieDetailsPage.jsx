import { CalendarDays, Clock3, Star, Tag, Users, Play, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const { data } = await api.get(`/movies/${movieId}`);
        setMovie(data.movie);
        setShows(data.shows || []);
      } catch (error) {
        console.error("Failed to load movie", error);
      }
    };

    loadMovie();
    window.scrollTo(0, 0);
  }, [movieId]);

  if (!movie) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Background Banner Hero */}
      <div className="relative h-[400px] w-full overflow-hidden md:h-[600px]">
        <img
          src={movie.bannerUrl || movie.posterUrl}
          className="h-full w-full object-cover"
          alt="banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent" />
      </div>

      <div className="section-shell -mt-32 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
          {/* Poster Card */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-[40px] border-4 border-white/5 shadow-2xl">
              <img src={movie.posterUrl} alt={movie.title} className="w-full object-cover aspect-[3/4.5]" />
            </div>
            
            <div className="mt-8 glass-card p-6">
              <h4 className="font-title font-bold text-white mb-4 flex items-center gap-2">
                <Info size={18} className="text-brand" />
                Movie Info
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  <span className="text-green-400 font-bold">Now Showing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Language</span>
                  <span>{movie.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Runtime</span>
                  <span>{movie.durationMinutes} mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col pt-10 lg:pt-32">
            <h1 className="font-display text-7xl uppercase tracking-tighter text-white md:text-9xl leading-[0.85]">
              {movie.title}
            </h1>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 px-4 py-2 text-brand-soft">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-lg">{movie.rating}</span>
                <span className="text-xs opacity-60">/ 10</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2">
                <Clock3 size={18} />
                <span className="font-bold">{movie.durationMinutes}m</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2">
                <CalendarDays size={18} />
                <span className="font-bold">{new Date(movie.releaseDate).getFullYear()}</span>
              </div>
            </div>

            <div className="mt-10 max-w-3xl">
              <h3 className="font-title text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag size={20} className="text-brand" />
                Synopsis
              </h3>
              <p className="text-lg leading-relaxed text-muted">
                {movie.description}
              </p>
            </div>

            {movie.cast && movie.cast.length > 0 && (
              <div className="mt-12">
                 <h3 className="font-title text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users size={20} className="text-brand" />
                  Starring Cast
                </h3>
                <div className="flex flex-wrap gap-3">
                  {movie.cast.map(person => (
                    <div key={person} className="glass-card px-5 py-3 text-sm font-semibold">
                      {person}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timings Section */}
            <div className="mt-20">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="font-display text-5xl uppercase tracking-wider">
                  Select <span className="text-brand">Showtime</span>
                </h2>
              </div>
              
              {shows.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {shows.map((show) => (
                    <Link
                      to={`/book/${show._id}`}
                      key={show._id}
                      className="glass-card group flex flex-col p-6 hover:border-brand/50 hover:bg-brand/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                          {show.format}
                        </span>
                        <span className="text-brand-soft font-title font-bold text-xl">
                          ₹{show.ticketPrice}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-lg font-bold text-white group-hover:text-brand-soft leading-tight">
                          {show.theaterName}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {show.screenName}
                        </p>
                        
                        <div className="mt-6 flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-sm text-white/80">
                            <CalendarDays size={16} className="text-brand" />
                            {new Date(show.showDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2 text-2xl font-display tracking-widest text-brand-soft">
                            <Clock3 size={20} className="text-brand" />
                            {show.showTime}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between text-xs font-bold text-muted uppercase">
                          <span>Availability</span>
                          <span className={show.totalSeats - show.bookedSeatsCount < 10 ? "text-red-400" : "text-green-400"}>
                            {show.totalSeats - show.bookedSeatsCount} Seats Left
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5 text-[0]">
                          <div 
                            className="h-full bg-brand transition-all duration-1000" 
                            style={{ width: `${(show.bookedSeatsCount / show.totalSeats) * 100}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-10 text-center text-muted">
                  No shows currently available for this movie. Check back later!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
