import { describe, it, expect } from "vitest";
import { validateB2BContact } from "@/lib/b2b-form";

describe("validateB2BContact", () => {
  it("requires a WhatsApp number", () => {
    expect(validateB2BContact("", "")).toBe("Add your WhatsApp number so we can reach you");
    expect(validateB2BContact("   ", "")).toBe("Add your WhatsApp number so we can reach you");
  });

  it("accepts common WhatsApp formats", () => {
    expect(validateB2BContact("+260 97 1234567", "")).toBeNull();
    expect(validateB2BContact("+260971234567", "")).toBeNull();
    expect(validateB2BContact("(260) 971-234567", "")).toBeNull();
  });

  it("rejects malformed WhatsApp numbers", () => {
    expect(validateB2BContact("12345", "")).toBe("That WhatsApp number doesn't look right");
    expect(validateB2BContact("abc12345678", "")).toBe("That WhatsApp number doesn't look right");
  });

  it("allows an empty optional email", () => {
    expect(validateB2BContact("+260971234567", "")).toBeNull();
  });

  it("rejects a malformed optional email", () => {
    expect(validateB2BContact("+260971234567", "not-an-email")).toBe("Check the email address you entered");
  });

  it("accepts a well-formed optional email", () => {
    expect(validateB2BContact("+260971234567", "buyer@example.com")).toBeNull();
  });
});
