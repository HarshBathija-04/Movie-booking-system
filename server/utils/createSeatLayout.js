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
    }))
  );

export default createSeatLayout;
