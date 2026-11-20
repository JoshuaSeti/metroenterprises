import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import CartPage from "@/pages/CartPage";

const mocks = vi.hoisted(() => ({
  available: true as boolean | undefined,
  prepare: vi.fn(),
  manual: vi.fn(),
  clear: vi.fn(),
}));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/hooks/use-auth", () => ({ useAuth: () => ({ user: { id: "buyer" } }) }));
vi.mock("@/hooks/use-cart", () => ({ useCart: () => ({
  items: [{ id: "phone", name: "Phone", price: 100, quantity: 2 }], total: 200,
  updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: mocks.clear,
}) }));
vi.mock("@/hooks/use-store-data", () => ({
  useValidatePromoCode: () => ({ mutate: vi.fn() }),
  useCreateOrder: () => ({ mutate: mocks.manual, isPending: false }),
}));
vi.mock("@/hooks/use-bila", () => ({
  useBilaAvailability: () => ({ data: mocks.available === undefined ? undefined : { available: mocks.available }, isLoading: mocks.available === undefined }),
  usePrepareBila: () => ({ mutate: mocks.prepare, isPending: false }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); mocks.available = true; });

describe("Bila-only checkout", () => {
  it("prepares new orders exclusively through Bila", () => {
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("Enter your full address"), { target: { value: "Lusaka" } });
    fireEvent.click(screen.getByRole("button", { name: "Place Order" }));
    expect(mocks.prepare).toHaveBeenCalledWith(expect.objectContaining({ address: "Lusaka", items: [{ product_id: "phone", quantity: 2 }] }), expect.any(Object));
    expect(mocks.manual).not.toHaveBeenCalled();
  });

  it.each([false, undefined])("does not fall back to manual orders when Bila availability is %s", available => {
    mocks.available = available;
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("Enter your full address"), { target: { value: "Lusaka" } });
    const checkout = screen.getByRole("button", { name: available === undefined ? "Checking payment availability..." : "Place Order" });
    expect(checkout).toBeDisabled();
    fireEvent.click(checkout);
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(mocks.manual).not.toHaveBeenCalled();
    expect(mocks.clear).not.toHaveBeenCalled();
  });
});