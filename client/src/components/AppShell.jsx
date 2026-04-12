import { Film, LogOut, Ticket, User as UserIcon } from "lucide-react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const AppShell = () => {
  const { logout, user } = useAppContext();

  const activeClass = ({ isActive }) => 
    `transition-all duration-300 font-bold tracking-tight ${
      isActive ? 'text-brand-soft' : 'text-white/60 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen flex-col selection:bg-brand/30 selection:text-brand-soft">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050507]/60 backdrop-blur-2xl">
        <div className="section-shell flex items-center justify-between gap-4 py-3 md:py-4">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="relative overflow-hidden rounded-2xl bg-brand/10 p-2.5 text-brand shadow-lg shadow-brand/10 group-hover:scale-110 transition-transform">
              <Film size={26} />
              <div className="absolute inset-0 bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl leading-none uppercase tracking-[0.2em] text-white">
                Cine<span className="text-brand">Verse</span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Aditya Cinemas</span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-10 text-sm font-title uppercase tracking-widest md:flex">
            <NavLink to="/" className={activeClass}>Home</NavLink>
            <NavLink to="/movies" className={activeClass}>Movies</NavLink>
            <NavLink to="/my-bookings" className={activeClass}>My Bookings</NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin/dashboard" className={activeClass}>Admin Panel</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="hidden text-right lg:block">
                  <p className="text-xs font-black uppercase tracking-tighter text-brand-soft">{user.role}</p>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={logout}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300" 
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <NavLink to="/auth" className="btn-primary group py-2.5 px-6">
                <Ticket size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-[#050507] py-12">
        <div className="section-shell">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:items-start md:gap-2">
                <div className="flex items-center gap-2">
                   <Film size={20} className="text-brand" />
                   <span className="font-display text-xl uppercase tracking-widest">CineVerse</span>
                </div>
                <p className="text-xs text-muted max-w-xs text-center md:text-left">
                  The ultimate cinema booking experience. Built for Aditya University MCA Graduate Project 2026.
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-6 md:items-end md:gap-4">
               <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-muted">
                  <Link to="/" className="hover:text-brand transition-colors">Privacy</Link>
                  <Link to="/" className="hover:text-brand transition-colors">Terms</Link>
                  <Link to="/" className="hover:text-brand transition-colors">Contact</Link>
               </div>
               <p className="text-[10px] font-bold text-brand uppercase tracking-tighter">
                MCA | Department of Computer Applications © 2026
               </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
