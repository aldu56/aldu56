import { describe, expect, it } from "vitest";
import { computeTotals, PRODUCTS, SHIPPING_FLAT_CENTS } from "@/lib/catalog";
import { checkoutSchema, deviceTypeFromSerial, normalizeSerial, pairDeviceSchema, signupSchema } from "@/lib/validation";

describe("catalog", () => {
  it("has unique slugs", () => {
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
  });
  it("charges shipping under the free threshold only", () => {
    const small = computeTotals([{ slug: "balance-gel-cleanser", quantity: 1 }]);
    expect(small.shipping).toBe(SHIPPING_FLAT_CENTS);
    expect(small.total).toBe(3200 + SHIPPING_FLAT_CENTS);
    const big = computeTotals([{ slug: "eloria-smart-mirror", quantity: 1 }]);
    expect(big.shipping).toBe(0);
    expect(big.total).toBe(49900);
  });
  it("rejects unknown products", () => {
    expect(() => computeTotals([{ slug: "fake", quantity: 1 }])).toThrow();
  });
});

describe("serials", () => {
  it("normalizes and detects device types", () => {
    expect(normalizeSerial("elm demo 0001")).toBe("ELM-DEMO-0001");
    expect(normalizeSerial("elc-demo-0002")).toBe("ELC-DEMO-0002");
    expect(deviceTypeFromSerial("ELM-DEMO-0001")).toBe("mirror");
    expect(deviceTypeFromSerial("ELC-DEMO-0001")).toBe("comb");
    expect(deviceTypeFromSerial("XYZ-1")).toBeNull();
  });
  it("validates the pairing form", () => {
    expect(pairDeviceSchema.safeParse({ serial: "elmdemo0003" }).success).toBe(true);
    expect(pairDeviceSchema.safeParse({ serial: "ELX-DEMO-0003" }).success).toBe(false);
  });
});

describe("forms", () => {
  it("requires matching strong passwords and terms", () => {
    const ok = { fullName: "Ana Lopez", email: "ana@example.com", password: "Beauty2026", confirmPassword: "Beauty2026", acceptTerms: true };
    expect(signupSchema.safeParse(ok).success).toBe(true);
    expect(signupSchema.safeParse({ ...ok, confirmPassword: "x" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...ok, password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...ok, acceptTerms: false }).success).toBe(false);
  });
  it("caps checkout quantities", () => {
    const base = { shippingName: "Ana", shippingAddress: "1 Rue de la Paix", shippingCity: "Paris", shippingPostalCode: "75002", shippingCountry: "France" };
    expect(checkoutSchema.safeParse({ ...base, items: [{ slug: "eloria-duo", quantity: 1 }] }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...base, items: [{ slug: "eloria-duo", quantity: 99 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false);
  });
});
