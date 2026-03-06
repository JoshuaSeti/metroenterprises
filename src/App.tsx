import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AccountPage from "./pages/AccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SupportPage from "./pages/SupportPage";
import CategoriesPage from "./pages/CategoriesPage";
import WishlistPage from "./pages/WishlistPage";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAuthPage from "./pages/admin/AdminAuthPage";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminCarousel from "./pages/admin/AdminCarousel";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/auth" element={<Navigate to="/signin" replace />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/influencer" element={<InfluencerDashboard />} />
              <Route path="/admin/login" element={<AdminAuthPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="promo-codes" element={<AdminPromoCodes />} />
                <Route path="discounts" element={<AdminPlaceholder title="Discounts" />} />
                <Route path="campaigns" element={<AdminPlaceholder title="Campaigns" />} />
                <Route path="carousel" element={<AdminPlaceholder title="Carousel" />} />
                <Route path="users" element={<AdminPlaceholder title="Users" />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
