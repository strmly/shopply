import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
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
import { CommunityBundlePage, CurateBundlePage } from './components/community';
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

const App = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [location, setLocation] = useState(null);
  const routerLocation = useLocation();

  useEffect(() => {
    // Check if onboarding is complete (stored in localStorage)
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    const savedLocation = localStorage.getItem('userLocation');
    const savedShopplyLocation = localStorage.getItem('shopply_location');
    
    if (onboardingComplete === 'true') {
      setIsOnboardingComplete(true);
    }
    
    // Try to load saved location
    let loadedLocation = null;
    if (savedLocation) {
      try {
        loadedLocation = JSON.parse(savedLocation);
        setLocation(loadedLocation);
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    } else if (savedShopplyLocation) {
      // Fallback to shopply_location if userLocation doesn't exist
      try {
        loadedLocation = JSON.parse(savedShopplyLocation);
        setLocation(loadedLocation);
      } catch (e) {
        console.error('Error parsing shopply_location:', e);
      }
    }
    
    // Auto-detect location if none is saved (even if onboarding is complete)
    if (!loadedLocation && navigator.geolocation) {
      detectUserLocation();
    } else if (!loadedLocation) {
      // No geolocation support, set default location
      const defaultLocation = {
        lat: -26.1076,
        lng: 28.0567,
        suburb: 'Sandton',
        city: 'Johannesburg',
      };
      setLocation(defaultLocation);
      localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
      localStorage.setItem('shopply_location', JSON.stringify(defaultLocation));
    }
  }, []);

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      // No geolocation support, set default location
      const defaultLocation = {
        lat: -26.1076,
        lng: 28.0567,
        suburb: 'Sandton',
        city: 'Johannesburg',
      };
      setLocation(defaultLocation);
      localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
      localStorage.setItem('shopply_location', JSON.stringify(defaultLocation));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const detectedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Reverse geocode to get suburb and city
        // For now, use a simple approximation based on coordinates
        // In production, use a geocoding service like Google Maps Geocoding API
        const suburb = await reverseGeocode(detectedLocation.lat, detectedLocation.lng);
        
        const locationData = {
          ...detectedLocation,
          suburb: suburb.suburb || 'Sandton',
          city: suburb.city || 'Johannesburg',
        };

        setLocation(locationData);
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        localStorage.setItem('shopply_location', JSON.stringify(locationData));
      },
      (error) => {
        console.error('Geolocation error:', error);
        // On error, set default location
        const defaultLocation = {
          lat: -26.1076,
          lng: 28.0567,
          suburb: 'Sandton',
          city: 'Johannesburg',
        };
        setLocation(defaultLocation);
        localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
        localStorage.setItem('shopply_location', JSON.stringify(defaultLocation));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Simple reverse geocoding approximation
  // In production, replace with actual geocoding service
  const reverseGeocode = async (lat, lng) => {
    // For Johannesburg area, approximate suburbs based on coordinates
    // This is a simplified version - in production use a proper geocoding API
    
    // Johannesburg area bounds (approximate)
    if (lat >= -26.3 && lat <= -25.9 && lng >= 27.9 && lng <= 28.2) {
      // Sandton area
      if (lat >= -26.15 && lat <= -26.05 && lng >= 28.0 && lng <= 28.1) {
        return { suburb: 'Sandton', city: 'Johannesburg' };
      }
      // Rosebank area
      if (lat >= -26.15 && lat <= -26.12 && lng >= 28.03 && lng <= 28.05) {
        return { suburb: 'Rosebank', city: 'Johannesburg' };
      }
      // Melville area
      if (lat >= -26.19 && lat <= -26.17 && lng >= 28.0 && lng <= 28.02) {
        return { suburb: 'Melville', city: 'Johannesburg' };
      }
      // Default to Sandton for Johannesburg area
      return { suburb: 'Sandton', city: 'Johannesburg' };
    }
    
    // Default fallback
    return { suburb: 'Sandton', city: 'Johannesburg' };
  };

  const handleOnboardingComplete = (locationData) => {
    setIsOnboardingComplete(true);
    if (locationData) {
      setLocation(locationData);
      localStorage.setItem('userLocation', JSON.stringify(locationData));
    }
    localStorage.setItem('onboardingComplete', 'true');
  };

  const handleBrowseAsGuest = () => {
    setIsOnboardingComplete(true);
    localStorage.setItem('onboardingComplete', 'true');
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

  // Check if current route is a seller route
  const isSellerRoute = routerLocation.pathname.startsWith('/seller');

  // Allow seller routes without onboarding, but require onboarding for other routes
  if (!isOnboardingComplete && !isSellerRoute) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onBrowseAsGuest={handleBrowseAsGuest}
      />
    );
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomeScreen location={location} />} />
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
