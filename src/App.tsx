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
import RewardsPage from "./pages/RewardsPage";
import GroupBuysPage from "./pages/GroupBuysPage";
import GroupBuyCatalogPage from "./pages/GroupBuyCatalogPage";
import GroupBuyProductPage from "./pages/GroupBuyProductPage";
import GroupBuyDetailPage from "./pages/GroupBuyDetailPage";
import B2BPage from "./pages/B2BPage";
import B2BChatPage from "./pages/B2BChatPage";
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
import AdminRewards from "./pages/admin/AdminRewards";
import AdminGroupBuys from "./pages/admin/AdminGroupBuys";
import AdminB2B from "./pages/admin/AdminB2B";
import AdminSettings from "./pages/admin/AdminSettings";

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
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/shop/group-buys" element={<GroupBuysPage />} />
              <Route path="/shop/group-buys/catalog" element={<GroupBuyCatalogPage />} />
              <Route path="/shop/group-buys/product/:slug" element={<GroupBuyProductPage />} />
              <Route path="/group-buy/:key" element={<GroupBuyDetailPage />} />
              <Route path="/group-buys" element={<Navigate to="/shop/group-buys" replace />} />
              <Route path="/b2b" element={<B2BPage />} />
              <Route path="/b2b/:id" element={<B2BChatPage />} />
              <Route path="/influencer" element={<InfluencerDashboard />} />
              <Route path="/admin/login" element={<AdminAuthPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="promo-codes" element={<AdminPromoCodes />} />
                <Route path="discounts" element={<AdminDiscounts />} />
                <Route path="campaigns" element={<AdminCampaigns />} />
                <Route path="carousel" element={<AdminCarousel />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="rewards" element={<AdminRewards />} />
                <Route path="group-buys" element={<AdminGroupBuys />} />
                <Route path="b2b" element={<AdminB2B />} />
                <Route path="settings" element={<AdminSettings />} />
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
