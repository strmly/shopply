import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomeScreen } from './components/HomeScreen';
import { 
  ProfilePage, 
  EditProfilePage,
  ChangePasswordPage,
  NotificationSettingsPage,
  LanguageSettingsPage,
  ThemeSettingsPage,
  HelpCenterPage,
  HelpCategoryPage,
  HelpArticlePage,
  ContactSupportPage,
  FaqPage,
  LegalDocumentPage,
  LegalListPage,
} from './components/profile';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { NotificationDetailPage } from './components/notifications/NotificationDetailPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import {
  CategoryProductsPage,
  HotProductsPage,
  FlashDealsPage,
  NewArrivalsPage,
  BundlesPage,
  RecommendedPage,
  FastDeliveryPage,
} from './components/category';
import { CommunityBundlePage, CurateBundlePage, TrendingPage } from './components/community';
import { SellerOnboarding, OrdersManagement, SellerDashboard, AnalyticsPage, StoreFrontPage, StoreHoursPage } from './components/seller';
import { ProductListPage, ProductEditor } from './components/seller/products';
import { OrderDetails } from './components/seller/orders';
import { 
  PromotionsHomePage, 
  CreateDiscountPage, 
  FlashDealSetupPage, 
  BundleCreatorPage, 
  CampaignCalendar 
} from './components/seller/promotions';
import { OrderTrackingPage } from './components/tracking';
import { OrdersListPage, OrderDetailPage } from './components/orders';
import { AddressManagementPage, AddEditAddressPage } from './components/address';
import { PaymentMethodsPage, AddPaymentMethodPage } from './components/payment';
import { ReturnsHubPage, ReturnDetailPage } from './components/returns';
import { ReviewsPage } from './components/reviews';
import { VouchersWalletPage } from './components/vouchers';
import ToastContainer from './components/ui/Toast';

const DEFAULT_LOCATION = {
  lat: -26.1076,
  lng: 28.0567,
  suburb: 'Sandton',
  city: 'Johannesburg',
  province: 'Gauteng',
};

const App = () => {
  const [location, setLocation] = useState(null);
  const routerLocation = useLocation(); // still used for seller route detection in layout

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation') || localStorage.getItem('tsenga_location');
    let loaded = null;
    if (savedLocation) {
      try { loaded = JSON.parse(savedLocation); } catch {}
    }

    if (loaded) {
      setLocation(loaded);
    } else if (navigator.geolocation) {
      detectUserLocation();
    } else {
      setLocation(DEFAULT_LOCATION);
      localStorage.setItem('userLocation', JSON.stringify(DEFAULT_LOCATION));
      localStorage.setItem('tsenga_location', JSON.stringify(DEFAULT_LOCATION));
    }
  }, []);

  const detectUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude, suburb: 'Sandton', city: 'Johannesburg' };
        setLocation(loc);
        localStorage.setItem('userLocation', JSON.stringify(loc));
        localStorage.setItem('tsenga_location', JSON.stringify(loc));
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        localStorage.setItem('userLocation', JSON.stringify(DEFAULT_LOCATION));
        localStorage.setItem('tsenga_location', JSON.stringify(DEFAULT_LOCATION));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    localStorage.setItem('tsenga_location', JSON.stringify(newLocation));
  };

  // Initialize default seller store ID for guest access
  useEffect(() => {
    if (!localStorage.getItem('sellerStoreId')) {
      localStorage.setItem('sellerStoreId', '1');
    }
    if (!localStorage.getItem('sellerOnboardingId')) {
      localStorage.setItem('sellerOnboardingId', '1');
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomeScreen location={location} onLocationChange={handleLocationChange} />} />
        <Route path="/profile" element={<ProfilePage location={location} />} />
        <Route path="/account/edit-profile" element={<EditProfilePage />} />
        <Route path="/account/change-password" element={<ChangePasswordPage />} />
        <Route path="/account/notifications" element={<NotificationSettingsPage />} />
        <Route path="/account/language" element={<LanguageSettingsPage />} />
        <Route path="/account/theme" element={<ThemeSettingsPage />} />
        <Route path="/support/help" element={<HelpCenterPage />} />
        <Route path="/support/help/category/:categoryId" element={<HelpCategoryPage />} />
        <Route path="/support/help/article/:articleId" element={<HelpArticlePage />} />
        <Route path="/support/contact" element={<ContactSupportPage />} />
        <Route path="/support/faqs" element={<FaqPage />} />
        <Route path="/legal" element={<LegalListPage />} />
        <Route path="/legal/terms" element={<LegalDocumentPage />} />
        <Route path="/legal/privacy" element={<LegalDocumentPage />} />
        <Route path="/legal/community-guidelines" element={<LegalDocumentPage />} />
        <Route path="/legal/licenses" element={<LegalDocumentPage />} />
        <Route path="/addresses" element={<AddressManagementPage location={location} />} />
        <Route path="/addresses/new" element={<AddEditAddressPage location={location} />} />
        <Route path="/addresses/:id/edit" element={<AddEditAddressPage location={location} />} />
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/payment-methods/new" element={<AddPaymentMethodPage location={location} />} />
        <Route path="/orders" element={<OrdersListPage location={location} />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage location={location} />} />
        <Route path="/returns" element={<ReturnsHubPage location={location} />} />
        <Route path="/returns/:returnId" element={<ReturnDetailPage location={location} />} />
        <Route path="/reviews" element={<ReviewsPage location={location} />} />
        <Route path="/vouchers" element={<VouchersWalletPage />} />
        <Route path="/cart" element={<CartPage location={location} />} />
        <Route path="/checkout" element={<CheckoutPage location={location} />} />
        <Route path="/product/:id" element={<ProductDetailPage location={location} />} />
        <Route path="/notifications/:id" element={<NotificationDetailPage location={location} />} />
        <Route path="/tracking/:orderId" element={<OrderTrackingPage location={location} />} />
        <Route path="/category/:categoryName" element={<CategoryProductsPage location={location} />} />
        <Route path="/hot" element={<HotProductsPage location={location} />} />
        <Route path="/deals" element={<FlashDealsPage location={location} />} />
        <Route path="/new" element={<NewArrivalsPage location={location} />} />
        <Route path="/bundles" element={<BundlesPage location={location} />} />
        <Route path="/recommended" element={<RecommendedPage location={location} />} />
        <Route path="/fast-delivery" element={<FastDeliveryPage location={location} />} />
        <Route path="/trending" element={<TrendingPage location={location} />} />
        <Route path="/community/bundle/:bundleType" element={<CommunityBundlePage location={location} />} />
        <Route path="/community/bundle/:bundleType/curate" element={<CurateBundlePage location={location} />} />
        <Route path="/seller/onboarding" element={<SellerOnboarding location={location} />} />
        <Route path="/seller/dashboard" element={<SellerDashboard location={location} />} />
        <Route path="/seller/analytics" element={<AnalyticsPage location={location} />} />
        <Route path="/seller/products" element={<ProductListPage location={location} />} />
        <Route path="/seller/products/new" element={<ProductEditor location={location} />} />
        <Route path="/seller/products/:id/edit" element={<ProductEditor location={location} />} />
        <Route path="/seller/orders" element={<OrdersManagement location={location} />} />
        <Route path="/seller/orders/:orderId" element={<OrderDetails location={location} />} />
        <Route path="/seller/promotions" element={<PromotionsHomePage location={location} />} />
        <Route path="/seller/promotions/calendar" element={<CampaignCalendar location={location} />} />
        <Route path="/seller/promotions/discount/create" element={<CreateDiscountPage location={location} />} />
        <Route path="/seller/promotions/flash/create" element={<FlashDealSetupPage location={location} />} />
        <Route path="/seller/promotions/bundle/create" element={<BundleCreatorPage location={location} />} />
        <Route path="/seller/store" element={<StoreFrontPage location={location} />} />
        <Route path="/seller/settings/hours" element={<StoreHoursPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
