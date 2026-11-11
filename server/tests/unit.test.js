import { describe, expect, it } from "vitest";
import { parsePicks } from "../controllers/aiController.js";
import createSeatLayout from "../utils/createSeatLayout.js";
import { categoryPrices, priceFor, totalFor } from "../utils/pricing.js";

describe("pricing", () => {
  it("applies tier multipliers and rounds", () => {
    expect(categoryPrices(200)).toEqual({ Regular: 200, Premium: 250, Recliner: 320 });
    expect(priceFor(199, "Premium")).toBe(249);
    expect(priceFor(100, "Unknown")).toBe(100);
  });

  it("totals a mixed selection", () => {
    expect(totalFor(200, [{ category: "Regular" }, { category: "Recliner" }])).toBe(520);
    expect(totalFor(200, [])).toBe(0);
  });
});

describe("seat layout", () => {
  it("has unique seat numbers across all tiers", () => {
    const layout = createSeatLayout();
    expect(new Set(layout.map((s) => s.seatNumber)).size).toBe(layout.length);
    expect(new Set(layout.map((s) => s.category))).toEqual(new Set(["Regular", "Premium", "Recliner"]));
  });
});

describe("parsePicks", () => {
  const movies = [
    { id: 1, title: "Inception", posterUrl: "p1" },
    { id: 2, title: "Dangal", posterUrl: null },
  ];

  it("keeps only known movies, dedupes and caps reasons", () => {
    const text = JSON.stringify({
      summary: "Two picks",
      picks: [
        { movieId: 1, reason: "Dreams" },
        { movieId: "1", reason: "dupe" },
        { movieId: 99, reason: "hallucinated" },
        { movieId: 2, reason: "x".repeat(500) },
      ],
    });
    const out = parsePicks(text, movies);
    expect(out.summary).toBe("Two picks");
    expect(out.picks.map((p) => p.movieId)).toEqual([1, 2]);
    expect(out.picks[1].reason).toHaveLength(280);
  });

  it("survives non-JSON model output", () => {
    expect(parsePicks("sorry, I cannot", movies)).toEqual({ summary: "", picks: [] });
  });
});
