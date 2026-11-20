import { describe, expect, it } from "vitest";
import { canAccessBilaPayment, normalizeBilaPhone, verifiedCollectionState } from "../../supabase/functions/_shared/bila-contract";

const expected = { reference: "dl-order-001", amount: 100, currency: "ZMW" as const };
const collection = (overrides: Record<string, unknown> = {}) => ({
  status: true, data: { reference: "dl-order-001", amount: 100, currency: "ZMW", status: "successful", ...overrides },
});

describe("Bila payment verification (no network or payment requests)", () => {
  it("allows buyers to request only their own payment", () => {
    expect(canAccessBilaPayment("start", "buyer-a", "buyer-a", false)).toBe(true);
    expect(canAccessBilaPayment("start", "buyer-a", "buyer-b", false)).toBe(false);
  });
  it("does not allow admins to request a buyer's payment", () => {
    expect(canAccessBilaPayment("start", "buyer-a", "admin-a", true)).toBe(false);
  });
  it("allows admins to check a buyer's payment status", () => {
    expect(canAccessBilaPayment("status", "buyer-a", "admin-a", true)).toBe(true);
  });
  it("does not allow a buyer to check someone else's payment", () => {
    expect(canAccessBilaPayment("status", "buyer-a", "buyer-b", false)).toBe(false);
  });
  it("accepts a successful matching collection", () => {
    expect(verifiedCollectionState(collection(), expected)).toBe("successful");
  });
  it("rejects a different order reference", () => {
    expect(verifiedCollectionState(collection({ reference: "dl-order-002" }), expected)).toBeNull();
  });
  it("rejects non-Kwacha currency", () => {
    expect(verifiedCollectionState(collection({ currency: "USD" }), expected)).toBeNull();
  });
  it("rejects even a one-ngwee amount mismatch", () => {
    expect(verifiedCollectionState(collection({ amount: 99.99 }), expected)).toBeNull();
  });
  it("does not treat a pending collection as paid", () => {
    expect(verifiedCollectionState(collection({ status: "pending" }), expected)).toBe("pending");
  });
  it("does not treat an unsuccessful request as paid", () => {
    expect(verifiedCollectionState({ ...collection(), status: false }, expected)).toBeNull();
  });
  it("requires assistance rather than confirming an OTP request", () => {
    expect(verifiedCollectionState(collection({ status: "otp-required" }), expected)).toBe("needs_assistance");
  });
  it("accepts local and international Zambian phone formats", () => {
    expect(normalizeBilaPhone("+260 977 123 456")).toBe("0977123456");
    expect(normalizeBilaPhone("0977123456")).toBe("0977123456");
  });
  it("rejects an invalid Zambian mobile number", () => {
    expect(normalizeBilaPhone("12345")).toBeNull();
  });
});