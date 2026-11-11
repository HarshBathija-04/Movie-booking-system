import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { errorMessage } from "../services/api";

const PERKS = [
  "Pick exact seats on a live seat map that locks the moment you pay.",
  "QR tickets for every booking, saved to your wallet.",
  "An AI concierge that picks tonight’s film for you.",
];

const DEMO = { emailOrPhone: "demo@cineverse.app", password: "demo1234" };

const FIELDS = {
  register: [
    { name: "name", label: "Full name", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", hint: "10-15 digits" },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      hint: "At least 8 characters",
    },
  ],
  login: [
    { name: "emailOrPhone", label: "Email or phone", autoComplete: "username" },
    { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
  ],
};

export default function AuthPage() {
  const { user, authenticate } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const target = location.state?.from || "/";

  if (user) return <Navigate to={target} replace />;

  const submit = async (payload) => {
    setSubmitting(true);
    setErrors({});
    try {
      const u = await authenticate(mode, payload);
      navigate(u.role === "admin" && target === "/" ? "/admin" : target, { replace: true });
    } catch (err) {
      const details = err.response?.data?.error?.details;
      if (details) setErrors(Object.fromEntries(details.map((d) => [d.path, d.message])));
      toast.error(errorMessage(err, mode === "login" ? "Couldn't sign you in" : "Couldn't create your account"));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
  };

  return (
    <div className="page grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <p className="eyebrow">Members get</p>
        <h1 className="display mt-2 text-7xl">
          Your seat is
          <br />
          <span className="text-marquee">waiting.</span>
        </h1>
        <ul className="mt-8 space-y-3 text-muted">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-marquee" /> {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
        <h2 className="display text-4xl">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p className="mt-1 text-sm text-muted">
          {mode === "login"
            ? "Welcome back. Your tickets are right where you left them."
            : "Four fields, then you are picking seats."}
        </p>

        <form
          className="mt-6 space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit(Object.fromEntries(FIELDS[mode].map((f) => [f.name, form[f.name] || ""])));
          }}
        >
          {FIELDS[mode].map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className="label">
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type || "text"}
                autoComplete={f.autoComplete}
                required
                className="field"
                value={form[f.name] || ""}
                aria-invalid={Boolean(errors[f.name])}
                aria-describedby={errors[f.name] ? `${f.name}-error` : f.hint ? `${f.name}-hint` : undefined}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
              {errors[f.name] ? (
                <p id={`${f.name}-error`} className="field-error">
                  {errors[f.name]}
                </p>
              ) : (
                f.hint && (
                  <p id={`${f.name}-hint`} className="mt-1.5 text-xs text-subtle">
                    {f.hint}
                  </p>
                )
              )}
            </div>
          ))}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "login" && (
          <button type="button" className="btn-outline mt-3 w-full" disabled={submitting} onClick={() => submit(DEMO)}>
            <Sparkles aria-hidden className="size-4 text-marquee" /> Continue with the demo account
          </button>
        )}

        <p className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
          {mode === "login" ? "New to CineVerse?" : "Already have an account?"}{" "}
          <button type="button" onClick={switchMode} className="font-semibold text-marquee hover:underline">
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
