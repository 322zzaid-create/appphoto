import { describe, expect, it } from "vitest";
import { expandQuery, normalizeArabic } from "@/lib/search/query-expansion";

describe("normalizeArabic", () => {
  it("lowercases and normalizes hamza/alef forms", () => {
    expect(normalizeArabic("أحمر")).toBe("احمر");
    expect(normalizeArabic("إسود")).toBe("اسود");
    expect(normalizeArabic("آزرق")).toBe("ازرق");
  });

  it("strips diacritics (tashkeel)", () => {
    expect(normalizeArabic("مُوسِيقَى")).toBe("موسيقي");
  });

  it("normalizes teh marbuta and alef maqsura", () => {
    expect(normalizeArabic("طبيعة")).toBe("طبيعه");
    expect(normalizeArabic("موسيقى")).toBe("موسيقي");
  });
});

describe("expandQuery", () => {
  it("translates an Arabic query to English terms", () => {
    const terms = expandQuery("حيوانات");
    expect(terms).toContain("حيوانات");
    expect(terms).toContain("animal");
    expect(terms).toContain("animals");
    expect(terms).toContain("fauna");
  });

  it("translates an English query to Arabic terms", () => {
    const terms = expandQuery("animal");
    expect(terms).toContain("حيوانات");
    expect(terms).toContain("حيوان");
    expect(terms).toContain("animals");
  });

  it("adds synonyms for the matched concept", () => {
    const terms = expandQuery("car");
    expect(terms).toContain("automobile");
    expect(terms).toContain("vehicle");
    expect(terms).toContain("سيارة");
    expect(terms).toContain("سيارات");
  });

  it("handles Arabic queries written with hamza", () => {
    const terms = expandQuery("أحمر");
    expect(terms).toContain("احمر");
    expect(terms).toContain("أحمر");
    expect(terms).toContain("red");
  });

  it("expands multi-word concepts (كرة قدم)", () => {
    const terms = expandQuery("كرة قدم");
    expect(terms).toContain("football");
    expect(terms).toContain("soccer");
  });

  it("keeps unknown words as-is", () => {
    const terms = expandQuery("zzzqxq");
    expect(terms).toEqual(["zzzqxq"]);
  });

  it("returns an empty array for an empty query", () => {
    expect(expandQuery("")).toEqual([]);
    expect(expandQuery("   ")).toEqual([]);
  });

  it("caps the number of expanded terms", () => {
    const terms = expandQuery("animal car space", 6);
    expect(terms.length).toBeLessThanOrEqual(6);
  });

  it("deduplicates expanded terms", () => {
    const terms = expandQuery("سيارة car");
    const set = new Set(terms);
    expect(set.size).toBe(terms.length);
  });
});
