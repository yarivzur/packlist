import { describe, it, expect } from "vitest";
import { generateChecklist } from "./rules-engine";
import type { RulesInput } from "./rules-engine";

const baseInput: RulesInput = {
  tripType: "leisure",
  durationDays: 5,
  isInternational: false,
  baggage: "checked",
  weather: { bucket: "mild", rainProbability: 0.1, avgTempC: 18, fetchedAt: "" },
};

describe("generateChecklist", () => {
  it("always includes base items", () => {
    const items = generateChecklist(baseInput);
    const texts = items.map((i) => i.text);
    expect(texts.some((t) => t.toLowerCase().includes("phone"))).toBe(true);
    expect(texts.some((t) => t.toLowerCase().includes("toothbrush"))).toBe(true);
  });

  it("adds international travel items for international trips", () => {
    const items = generateChecklist({ ...baseInput, isInternational: true });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).toContain("passport");
    expect(sourceRules).toContain("travel-insurance");
    expect(sourceRules).toContain("esim");
  });

  it("does NOT add international items for domestic trips", () => {
    const items = generateChecklist({ ...baseInput, isInternational: false });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).not.toContain("travel-insurance");
    expect(sourceRules).not.toContain("esim");
  });

  it("adds business items for business trips", () => {
    const items = generateChecklist({ ...baseInput, tripType: "business" });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).toContain("laptop");
    expect(sourceRules).toContain("laptop-charger");
    expect(sourceRules).toContain("formal-outfit");
  });

  it("adds umbrella when rain probability > 35%", () => {
    const items = generateChecklist({
      ...baseInput,
      weather: { bucket: "mild", rainProbability: 0.5, avgTempC: 15, fetchedAt: "" },
    });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).toContain("umbrella");
  });

  it("does NOT add umbrella when rain probability is low", () => {
    const items = generateChecklist({
      ...baseInput,
      weather: { bucket: "mild", rainProbability: 0.2, avgTempC: 18, fetchedAt: "" },
    });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).not.toContain("umbrella");
  });

  it("adds warm layers for cold weather", () => {
    const items = generateChecklist({
      ...baseInput,
      weather: { bucket: "cold", rainProbability: 0.1, avgTempC: 2, fetchedAt: "" },
    });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).toContain("warm-coat");
    expect(sourceRules).toContain("warm-layers");
  });

  it("adds sunscreen and swimwear for hot weather", () => {
    const items = generateChecklist({
      ...baseInput,
      weather: { bucket: "hot", rainProbability: 0.05, avgTempC: 32, fetchedAt: "" },
    });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).toContain("sunscreen");
    expect(sourceRules).toContain("swimwear");
  });

  it("removes bulky items (warm-coat, swimwear) for carry-on", () => {
    const items = generateChecklist({
      ...baseInput,
      baggage: "carry-on",
      weather: { bucket: "cold", rainProbability: 0.0, avgTempC: 5, fetchedAt: "" },
    });
    const sourceRules = items.map((i) => i.sourceRule);
    expect(sourceRules).not.toContain("warm-coat");
    expect(sourceRules).toContain("warm-layers");
  });

  it("returns no duplicate items", () => {
    const items = generateChecklist({
      ...baseInput,
      tripType: "mixed",
      isInternational: true,
      weather: { bucket: "cold", rainProbability: 0.6, avgTempC: 3, fetchedAt: "" },
    });
    const ids = items.map((i) => i.sourceRule);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("items are sorted by priority (ascending)", () => {
    const items = generateChecklist(baseInput);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].priority).toBeGreaterThanOrEqual(items[i - 1].priority);
    }
  });

  it("handles null weather gracefully", () => {
    const items = generateChecklist({ ...baseInput, weather: null });
    expect(items.length).toBeGreaterThan(0);
  });
});
