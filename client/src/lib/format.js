// Show dates/times arrive pre-formatted in cinema time (IST) as "YYYY-MM-DD" and "HH:MM".
const asDate = (ymd) => new Date(`${ymd}T00:00:00`);

export const formatDay = (ymd, opts = { weekday: "short", day: "numeric", month: "short" }) =>
  asDate(ymd).toLocaleDateString("en-IN", opts);

export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const formatRuntime = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;

export const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/** "Today" / "Tomorrow" / "Fri 14 Nov" relative to the cinema's calendar. */
export const dayLabel = (ymd) => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const tomorrow = new Date(Date.now() + 864e5).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  if (ymd === today) return "Today";
  if (ymd === tomorrow) return "Tomorrow";
  return formatDay(ymd);
};

/** "Screen 2 · 3D", or just "IMAX" when the screen and format share a name. */
export const screenLabel = (show) =>
  show.format && show.format !== show.screenName ? `${show.screenName} · ${show.format}` : show.screenName;
