import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ErrorState, Poster, Skeleton } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { formatRuntime } from "../../lib/format";
import api, { errorMessage } from "../../services/api";

const EMPTY = {
  title: "",
  description: "",
  posterUrl: "",
  bannerUrl: "",
  trailerUrl: "",
  genres: "",
  language: "English",
  durationMinutes: 120,
  rating: 7.5,
  releaseDate: "",
  cast: "",
};

const FIELDS = [
  ["title", "Title", { required: true }],
  ["description", "Synopsis", { required: true, as: "textarea" }],
  ["genres", "Genres", { hint: "Comma separated, e.g. Action, Drama" }],
  ["cast", "Cast", { hint: "Comma separated" }],
  ["language", "Language", {}],
  ["durationMinutes", "Runtime (min)", { type: "number", min: 1, max: 600 }],
  ["rating", "Rating (0-10)", { type: "number", min: 0, max: 10, step: 0.1 }],
  ["releaseDate", "Release date", { type: "date" }],
  ["posterUrl", "Poster URL", { type: "url" }],
  ["bannerUrl", "Banner URL", { type: "url" }],
  ["trailerUrl", "Trailer URL", { type: "url" }],
];

const list = (v) =>
  v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function AdminMoviesPage() {
  const { data, error, loading, reload } = useFetch("/movies");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const edit = (m) => {
    setEditingId(m.id);
    setForm({
      ...EMPTY,
      ...m,
      genres: m.genres.join(", "),
      cast: m.cast.join(", "),
      posterUrl: m.posterUrl || "",
      bannerUrl: m.bannerUrl || "",
      trailerUrl: m.trailerUrl || "",
      releaseDate: m.releaseDate || "",
    });
    document.getElementById("movie-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, genres: list(form.genres), cast: list(form.cast) };
    delete payload.id;
    try {
      if (editingId) await api.put(`/movies/${editingId}`, payload);
      else await api.post("/movies", payload);
      toast.success(editingId ? "Film updated" : "Film added");
      reset();
      reload();
    } catch (err) {
      toast.error(errorMessage(err, "Could not save the film"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Archive "${m.title}"? It will disappear from listings; past bookings are kept.`)) return;
    try {
      await api.delete(`/movies/${m.id}`);
      toast.success("Film archived");
      if (editingId === m.id) reset();
      reload();
    } catch (err) {
      toast.error(errorMessage(err, "Could not archive the film"));
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-4xl">Films</h1>
        <p className="text-sm text-muted">Add, edit or archive titles in the programme.</p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <section aria-label="Film list">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <Skeleton className="h-96" />
          ) : (
            <ul className="card divide-y divide-line">
              {data.movies.map((m) => (
                <li key={m.id} className="flex items-center gap-4 p-3">
                  <div className="w-10 shrink-0 overflow-hidden rounded">
                    <Poster movie={m} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.title}</p>
                    <p className="truncate text-xs text-subtle">
                      {m.language} · {formatRuntime(m.durationMinutes)} · {m.rating}/10 · {m.upcomingShows} upcoming{" "}
                      {m.upcomingShows === 1 ? "show" : "shows"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => edit(m)}
                    aria-label={`Edit ${m.title}`}
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-sm hover:text-velvet"
                    onClick={() => remove(m)}
                    aria-label={`Archive ${m.title}`}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form id="movie-form" onSubmit={save} className="card space-y-4 p-5 xl:sticky xl:top-24">
          <h2 className="font-bold">{editingId ? "Edit film" : "Add a film"}</h2>
          {FIELDS.map(([name, label, { as, hint, ...rest }]) => {
            const Tag = as || "input";
            return (
              <div key={name}>
                <label htmlFor={`m-${name}`} className="label">
                  {label}
                </label>
                <Tag
                  id={`m-${name}`}
                  className={`field ${as === "textarea" ? "min-h-24" : ""}`}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  aria-describedby={hint ? `m-${name}-hint` : undefined}
                  {...rest}
                />
                {hint && (
                  <p id={`m-${name}-hint`} className="mt-1 text-xs text-subtle">
                    {hint}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                !editingId && <Plus aria-hidden className="size-4" />
              )}{" "}
              {editingId ? "Save changes" : "Add film"}
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
