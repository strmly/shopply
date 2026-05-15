import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../theme/animations';
import { TopNavigation } from './home/TopNavigation';
import { HeroCarousel } from './home/HeroCarousel';
import { QuickActions } from './home/QuickActions';
import { CategoryGrid } from './home/CategoryGrid';
import { DiscoveryModule } from './home/DiscoveryModule';
import { FlashDealsSection } from './home/FlashDealsSection';
import { BundlesSection } from './home/BundlesSection';
import { ProductGrid } from './home/ProductGrid';
import { BottomNavigation } from './home/BottomNavigation';
import { ModeIndicator } from './home/ModeIndicator';
import { TrendingInArea, CommunityRecommendations } from './community';
import { SellerBannerCompact, SellerBannerFull } from './home/SellerBanner';
import { SellerTopBanner } from './home/SellerTopBanner';
import { NotificationsPanel } from './ui';
import { LocationPickerModal } from './home/LocationPickerModal';
import { ProductGridSkeleton } from './ui/Skeleton';
import ExpansionBanner from './hyperlocal/ExpansionBanner';

const Container = styled.div`
  min-height: 100vh;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 56%, #F8FAFC 100%);
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 80px; /* Space for bottom nav */

  @media (max-width: 640px) {
    padding-bottom: 92px;
  }
`;

const Content = styled.div`
  max-width: 100%;
  margin: 0 auto;
  min-width: 0;
`;

const FeedHeader = styled.div`
  max-width: 1180px;
  margin: 0 auto 16px;
  padding: 0 clamp(14px, 5vw, 48px);
`;

const FeedEyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primary};
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const FeedTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  line-height: 1.1;

  @media (max-width: 520px) {
    font-size: 24px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';
import { toast } from './ui/Toast';

export const HomeScreen = ({ location, onLocationChange }) => {
  const navigate = useNavigate();
  const suburb = location?.suburb || 'Your area';
  const city = location?.city || '';

  const [hotProducts, setHotProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [feedProducts, setFeedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hyperlocalFeed, setHyperlocalFeed] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = 'default'; // In a real app, this would come from auth context

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/count`);
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data?.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh count periodically
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch H3 hyperlocal home feed when coordinates are available
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shopply_location') || 'null');
      if (!stored?.lat || !stored?.lng) return;
      setGeoLoading(true);
      fetch(`${API_BASE_URL}/hyperlocal/feed/home?lat=${stored.lat}&lng=${stored.lng}&tier_index=0`)
        .then(r => r.json())
        .then(res => { if (res.success) setHyperlocalFeed(res.data); })
        .catch(() => {})
        .finally(() => setGeoLoading(false));
    } catch {}
  }, []);

  const itemsPerPage = 8;

  // Fetch products from API — re-run when the user's area changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const locQS = location?.lat && location?.lng
          ? `lat=${location.lat}&lng=${location.lng}&`
          : '';

        const fallback = (err) => {
          console.error(err);
          return { ok: false, json: async () => ({ success: false, data: [] }) };
        };

        const [hotRes, dealsRes, recommendedRes, newRes, allRes, bundlesRes, topRatedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/hot?${locQS}limit=10`).catch(e => fallback('hot: ' + e)),
          fetch(`${API_BASE_URL}/products/flash-deals?limit=10`).catch(e => fallback('flash: ' + e)),
          fetch(`${API_BASE_URL}/products/recommended?${locQS}limit=10`).catch(e => fallback('recommended: ' + e)),
          fetch(`${API_BASE_URL}/products/new-arrivals?${locQS}limit=10`).catch(e => fallback('new: ' + e)),
          fetch(`${API_BASE_URL}/products?${locQS}page=1&limit=30`).catch(e => fallback('all: ' + e)),
          fetch(`${API_BASE_URL}/products/bundles?${locQS}limit=10`).catch(e => fallback('bundles: ' + e)),
          fetch(`${API_BASE_URL}/products/top-rated?${locQS}limit=10`).catch(e => fallback('top-rated: ' + e)),
        ]);

        const [hotData, dealsData, recommendedData, newData, allData, bundlesData, topRatedData] = await Promise.all([
          hotRes.json().catch(() => ({ success: false, data: [] })),
          dealsRes.json().catch(() => ({ success: false, data: [] })),
          recommendedRes.json().catch(() => ({ success: false, data: [] })),
          newRes.json().catch(() => ({ success: false, data: [] })),
          allRes.json().catch(() => ({ success: false, data: [], pagination: { hasMore: false } })),
          bundlesRes.json().catch(() => ({ success: false, data: [] })),
          topRatedRes.json().catch(() => ({ success: false, data: [] })),
        ]);

        setHotProducts(hotData.success && Array.isArray(hotData.data) ? hotData.data : []);
        setFlashDeals(dealsData.success && Array.isArray(dealsData.data) ? dealsData.data : []);
        setRecommended(recommendedData.success && Array.isArray(recommendedData.data) ? recommendedData.data : []);
        setNewArrivals(newData.success && Array.isArray(newData.data) ? newData.data : []);
        setBundles(bundlesData.success && Array.isArray(bundlesData.data) ? bundlesData.data : []);
        setTopRated(topRatedData.success && Array.isArray(topRatedData.data) ? topRatedData.data : []);

        if (allData.success && Array.isArray(allData.data)) {
          setFeedProducts(allData.data);
        } else {
          setFeedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setHotProducts([]);
        setFlashDeals([]);
        setRecommended([]);
        setNewArrivals([]);
        setBundles([]);
        setTopRated([]);
        setFeedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.suburb]);

  const handleProductClick = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product) => {
    if (!product?.id) return;

    const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
    const alreadyAdded = cart.findIndex(
      item => item.id === product.id && JSON.stringify(item.selectedVariant) === 'null'
    ) >= 0;

    if (alreadyAdded) {
      // ProductCard already wrote the item to localStorage — just show toast.
      toast.success(`${product.name} added to cart`);
      return;
    }

    // Called from a component that doesn't manage its own cart state.
    cart.push({ ...product, quantity: 1, selectedVariant: null, addedAt: new Date().toISOString() });
    localStorage.setItem('shopply_cart', JSON.stringify(cart));
    localStorage.setItem('shopply_cart_count', cart.reduce((s, i) => s + (i.quantity || 1), 0).toString());
    window.dispatchEvent(new Event('cartUpdated'));

    fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'default', productId: product.id, quantity: 1, variant: null, storeId: product.storeId }),
    }).catch(() => {});

    toast.success(`${product.name} added to cart`);
  };

  const openSearch = () => navigate('/search');

  if (loading) {
    return (
      <Container>
        <SellerTopBanner />
        <TopNavigation
          location={location}
          onLocationClick={() => setShowLocationPicker(true)}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => setShowNotifications(true)}
          onSearchClick={openSearch}
          unreadCount={unreadCount}
        />
        <div style={{ padding: '24px clamp(14px, 5vw, 48px)' }}>
          <ProductGridSkeleton count={6} />
        </div>
        <BottomNavigation
          currentPath="/"
          onSearchClick={openSearch}
        />
        {showLocationPicker && (
          <LocationPickerModal
            currentLocation={location}
            onClose={() => setShowLocationPicker(false)}
            onSelect={(newLocation) => {
              onLocationChange?.(newLocation);
              setShowLocationPicker(false);
            }}
          />
        )}
      </Container>
    );
  }

  return (
    <Container>
      <SellerTopBanner />
      <TopNavigation
        location={location}
        onLocationClick={() => setShowLocationPicker(true)}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => setShowNotifications(true)}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onSearchClick={openSearch}
        unreadCount={unreadCount}
      />
      
      <Content>
        <HeroCarousel
          featuredProducts={[
            ...recommended,
            ...hotProducts,
            ...newArrivals,
            ...feedProducts,
          ]}
          location={location}
        />
        
        <QuickActions onActionClick={(action) => {
          if (action.route) {
            navigate(action.route);
          }
        }} />
        
        <CategoryGrid onCategoryClick={(category) => {
          // Navigate to category products page (furniture room)
          const categoryPath = category.room || encodeURIComponent(category.label.toLowerCase());
          navigate(`/category/${categoryPath}`);
        }} />

        {/* H3 Hyperlocal Discovery */}
        {(geoLoading || hyperlocalFeed?.totalProducts > 0) && (
          <>
            {geoLoading && (
              <>
                <FeedHeader>
                  <FeedEyebrow>Near you</FeedEyebrow>
                  <FeedTitle>Finding top picks nearby...</FeedTitle>
                </FeedHeader>
                <ProductGridSkeleton count={6} />
              </>
            )}
            {hyperlocalFeed?.wasAutoExpanded && (
              <FeedHeader>
                <ExpansionBanner
                  wasAutoExpanded={hyperlocalFeed.wasAutoExpanded}
                  expansionReason={hyperlocalFeed.expansionReason}
                  effectiveLabel={hyperlocalFeed.tierLabel}
                  effectiveRadius={hyperlocalFeed.radiusKm}
                  expanded={false}
                />
              </FeedHeader>
            )}
            {hyperlocalFeed?.modules?.topNearYou?.length > 0 && (
              <>
                <FeedHeader>
                  <FeedEyebrow>
                    {hyperlocalFeed.wasAutoExpanded ? 'Nearest available' : 'Near you'}
                  </FeedEyebrow>
                  <FeedTitle>Top picks · {hyperlocalFeed.tierLabel}</FeedTitle>
                </FeedHeader>
                <ProductGrid
                  products={hyperlocalFeed.modules.topNearYou}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  loading={false}
                />
              </>
            )}
            {hyperlocalFeed?.modules?.bestSellersNearby?.length > 0 && (
              <>
                <FeedHeader>
                  <FeedEyebrow>Best sellers</FeedEyebrow>
                  <FeedTitle>
                    {hyperlocalFeed.wasAutoExpanded ? 'Top-rated picks' : 'Popular in your area'}
                  </FeedTitle>
                </FeedHeader>
                <ProductGrid
                  products={hyperlocalFeed.modules.bestSellersNearby}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  loading={false}
                />
              </>
            )}
            {hyperlocalFeed?.modules?.topRatedSellers?.length > 0 && (
              <>
                <FeedHeader>
                  <FeedEyebrow>Top rated</FeedEyebrow>
                  <FeedTitle>From highest-rated sellers near you</FeedTitle>
                </FeedHeader>
                <ProductGrid
                  products={hyperlocalFeed.modules.topRatedSellers}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  loading={false}
                />
              </>
            )}
          </>
        )}

        {hotProducts.length > 0 && (
          <DiscoveryModule
            title={`Hot in ${suburb}`}
            geoLabel={city ? `Trending in ${city}` : `Trending near you`}
            products={hotProducts}
            viewAllText="See all"
            onViewAll={() => navigate('/hot')}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            variant="hot"
          />
        )}

        <SellerBannerFull />
        
        <FlashDealsSection
          products={flashDeals}
          onViewAll={() => navigate('/deals')}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        <SellerBannerCompact />

        {recommended.length > 0 && (
          <DiscoveryModule
            title="Recommended for you"
            subtitle="Furniture picks with strong local availability"
            products={recommended}
            viewAllText="See all"
            onViewAll={() => navigate('/recommended')}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            variant="recommended"
          />
        )}
        
        <BundlesSection
          products={bundles}
          suburb={suburb}
          onViewAll={() => navigate('/bundles')}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
        
        {newArrivals.length > 0 && (
          <DiscoveryModule
            title="New from local stores"
            subtitle="Fresh stock updates"
            products={newArrivals}
            viewAllText="See all new"
            onViewAll={() => navigate('/new')}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            variant="new"
          />
        )}
        
        {topRated.length > 0 && (
          <DiscoveryModule
            title={`Top-rated in ${suburb}`}
            subtitle="Loved by customers in your area"
            products={topRated}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            variant="top-rated"
          />
        )}
        
        <CommunityRecommendations location={location} />

        <TrendingInArea location={location} />
        
        {(feedProducts.length > 0 || bundles.length > 0) && (
          <>
            <FeedHeader>
              <FeedEyebrow>Selected for your home</FeedEyebrow>
              <FeedTitle>More pieces to discover</FeedTitle>
            </FeedHeader>
            <ProductGrid
              products={feedProducts.length > 0 ? feedProducts : bundles}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </Content>
      
      <ModeIndicator onToggle={() => navigate('/profile')} />
      <BottomNavigation 
        currentPath="/" 
        onSearchClick={openSearch}
      />

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetch(`${API_BASE_URL}/notifications/user/${userId}/count`)
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setUnreadCount(data.data?.count || 0);
              }
            })
            .catch(err => console.error('Error fetching unread count:', err));
        }}
        userId={userId}
        apiBaseUrl={API_BASE_URL}
      />

      {showLocationPicker && (
        <LocationPickerModal
          currentLocation={location}
          onClose={() => setShowLocationPicker(false)}
          onSelect={(newLocation) => {
            onLocationChange?.(newLocation);
            setShowLocationPicker(false);
          }}
        />
      )}
    </Container>
  );
};
