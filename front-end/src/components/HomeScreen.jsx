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
import { InlineSearch } from './home/InlineSearch';
import { TrendingInArea, CommunityRecommendations } from './community';
import { SellerBannerCompact, SellerBannerFull } from './home/SellerBanner';
import { NotificationsPanel } from './ui';
import { LocationPickerModal } from './home/LocationPickerModal';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 56%, #F8FAFC 100%);
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 80px; /* Space for bottom nav */
`;

const Content = styled.div`
  max-width: 100%;
  margin: 0 auto;
`;

const FeedHeader = styled.div`
  max-width: 1180px;
  margin: 0 auto 16px;
  padding: 0 min(5vw, 48px);
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

export const HomeScreen = ({ location, onLocationChange }) => {
  const navigate = useNavigate();
  const suburb = location?.suburb || 'Sandton Central';
  const distance = '5 km';

  const [hotProducts, setHotProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [feedProducts, setFeedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
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

  const [feedPage, setFeedPage] = useState(1);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(false);
  const itemsPerPage = 4;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const fallback = (err) => {
          console.error(err);
          return { ok: false, json: async () => ({ success: false, data: [] }) };
        };

        const [hotRes, dealsRes, recommendedRes, newRes, allRes, bundlesRes, topRatedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/hot?limit=10`).catch(e => fallback('hot: ' + e)),
          fetch(`${API_BASE_URL}/products/flash-deals?limit=10`).catch(e => fallback('flash: ' + e)),
          fetch(`${API_BASE_URL}/products/recommended?limit=10`).catch(e => fallback('recommended: ' + e)),
          fetch(`${API_BASE_URL}/products/new-arrivals?limit=10`).catch(e => fallback('new: ' + e)),
          fetch(`${API_BASE_URL}/products?page=1&limit=${itemsPerPage}`).catch(e => fallback('all: ' + e)),
          fetch(`${API_BASE_URL}/products/bundles?limit=10`).catch(e => fallback('bundles: ' + e)),
          fetch(`${API_BASE_URL}/products/top-rated?limit=10`).catch(e => fallback('top-rated: ' + e)),
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
          setHasMoreFeed(allData.pagination?.hasMore || false);
        } else {
          setFeedProducts([]);
          setHasMoreFeed(false);
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
        setHasMoreFeed(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLoadMoreFeed = async () => {
    try {
      setLoadingMoreFeed(true);
      const nextPage = feedPage + 1;
      const response = await fetch(`${API_BASE_URL}/products?page=${nextPage}&limit=${itemsPerPage}`);
      const data = await response.json();
      
      if (data.success) {
        setFeedProducts(prev => [...prev, ...data.data]);
        setHasMoreFeed(data.pagination?.hasMore || false);
        setFeedPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMoreFeed(false);
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (product) => {
    if (!product || !product.id) return;

    try {
      // Add to localStorage cart
      const cartItem = {
        ...product,
        quantity: 1,
        selectedVariant: null,
        addedAt: new Date().toISOString(),
      };

      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      
      // Check if item already exists
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('shopply_cart', JSON.stringify(cart));
      
      // Update cart count in localStorage
      const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('shopply_cart_count', cartCount.toString());

      // Sync with backend
      try {
        await fetch(`${API_BASE_URL}/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'default',
            productId: product.id,
            quantity: 1,
            variant: null,
            storeId: product.storeId,
          }),
        });
      } catch (error) {
        console.error('Error syncing cart to backend:', error);
      }

      // Dispatch custom event to update cart count in other components
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success feedback (could be a toast notification)
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <TopNavigation
          location={location}
          onLocationClick={() => setShowLocationPicker(true)}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => setShowNotifications(true)}
          onSearchClick={() => setShowSearch(true)}
          unreadCount={unreadCount}
        />
        <LoadingContainer>Loading products...</LoadingContainer>
        <BottomNavigation
          currentPath="/"
          onSearchClick={() => setShowSearch(true)}
        />
        {showSearch && (
          <InlineSearch
            location={location}
            onClose={() => setShowSearch(false)}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        )}
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
      <TopNavigation
        location={location}
        onLocationClick={() => setShowLocationPicker(true)}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => setShowNotifications(true)}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onSearchClick={() => setShowSearch(true)}
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

        {hotProducts.length > 0 && (
          <DiscoveryModule
            title="Hot near you"
            geoLabel={`Trending in ${suburb}`}
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
              onLoadMore={handleLoadMoreFeed}
              hasMore={hasMoreFeed}
              loading={loadingMoreFeed}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </Content>
      
      <ModeIndicator onToggle={() => navigate('/profile')} />
      <BottomNavigation 
        currentPath="/" 
        onSearchClick={() => setShowSearch(true)}
      />

      {showSearch && (
        <InlineSearch
          location={location}
          onClose={() => setShowSearch(false)}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      )}

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
