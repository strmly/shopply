import { useState, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomeScreen } from './components/HomeScreen';
import { 
  ProfilePage, 
  EditProfilePage,
  VerifyEmailPage,
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
import { SearchPage } from './components/search';
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
import { SellerOnboarding, BecomeSellerPage, SellerLearnMorePage, OrdersManagement, SellerDashboard, SellerMessagesPage, AnalyticsPage, StoreFrontPage, StoreHoursPage } from './components/seller';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { ProtectedRoute, UnauthorizedPage, SignInPage } from './components/auth';
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
import ToastContainer, { toast } from './components/ui/Toast';
import { socket, joinUserRoom } from './utils/notificationSocket';

const DEFAULT_LOCATION = {
  lat: -26.1076,
  lng: 28.0567,
  suburb: 'Sandton',
  city: 'Johannesburg',
  province: 'Gauteng',
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
};

const App = () => {
  const [location, setLocation] = useState(null);
  const routerLocation = useLocation(); // still used for seller route detection in layout

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation') || localStorage.getItem('shopply_location');
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
      localStorage.setItem('shopply_location', JSON.stringify(DEFAULT_LOCATION));
    }
  }, []);

  const detectUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude, suburb: 'Sandton', city: 'Johannesburg' };
        setLocation(loc);
        localStorage.setItem('userLocation', JSON.stringify(loc));
        localStorage.setItem('shopply_location', JSON.stringify(loc));
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        localStorage.setItem('userLocation', JSON.stringify(DEFAULT_LOCATION));
        localStorage.setItem('shopply_location', JSON.stringify(DEFAULT_LOCATION));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    localStorage.setItem('shopply_location', JSON.stringify(newLocation));
  };

  // Real-time notification socket
  useEffect(() => {
    joinUserRoom('default');

    const handleNew = (notification) => {
      window.dispatchEvent(new Event('notificationUpdated'));
      const typeLabel = { order: 'Order update', promotion: 'Deal alert', system: 'System', info: 'Update' };
      toast.info(`${typeLabel[notification.type] || 'Update'}: ${notification.title}`, 5000);
    };

    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, []);

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
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomeScreen location={location} onLocationChange={handleLocationChange} />} />
        <Route path="/profile" element={<ProfilePage location={location} />} />
        <Route path="/account/edit-profile" element={<EditProfilePage />} />
        <Route path="/account/verify-email" element={<VerifyEmailPage />} />
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
        <Route path="/payment-methods" element={<Navigate to="/" replace />} />
        <Route path="/payment-methods/new" element={<Navigate to="/" replace />} />
        <Route path="/orders" element={<OrdersListPage location={location} />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage location={location} />} />
        <Route path="/returns" element={<ReturnsHubPage location={location} />} />
        <Route path="/returns/:returnId" element={<ReturnDetailPage location={location} />} />
        <Route path="/reviews" element={<ReviewsPage location={location} />} />
        <Route path="/vouchers" element={<VouchersWalletPage />} />
        <Route path="/cart" element={<CartPage location={location} />} />
        <Route path="/search" element={<SearchPage location={location} />} />
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
        <Route path="/sell-on-shopply" element={<SellerLearnMorePage location={location} />} />
        <Route path="/become-a-seller" element={<BecomeSellerPage location={location} />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Admin route */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />

        {/* Seller routes — require seller or admin role */}
        <Route path="/seller/onboarding" element={<ProtectedRoute roles={['seller', 'admin']}><SellerOnboarding location={location} /></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute roles={['seller', 'admin']}><SellerDashboard location={location} /></ProtectedRoute>} />
        <Route path="/seller/messages" element={<ProtectedRoute roles={['seller', 'admin']}><SellerMessagesPage location={location} /></ProtectedRoute>} />
        <Route path="/seller/analytics" element={<ProtectedRoute roles={['seller', 'admin']}><AnalyticsPage location={location} /></ProtectedRoute>} />
        <Route path="/seller/products" element={<ProtectedRoute roles={['seller', 'admin']}><ProductListPage location={location} /></ProtectedRoute>} />
        <Route path="/seller/products/new" element={<ProtectedRoute roles={['seller', 'admin']}><ProductEditor location={location} /></ProtectedRoute>} />
        <Route path="/seller/products/:id/edit" element={<ProtectedRoute roles={['seller', 'admin']}><ProductEditor location={location} /></ProtectedRoute>} />
        <Route path="/seller/orders" element={<ProtectedRoute roles={['seller', 'admin']}><OrdersManagement location={location} /></ProtectedRoute>} />
        <Route path="/seller/orders/:orderId" element={<ProtectedRoute roles={['seller', 'admin']}><OrderDetails location={location} /></ProtectedRoute>} />
        <Route path="/seller/promotions" element={<ProtectedRoute roles={['seller', 'admin']}><PromotionsHomePage location={location} /></ProtectedRoute>} />
        <Route path="/seller/promotions/calendar" element={<ProtectedRoute roles={['seller', 'admin']}><CampaignCalendar location={location} /></ProtectedRoute>} />
        <Route path="/seller/promotions/discount/create" element={<ProtectedRoute roles={['seller', 'admin']}><CreateDiscountPage location={location} /></ProtectedRoute>} />
        <Route path="/seller/promotions/flash/create" element={<ProtectedRoute roles={['seller', 'admin']}><FlashDealSetupPage location={location} /></ProtectedRoute>} />
        <Route path="/seller/promotions/bundle/create" element={<ProtectedRoute roles={['seller', 'admin']}><BundleCreatorPage location={location} /></ProtectedRoute>} />
        <Route path="/store/:storeId" element={<StoreFrontPage location={location} />} />
        <Route path="/seller/store" element={<ProtectedRoute roles={['seller', 'admin']}><StoreFrontPage location={location} /></ProtectedRoute>} />
        <Route path="/seller/settings/hours" element={<ProtectedRoute roles={['seller', 'admin']}><StoreHoursPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
