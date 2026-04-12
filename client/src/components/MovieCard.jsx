import { Clock3, Star, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

const MovieCard = ({ movie }) => (
  <Link
    to={`/movies/${movie._id}`}
    className="group flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] transition-all duration-500 hover:-translate-y-2 hover:border-brand/40 hover:bg-white/[0.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
  >
    <div className="relative aspect-[3/4.2] overflow-hidden">
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="btn-primary w-full py-2.5 text-xs shadow-none">
          <Ticket size={14} className="mr-2" />
          Quick Book
        </div>
      </div>

      <div className="absolute top-4 right-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 text-xs font-bold text-brand-soft">
        <div className="flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          {movie.rating}
        </div>
      </div>
    </div>
    
    <div className="flex flex-1 flex-col justify-between p-6">
      <div>
        <h3 className="line-clamp-1 font-title text-xl font-bold tracking-tight text-white group-hover:text-brand-soft transition-colors text-gradient">
          {movie.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {movie.description}
        </p>
      </div>
      
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-[11px] font-bold tracking-wider text-muted uppercase">
        <span className="truncate max-w-[120px]">{movie.genre?.[0]} • {movie.language}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock3 size={13} className="text-brand" />
          {movie.durationMinutes}m
        </div>
      </div>
    </div>
  </Link>
);

export default MovieCard;
