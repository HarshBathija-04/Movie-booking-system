import { CalendarClock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { formatDay, formatMoney, formatTime } from "../../lib/format";
import api, { errorMessage } from "../../services/api";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const EMPTY = {
  movieId: "",
  theaterName: "CineVerse Aditya",
  screenName: "Screen 1",
  showDate: today(),
  showTime: "18:30",
  ticketPrice: 200,
  totalSeats: 58,
  format: "2D",
};

export default function AdminShowsPage() {
  const movies = useFetch("/movies");
  const shows = useFetch("/shows");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const reset = () => {
    setForm({ ...EMPTY, showDate: today() });
    setEditingId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { movieId: _m, totalSeats: _t, ...rest } = form;
        await api.put(`/shows/${editingId}`, rest);
      } else {
        await api.post("/shows", form);
      }
      toast.success(editingId ? "Showtime updated" : "Showtime scheduled");
      reset();
      shows.reload();
    } catch (err) {
      toast.error(errorMessage(err, "Could not save the showtime"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete the ${formatTime(s.showTime)} show of ${s.movieTitle}?`)) return;
    try {
      await api.delete(`/shows/${s.id}`);
      toast.success("Showtime deleted");
      shows.reload();
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the showtime"));
    }
  };

  const error = movies.error || shows.error;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-4xl">Showtimes</h1>
        <p className="text-sm text-muted">Times are cinema local time (IST). Shows with bookings cannot be deleted.</p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section aria-label="Scheduled shows">
          {error ? (
            <ErrorState message={error} onRetry={() => (movies.reload(), shows.reload())} />
          ) : shows.loading ? (
            <Skeleton className="h-96" />
          ) : shows.data.shows.length ? (
            <ul className="card max-h-[70vh] divide-y divide-line overflow-y-auto">
              {shows.data.shows.map((s) => (
                <li key={s.id} className="flex items-center gap-4 p-3">
                  <div className="w-24 shrink-0 text-sm">
                    <p className="font-bold tabular-nums">{formatTime(s.showTime)}</p>
                    <p className="text-xs text-subtle">{formatDay(s.showDate)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.movieTitle}</p>
                    <p className="truncate text-xs text-subtle">
                      {s.screenName} · {s.format} · {formatMoney(s.ticketPrice)} · {s.bookedSeatsCount}/{s.totalSeats}{" "}
                      sold
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    aria-label={`Edit ${s.movieTitle} at ${formatTime(s.showTime)}`}
                    onClick={() => {
                      setEditingId(s.id);
                      setForm({ ...EMPTY, ...s });
                      document.getElementById("show-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-sm hover:text-velvet"
                    aria-label={`Delete ${s.movieTitle} at ${formatTime(s.showTime)}`}
                    onClick={() => remove(s)}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarClock} title="Nothing scheduled">
              Add the first showtime with the form.
            </EmptyState>
          )}
        </section>

        <form id="show-form" onSubmit={save} className="card space-y-4 p-5 xl:sticky xl:top-24">
          <h2 className="font-bold">{editingId ? "Edit showtime" : "Schedule a show"}</h2>
          <div>
            <label htmlFor="s-movie" className="label">
              Film
            </label>
            <select
              id="s-movie"
              className="field"
              required
              value={form.movieId}
              onChange={set("movieId")}
              disabled={Boolean(editingId)}
            >
              <option value="">Choose a film</option>
              {movies.data?.movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["showDate", "Date", { type: "date" }],
              ["showTime", "Time", { type: "time" }],
              ["screenName", "Screen", {}],
              ["format", "Format", {}],
              ["ticketPrice", "Base price (₹)", { type: "number", min: 0 }],
              ["totalSeats", "Seats", { type: "number", min: 1, max: 58, disabled: Boolean(editingId) }],
            ].map(([k, label, props]) => (
              <div key={k}>
                <label htmlFor={`s-${k}`} className="label">
                  {label}
                </label>
                <input id={`s-${k}`} className="field" required value={form[k]} onChange={set(k)} {...props} />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="s-theater" className="label">
              Cinema
            </label>
            <input id="s-theater" className="field" required value={form.theaterName} onChange={set("theaterName")} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                !editingId && <Plus aria-hidden className="size-4" />
              )}{" "}
              {editingId ? "Save changes" : "Schedule show"}
            </button>
            {editingId && (
              <button type="button" className="btn-outline" onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
