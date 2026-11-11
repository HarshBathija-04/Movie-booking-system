import { CalendarClock, Clapperboard, IndianRupee, ReceiptText, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import { ErrorState, Skeleton } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { formatMoney } from "../../lib/format";
import { BookingsTable } from "./AdminBookingsPage";

export default function AdminDashboardPage() {
  const { data, error, loading, reload } = useFetch("/admin/dashboard");

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const s = data?.stats;
  const tiles = s && [
    ["Revenue", formatMoney(s.totalRevenue), IndianRupee],
    ["Tickets sold", s.totalTicketsSold.toLocaleString("en-IN"), Ticket],
    ["Bookings", s.totalBookings.toLocaleString("en-IN"), ReceiptText],
    ["Upcoming shows", s.totalShows, CalendarClock],
    ["Active films", s.totalMovies, Clapperboard],
    ["Customers", s.totalUsers, Users],
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="display text-4xl">Overview</h1>
        <p className="text-sm text-muted">Sales and schedule at a glance.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {loading || !tiles
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)
          : tiles.map(([label, value, icon]) => <StatCard key={label} label={label} value={value} icon={icon} />)}
      </div>
      <section aria-labelledby="recent">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent" className="font-bold">
            Recent bookings
          </h2>
          <Link to="../bookings" className="btn-ghost btn-sm">
            View all
          </Link>
        </div>
        {data ? <BookingsTable bookings={data.recentBookings} /> : <Skeleton className="h-64" />}
      </section>
    </div>
  );
}
