import { describe, it, expect } from "vitest";
import { calculateReminderTimes } from "./schedule";

describe("calculateReminderTimes", () => {
  it("returns 5 reminder types", () => {
    const schedules = calculateReminderTimes("2025-12-25", "UTC");
    const types = schedules.map((s) => s.type);
    expect(types).toContain("72h");
    expect(types).toContain("48h");
    expect(types).toContain("24h");
    expect(types).toContain("12h");
    expect(types).toContain("leave");
  });

  it("72h reminder is before 48h", () => {
    const schedules = calculateReminderTimes("2025-12-25", "UTC");
    const r72 = schedules.find((s) => s.type === "72h")!;
    const r48 = schedules.find((s) => s.type === "48h")!;
    expect(r72.sendAt.getTime()).toBeLessThan(r48.sendAt.getTime());
  });

  it("48h reminder is before 24h", () => {
    const schedules = calculateReminderTimes("2025-12-25", "UTC");
    const r48 = schedules.find((s) => s.type === "48h")!;
    const r24 = schedules.find((s) => s.type === "24h")!;
    expect(r48.sendAt.getTime()).toBeLessThan(r24.sendAt.getTime());
  });

  it("leave reminder is closest to departure", () => {
    const schedules = calculateReminderTimes("2025-12-25", "UTC");
    const leave = schedules.find((s) => s.type === "leave")!;
    const r12 = schedules.find((s) => s.type === "12h")!;
    expect(leave.sendAt.getTime()).toBeGreaterThan(r12.sendAt.getTime());
  });

  it("72h reminder is exactly 70 hours before 12h reminder", () => {
    const schedules = calculateReminderTimes("2025-12-25", "UTC");
    const r72 = schedules.find((s) => s.type === "72h")!;
    const r12 = schedules.find((s) => s.type === "12h")!;
    const diffHours = (r12.sendAt.getTime() - r72.sendAt.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(60); // 72h - 12h = 60h apart
  });

  it("all reminders have valid Date objects", () => {
    const schedules = calculateReminderTimes("2026-06-15", "America/New_York");
    for (const s of schedules) {
      expect(s.sendAt).toBeInstanceOf(Date);
      expect(isNaN(s.sendAt.getTime())).toBe(false);
    }
  });
});
