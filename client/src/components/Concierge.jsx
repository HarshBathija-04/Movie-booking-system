import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import { Poster } from "./ui";

const SUGGESTIONS = [
  "Mind-bending sci-fi for date night",
  "Feel-good family film under 2.5 hours",
  "Something epic on the big screen",
];

export default function Concierge() {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState({ status: "idle" });

  const ask = async (text) => {
    const value = text.trim();
    if (value.length < 3) return;
    setPrompt(value);
    setState({ status: "loading" });
    try {
      const { data } = await api.post("/ai/recommend", { prompt: value });
      setState({ status: "done", ...data });
    } catch (err) {
      setState({ status: "error", message: errorMessage(err, "The concierge is unavailable right now") });
    }
  };

  return (
    <section aria-labelledby="concierge-title" className="card overflow-hidden">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Sparkles aria-hidden className="size-3.5" /> AI concierge
          </p>
          <h2 id="concierge-title" className="display mt-2 text-4xl">
            Not sure what to watch?
          </h2>
          <p className="mt-2 text-sm text-muted">
            Describe your mood, company or time budget and we&apos;ll pick from what&apos;s actually playing.
          </p>
          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              ask(prompt);
            }}
          >
            <label htmlFor="concierge-input" className="sr-only">
              What are you in the mood for?
            </label>
            <input
              id="concierge-input"
              className="field"
              value={prompt}
              maxLength={300}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. a thriller with my dad, nothing too long"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={state.status === "loading" || prompt.trim().length < 3}
            >
              {state.status === "loading" ? <Loader2 aria-hidden className="size-4 animate-spin" /> : "Ask"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip text-xs" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="min-h-40">
          {state.status === "idle" && (
            <div className="grid h-full place-items-center rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-subtle">
              Your three picks will appear here.
            </div>
          )}
          {state.status === "loading" && (
            <ul className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <li key={i} className="skeleton h-40 sm:h-56" />
              ))}
            </ul>
          )}
          {state.status === "error" && (
            <p role="alert" className="rounded-xl border border-velvet/30 bg-velvet/5 p-4 text-sm text-velvet">
              {state.message}
            </p>
          )}
          {state.status === "done" && (
            <>
              {state.summary && <p className="mb-3 text-sm text-muted">{state.summary}</p>}
              {state.picks.length ? (
                <ul className="grid gap-3 sm:grid-cols-3">
                  {state.picks.map((p) => (
                    <li key={p.movieId}>
                      <Link
                        to={`/movies/${p.movieId}`}
                        className="group flex h-full gap-3 rounded-xl border border-line bg-raised p-3 transition hover:border-marquee/60 sm:flex-col"
                      >
                        <div className="w-16 shrink-0 overflow-hidden rounded-md sm:w-full">
                          <Poster movie={{ id: p.movieId, title: p.title, posterUrl: p.posterUrl }} />
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center justify-between gap-2 font-bold group-hover:text-marquee">
                            {p.title} <ArrowRight aria-hidden className="size-4 shrink-0" />
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted">{p.reason}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No good match tonight - try describing it differently.</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
