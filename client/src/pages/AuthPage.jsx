import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Lock, Mail, Phone, User, ArrowRight, ShieldCheck } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  emailOrPhone: "",
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = location.state?.from || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = isLogin
        ? await login({
            emailOrPhone: form.emailOrPhone,
            password: form.password,
          })
        : await register({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          });

      navigate(user.role === "admin" ? "/admin/dashboard" : redirectTarget);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-shell flex min-h-[calc(100vh-100px)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-[1fr_420px]">
        {/* Left Side: Branding/Info */}
        <div className="hidden flex-col justify-center lg:flex">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand/10 border border-brand/20 px-4 py-1.5 text-xs font-bold tracking-widest text-brand-soft uppercase">
            <ShieldCheck size={14} />
            Secure Authentication
          </div>
          <h1 className="font-display text-8xl uppercase tracking-tighter leading-[0.85] text-white">
            Access the <br /> <span className="text-brand">Verse.</span>
          </h1>
          <p className="mt-8 max-w-md text-xl leading-relaxed text-muted">
            {isLogin 
              ? "Sign in to manage your bookings, discover new releases, and get personalized recommendations."
              : "Join our community of movie lovers. Create an account to start booking seats for the biggest blockbusters."}
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
               <div className="rounded-xl bg-white/5 p-3 border border-white/10 text-brand">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <h4 className="font-title font-bold text-white">Security First</h4>
                  <p className="text-sm text-muted">Your password is encrypted and never stored in plain text.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="glass-card flex flex-col p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-display text-4xl uppercase tracking-wider">
              {isLogin ? "Welcome Back" : "Register Now"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isLogin ? "Sign in to your CineVerse account" : "Get started with your free account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute top-1/2 left-5 -translate-y-1/2 text-muted" size={18} />
                  <input
                    className="field field-with-icon"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-5 -translate-y-1/2 text-muted" size={18} />
                  <input
                    className="field field-with-icon"
                    placeholder="Email address"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-5 -translate-y-1/2 text-muted" size={18} />
                  <input
                    className="field field-with-icon"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div className="relative">
                <Mail className="absolute top-1/2 left-5 -translate-y-1/2 text-muted" size={18} />
                <input
                  className="field field-with-icon"
                  placeholder="Email or phone"
                  value={form.emailOrPhone}
                  onChange={(event) => setForm({ ...form, emailOrPhone: event.target.value })}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute top-1/2 left-5 -translate-y-1/2 text-muted" size={18} />
              <input
                className="field field-with-icon"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>

            <button disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? "Processing..." : isLogin ? "Login Account" : "Create Account"}
              <ArrowRight size={18} className="ml-2" />
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="ml-2 font-bold text-brand-soft hover:underline"
                onClick={() => setIsLogin((prev) => !prev)}
              >
                {isLogin ? "Register here" : "Login instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
