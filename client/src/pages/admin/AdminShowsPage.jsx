import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Plus, Edit2, Trash2, X, Calendar, MapPin, Clock, Ticket as TicketIcon } from "lucide-react";

const initialShow = {
  movie: "",
  theaterName: "Aditya University Main Theater",
  screenName: "Screen 1",
  showDate: "",
  showTime: "09:00",
  ticketPrice: 200,
  totalSeats: 58,
  format: "2D",
};

const AdminShowsPage = () => {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [form, setForm] = useState(initialShow);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [moviesResponse, showsResponse] = await Promise.all([
        api.get("/movies"),
        api.get("/shows"),
      ]);
      setMovies(moviesResponse.data.movies || []);
      setShows(showsResponse.data.shows || []);
    } catch (error) {
      console.error("Failed to load shows", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      ticketPrice: Number(form.ticketPrice),
      totalSeats: Number(form.totalSeats),
    };

    try {
      if (editingId) {
        await api.put(`/shows/${editingId}`, payload);
        toast.success("Show timing updated");
      } else {
        await api.post("/shows", payload);
        toast.success("New show scheduled");
      }

      setForm(initialShow);
      setEditingId("");
      loadData();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (show) => {
    setEditingId(show._id);
    setForm({
      movie: show.movie?._id || show.movie,
      theaterName: show.theaterName,
      screenName: show.screenName,
      showDate: show.showDate,
      showTime: show.showTime,
      ticketPrice: show.ticketPrice,
      totalSeats: show.totalSeats,
      format: show.format,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteShow = async (id) => {
    if (!window.confirm("Delete this show? This will cancel any associated metadata.")) return;
    
    try {
      await api.delete(`/shows/${id}`);
      toast.success("Show removed");
      if (editingId === id) {
        setEditingId("");
        setForm(initialShow);
      }
      loadData();
    } catch (error) {
      toast.error("Failed to delete show");
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-tighter">
          Show <span className="text-brand">Scheduler</span>
        </h1>
        <p className="text-muted">Create and manage movie timings and theater screen allocations.</p>
      </div>

      <div className="grid gap-10 xl:grid-cols-[1fr_400px]">
        {/* Shows List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-title text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-brand" />
              Upcoming Shows ({shows.length})
            </h3>
          </div>
          
          <div className="grid gap-4">
            {shows.map((show) => (
              <div key={show._id} className="glass-card flex items-center justify-between p-6 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-6">
                   <div className="h-16 w-12 shrink-0 rounded-lg overflow-hidden bg-white/5">
                      <img src={show.movie?.posterUrl} className="h-full w-full object-cover" alt="" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-lg">{show.movie?.title}</h4>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted font-bold uppercase">
                         <span className="flex items-center gap-1.5"><Clock size={12} className="text-brand" /> {show.showTime}</span>
                         <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand" /> {show.showDate}</span>
                         <span className="flex items-center gap-1.5 text-brand-soft"><MapPin size={12} /> {show.theaterName}</span>
                         <span className="flex items-center gap-1.5"><TicketIcon size={12} /> ₹{show.ticketPrice}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(show)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted hover:text-brand-soft hover:bg-brand/20 transition-all border border-white/5"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteShow(show._id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="xl:sticky xl:top-28 h-fit">
          <form onSubmit={handleSubmit} className="glass-card p-8 border-brand/20 bg-brand/[0.01]">
            <div className="mb-6">
              <h3 className="font-title text-xl font-black text-white flex items-center gap-2">
                <TicketIcon size={20} className="text-brand" />
                {editingId ? "Modify Timing" : "Schedule New Show"}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Select Movie</label>
                 <select
                  className="field appearance-none cursor-pointer"
                  value={form.movie}
                  onChange={(e) => setForm({ ...form, movie: e.target.value })}
                  required
                >
                  <option value="">Choose a movie...</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                  ))}
                </select>
              </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Theater Name</label>
                 <input
                  className="field"
                  placeholder="e.g. CineVerse Prime"
                  value={form.theaterName}
                  onChange={(e) => setForm({ ...form, theaterName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Date</label>
                  <input
                    type="date"
                    className="field"
                    value={form.showDate}
                    onChange={(e) => setForm({ ...form, showDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Time</label>
                  <input
                    type="time"
                    className="field"
                    value={form.showTime}
                    onChange={(e) => setForm({ ...form, showTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Ticket Price (₹)</label>
                  <input
                    type="number"
                    className="field"
                    value={form.ticketPrice}
                    onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-2">Format</label>
                  <input
                    className="field"
                    placeholder="2D, 3D, IMAX"
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button disabled={loading} className="btn-primary w-full py-4 mt-4">
                {loading ? "Scheduling..." : editingId ? "Update Schedule" : "Confirm Show Timing"}
                <Plus size={20} className="ml-2" />
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn-secondary w-full py-4"
                  onClick={() => {
                    setEditingId("");
                    setForm(initialShow);
                  }}
                >
                  <X size={20} className="mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminShowsPage;
