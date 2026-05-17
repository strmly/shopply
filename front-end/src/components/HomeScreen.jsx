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

const FeedHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  @media (max-width: 380px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
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
  min-width: 0;

  @media (max-width: 520px) {
    font-size: 24px;
  }
`;

const FeedViewAllButton = styled.button`
  ${props => props.theme.typography.body2}
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  font-weight: 600;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 14px 28px rgba(61, 129, 239, 0.22);

  &:hover {
    color: ${props => props.theme.colors.text.inverse};
    transform: translateY(-1px);
    box-shadow: 0 18px 34px rgba(61, 129, 239, 0.28);
  }

  &::after {
    content: '';
    width: 7px;
    height: 7px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(45deg) translateY(-1px);
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover::after {
    transform: rotate(45deg) translate(2px, -3px);
  }

  @media (max-width: 380px) {
    min-height: 34px;
    padding: 0 12px;
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
import { useHomeData } from '../hooks/useHomeData';
import { getCurrentUserId } from '../utils/currentUser';

export const HomeScreen = ({ location, onLocationChange }) => {
  const navigate = useNavigate();
  const suburb = location?.suburb || 'Your area';
  const city = location?.city || '';

  const { data: homeData, loading } = useHomeData(location);

  const hotProducts  = homeData?.hotProducts  ?? [];
  const flashDeals   = homeData?.flashDeals   ?? [];
  const recommended  = homeData?.recommended  ?? [];
  const newArrivals  = homeData?.newArrivals  ?? [];
  const bundles      = homeData?.bundles      ?? [];
  const topRated     = homeData?.topRated     ?? [];

  const [feedProducts, setFeedProducts] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);

  // Sync feed state from cached home data when it arrives
  useEffect(() => {
    if (!homeData) return;
    setFeedProducts(homeData.feedProducts ?? []);
    setFeedPage(1);
    setFeedHasMore(homeData.feedHasMore ?? false);
  }, [homeData]);

  const [hyperlocalFeed, setHyperlocalFeed] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = getCurrentUserId();

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/count`);
        const data = await response.json();
        if (data.success) setUnreadCount(data.data?.count || 0);
      } catch {}
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
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

  const handleLoadMoreFeed = async () => {
    if (feedLoading || !feedHasMore) return;
    setFeedLoading(true);
    try {
      const nextPage = feedPage + 1;
      const locQS = location?.lat && location?.lng
        ? `lat=${location.lat}&lng=${location.lng}&`
        : '';
      const res = await fetch(`${API_BASE_URL}/products?${locQS}page=${nextPage}&limit=8`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFeedProducts(prev => [...prev, ...data.data]);
        setFeedPage(nextPage);
        setFeedHasMore(data.pagination?.hasMore ?? false);
      }
    } catch (e) {
      console.error('Load more feed failed:', e);
    } finally {
      setFeedLoading(false);
    }
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
                  <FeedHeaderRow>
                    <FeedTitle>Top picks · {hyperlocalFeed.tierLabel}</FeedTitle>
                    <FeedViewAllButton onClick={() => navigate('/trending')}>
                      See all
                    </FeedViewAllButton>
                  </FeedHeaderRow>
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
                  <FeedHeaderRow>
                    <FeedTitle>
                      {hyperlocalFeed.wasAutoExpanded ? 'Top-rated picks' : 'Popular in your area'}
                    </FeedTitle>
                    <FeedViewAllButton onClick={() => navigate('/hot')}>
                      See all
                    </FeedViewAllButton>
                  </FeedHeaderRow>
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
                  onSeeMore={() => navigate('/recommended')}
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
        
        <CommunityRecommendations
          location={location}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

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
              onLoadMore={feedProducts.length > 0 ? handleLoadMoreFeed : undefined}
              hasMore={feedProducts.length > 0 ? feedHasMore : false}
              loading={feedLoading}
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
