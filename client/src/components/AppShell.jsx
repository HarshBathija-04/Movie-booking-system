import { LayoutDashboard, LogOut, Menu, Ticket, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { WakingBanner } from "./ui";

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "text-marquee" : "text-muted hover:text-copy"}`;

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5" aria-label="CineVerse home">
    <span className="grid size-9 place-items-center rounded-lg bg-marquee text-marquee-ink">
      <Ticket aria-hidden className="size-5 -rotate-12" strokeWidth={2.5} />
    </span>
    <span className="display text-2xl tracking-[0.08em]">
      Cine<span className="text-marquee">Verse</span>
    </span>
  </Link>
);

export default function AppShell() {
  const { user, logout } = useAppContext();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => window.scrollTo(0, 0), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = (
    <>
      <NavLink to="/movies" className={navClass}>
        Movies
      </NavLink>
      <NavLink to="/my-bookings" className={navClass}>
        My bookings
      </NavLink>
      {user?.role === "admin" && (
        <NavLink to="/admin" className={navClass}>
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
      >
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-ink/80 backdrop-blur-lg">
        <div className="page flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                <span className="text-sm text-muted">
                  Hi, <span className="font-semibold text-copy">{user.name.split(" ")[0]}</span>
                </span>
                <button type="button" onClick={logout} className="btn-ghost btn-sm" aria-label="Sign out">
                  <LogOut aria-hidden className="size-4" /> Sign out
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary btn-sm hidden md:inline-flex">
                Sign in
              </Link>
            )}
            <button
              type="button"
              className="btn-ghost btn-sm md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="page flex flex-col gap-1 border-t border-line pt-2 pb-4 md:hidden"
            onClick={(e) => e.target.closest("a, button") && setOpen(false)}
          >
            {links}
            {user ? (
              <button type="button" onClick={logout} className="btn-outline mt-2 w-full">
                <LogOut aria-hidden className="size-4" /> Sign out
              </button>
            ) : (
              <Link to="/auth" className="btn-primary mt-2 w-full">
                Sign in
              </Link>
            )}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="no-print mt-20 border-t border-line">
        <div className="page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Logo />
            <p className="max-w-sm text-sm text-subtle">
              Pick a film, pick your seats, get a QR ticket. Payments are simulated for this demo.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link to="/movies" className="hover:text-copy">
              Now showing
            </Link>
            <Link to="/my-bookings" className="hover:text-copy">
              My bookings
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="inline-flex items-center gap-1 hover:text-copy">
                <LayoutDashboard aria-hidden className="size-4" /> Admin
              </Link>
            )}
            <a
              href="https://github.com/HarshBathija-04/Movie-booking-system"
              className="hover:text-copy"
              rel="noreferrer"
              target="_blank"
            >
              Source on GitHub
            </a>
          </nav>
        </div>
      </footer>
      <WakingBanner />
    </div>
  );
}
