export interface CollectionExpectation {
  reference: string;
  amount: number;
  currency: "ZMW";
}

export function canAccessBilaPayment(action: "start" | "status", ownerId: string, requesterId: string, isAdmin: boolean): boolean {
  return ownerId === requesterId || (action === "status" && isAdmin);
}

export function normalizeBilaPhone(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, "");
  const local = compact.replace(/^\+?260/, "0");
  return /^0[79]\d{8}$/.test(local) ? local : null;
}

// Return only documented fields needed for verification, never raw provider responses.
export function verifiedCollectionState(response: unknown, expected: CollectionExpectation):
  "successful" | "pending" | "failed" | "needs_assistance" | null {
  if (!response || typeof response !== "object" || !("status" in response) || response.status !== true || !("data" in response)) return null;
  const data = response.data;
  if (!data || typeof data !== "object" || !("reference" in data) || !("amount" in data) || !("currency" in data) || !("status" in data)) return null;
  if (data.reference !== expected.reference || data.currency !== expected.currency ||
    (typeof data.amount !== "number" && typeof data.amount !== "string")) return null;
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount !== expected.amount) return null;
  if (data.status === "successful" || data.status === "pending" || data.status === "failed") return data.status;
  if (data.status === "otp-required" || data.status === "pay-offline") return "needs_assistance";
  return null;
}