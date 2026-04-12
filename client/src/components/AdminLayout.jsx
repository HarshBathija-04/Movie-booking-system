import { BarChart3, CalendarClock, Clapperboard, ReceiptText, ArrowLeft, ShieldCheck } from "lucide-react";
import { NavLink, Link, Outlet } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/movies", label: "Manage Movies", icon: Clapperboard },
  { to: "/admin/shows", label: "Show Schedules", icon: CalendarClock },
  { to: "/admin/bookings", label: "Sales & Bookings", icon: ReceiptText },
];

const AdminLayout = () => {
  const activeClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 ${
      isActive 
        ? "bg-brand text-black shadow-lg shadow-brand/20 translate-x-1" 
        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="section-shell grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-8">
        <div className="flex flex-col gap-2 px-1">
           <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand/10 p-2 text-brand">
                 <ShieldCheck size={24} />
              </div>
              <h2 className="font-display text-4xl uppercase tracking-widest text-white">Central</h2>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted pl-1">Admin Management</p>
        </div>

        <nav className="flex flex-col gap-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={activeClass}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
           <Link 
            to="/" 
            className="flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all border border-white/5"
           >
             <ArrowLeft size={20} />
             Return to Marketplace
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main>
        <div className="glass-card min-h-[70vh] p-8 md:p-10 bg-white/[0.02] border-white/5">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
