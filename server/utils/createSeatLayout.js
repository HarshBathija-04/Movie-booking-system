const seatRows = [
  { row: "A", count: 10, category: "Regular" },
  { row: "B", count: 10, category: "Regular" },
  { row: "C", count: 10, category: "Regular" },
  { row: "D", count: 10, category: "Premium" },
  { row: "E", count: 10, category: "Premium" },
  { row: "F", count: 8, category: "Recliner" },
];

const createSeatLayout = () =>
  seatRows.flatMap(({ row, count, category }) =>
    Array.from({ length: count }, (_, index) => ({
      row,
      number: index + 1,
      seatNumber: `${row}${index + 1}`,
      category,
    })),
  );

/** Bulk-insert one seat row per layout entry for a show, in a single statement. */
export const insertSeats = (client, showId, layout) =>
  client.query(
    `INSERT INTO seats (show_id, row_label, number, seat_number, category)
     SELECT $1::int, * FROM unnest($2::text[], $3::int[], $4::text[], $5::text[])`,
    [
      showId,
      layout.map((s) => s.row),
      layout.map((s) => s.number),
      layout.map((s) => s.seatNumber),
      layout.map((s) => s.category),
    ],
  );

export default createSeatLayout;
