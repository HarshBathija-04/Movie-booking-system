import { describe, expect, it } from "vitest";
import { formatMoney, formatRuntime, formatTime } from "./format";

describe("format helpers", () => {
  it("formats 24h showtimes as 12h", () => {
    expect(formatTime("00:05")).toBe("12:05 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("22:30")).toBe("10:30 PM");
  });

  it("formats runtime and rupees", () => {
    expect(formatRuntime(148)).toBe("2h 28m");
    expect(formatRuntime(60)).toBe("1h 00m");
    expect(formatMoney(1250)).toBe("₹1,250");
    expect(formatMoney(null)).toBe("₹0");
  });
});
