import { BarChart3, CalendarClock, Clapperboard, ReceiptText } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "dashboard", label: "Overview", icon: BarChart3 },
  { to: "movies", label: "Films", icon: Clapperboard },
  { to: "shows", label: "Showtimes", icon: CalendarClock },
  { to: "bookings", label: "Bookings", icon: ReceiptText },
];

const linkClass = ({ isActive }) =>
  `inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold transition ${
    isActive ? "bg-marquee/10 text-marquee" : "text-muted hover:bg-raised hover:text-copy"
  }`;

export default function AdminLayout() {
  return (
    <div className="page grid gap-8 py-8 lg:grid-cols-[200px_1fr]">
      <aside>
        <p className="eyebrow mb-3 px-3">Admin console</p>
        <nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon aria-hidden className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
