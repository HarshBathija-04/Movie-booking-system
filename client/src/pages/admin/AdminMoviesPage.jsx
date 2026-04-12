import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Plus, Edit2, Trash2, X, Clapperboard, Film, Star, Clock } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  posterUrl: "",
  bannerUrl: "",
  genre: "Action,Drama",
  language: "English",
  durationMinutes: 120,
  rating: 8,
  releaseDate: "",
  cast: "Lead Actor,Lead Actress",
  trailerUrl: "",
};

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMovies = async () => {
    const { data } = await api.get("/movies");
    setMovies(data.movies || []);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      genre: form.genre.split(",").map((item) => item.trim()),
      cast: form.cast.split(",").map((item) => item.trim()),
    };

    try {
      if (editingId) {
        await api.put(`/movies/${editingId}`, payload);
        toast.success("Movie metadata updated");
      } else {
        await api.post("/movies", payload);
        toast.success("New movie added to library");
      }

      setForm(emptyForm);
      setEditingId("");
      loadMovies();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (movie) => {
    setEditingId(movie._id);
    setForm({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl || "",
      genre: movie.genre?.join(",") || "",
      language: movie.language || "Hindi",
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      releaseDate: movie.releaseDate?.slice(0, 10) || "",
      cast: movie.cast?.join(",") || "",
      trailerUrl: movie.trailerUrl || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie? This will also remove associated shows.")) return;
    
    try {
      await api.delete(`/movies/${id}`);
      toast.success("Movie removed from library");
      if (editingId === id) {
        setEditingId("");
        setForm(emptyForm);
      }
      loadMovies();
    } catch (error) {
      toast.error("Failed to delete movie");
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="font-display text-5xl uppercase tracking-tighter">
              Movie <span className="text-brand">Library</span>
            </h1>
            <p className="text-muted">Manage your film catalog, posters, and details.</p>
         </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[1fr_400px]">
        {/* Movie List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-title text-lg font-bold text-white flex items-center gap-2">
              <Film size={20} className="text-brand" />
              All Movies ({movies.length})
            </h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {movies.map((movie) => (
              <div key={movie._id} className="glass-card flex items-stretch overflow-hidden hover:bg-white/[0.04]">
                <div className="h-40 w-28 shrink-0 bg-white/5">
                  <img src={movie.posterUrl} className="h-full w-full object-cover" alt="" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h4 className="font-bold text-white leading-tight line-clamp-1">{movie.title}</h4>
                    <p className="text-[10px] font-black uppercase text-brand-soft mt-1">{movie.language}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-muted font-bold uppercase">
                       <span className="flex items-center gap-1"><Star size={10} fill="currentColor" /> {movie.rating}</span>
                       <span className="flex items-center gap-1"><Clock size={10} /> {movie.durationMinutes}m</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => startEdit(movie)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:text-white hover:bg-brand/20 hover:text-brand-soft transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteMovie(movie._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Form */}
        <div className="xl:sticky xl:top-28 h-fit">
          <form onSubmit={handleSubmit} className="glass-card p-8 border-brand/20 bg-brand/[0.01]">
            <div className="mb-6">
              <h3 className="font-title text-xl font-black text-white flex items-center gap-2">
                <Clapperboard size={20} className="text-brand" />
                {editingId ? "Edit Movie Info" : "AddNew Movie"}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Title</label>
                 <input
                  className="field"
                  placeholder="Enter movie title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Description</label>
                 <textarea
                  className="field min-h-[100px] py-3 h-auto"
                  placeholder="Movie plot summary..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Release Date</label>
                  <input
                    type="date"
                    className="field"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Language</label>
                  <input
                    className="field"
                    placeholder="Hindi, English..."
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Runtime (mins)</label>
                  <input
                    type="number"
                    className="field"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    className="field"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Poster URL</label>
                 <input
                  className="field"
                  placeholder="https://tmdb.org/..."
                  value={form.posterUrl}
                  onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                  required
                />
              </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Genres (comma separated)</label>
                 <input
                  className="field"
                  placeholder="Action, Sci-Fi, Drama"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                />
              </div>

              <button disabled={loading} className="btn-primary w-full py-4 mt-4">
                {loading ? "Processing..." : editingId ? "Update Movie" : "Add to Library"}
                <Plus size={20} className="ml-2" />
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn-secondary w-full py-4"
                  onClick={() => {
                    setEditingId("");
                    setForm(emptyForm);
                  }}
                >
                  <X size={20} className="mr-2" />
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminMoviesPage;
