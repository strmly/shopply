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
import { LivestreamStrip } from './home/LivestreamStrip';
import { ProductGrid } from './home/ProductGrid';
import { BottomNavigation } from './home/BottomNavigation';
import { ModeIndicator } from './home/ModeIndicator';
import { InlineSearch } from './home/InlineSearch';
import { TrendingInArea, CommunityRecommendations } from './community';
import { NotificationsPanel } from './ui';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 80px; /* Space for bottom nav */
`;

const Content = styled.div`
  max-width: 100%;
  margin: 0 auto;
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

export const HomeScreen = ({ location }) => {
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
        
        const [hotRes, dealsRes, recommendedRes, newRes, allRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/hot?limit=10`).catch(err => {
            console.error('Error fetching hot products:', err);
            return { ok: false, json: async () => ({ success: false, data: [] }) };
          }),
          fetch(`${API_BASE_URL}/products/flash-deals?limit=10`).catch(err => {
            console.error('Error fetching flash deals:', err);
            return { ok: false, json: async () => ({ success: false, data: [] }) };
          }),
          fetch(`${API_BASE_URL}/products/recommended?limit=10`).catch(err => {
            console.error('Error fetching recommended:', err);
            return { ok: false, json: async () => ({ success: false, data: [] }) };
          }),
          fetch(`${API_BASE_URL}/products/new-arrivals?limit=10`).catch(err => {
            console.error('Error fetching new arrivals:', err);
            return { ok: false, json: async () => ({ success: false, data: [] }) };
          }),
          fetch(`${API_BASE_URL}/products?page=1&limit=${itemsPerPage}`).catch(err => {
            console.error('Error fetching all products:', err);
            return { ok: false, json: async () => ({ success: false, data: [] }) };
          }),
        ]);

        const [hotData, dealsData, recommendedData, newData, allData] = await Promise.all([
          hotRes.json().catch(() => ({ success: false, data: [] })),
          dealsRes.json().catch(() => ({ success: false, data: [] })),
          recommendedRes.json().catch(() => ({ success: false, data: [] })),
          newRes.json().catch(() => ({ success: false, data: [] })),
          allRes.json().catch(() => ({ success: false, data: [], pagination: { hasMore: false } })),
        ]);

        // Set products with fallback to empty array
        if (hotData.success && Array.isArray(hotData.data)) {
          setHotProducts(hotData.data);
        } else {
          console.warn('Hot products data invalid:', hotData);
          setHotProducts([]);
        }

        if (dealsData.success && Array.isArray(dealsData.data)) {
          setFlashDeals(dealsData.data);
        } else {
          console.warn('Flash deals data invalid:', dealsData);
          setFlashDeals([]);
        }

        if (recommendedData.success && Array.isArray(recommendedData.data)) {
          setRecommended(recommendedData.data);
        } else {
          console.warn('Recommended data invalid:', recommendedData);
          setRecommended([]);
        }

        if (newData.success && Array.isArray(newData.data)) {
          setNewArrivals(newData.data);
        } else {
          console.warn('New arrivals data invalid:', newData);
          setNewArrivals([]);
        }

        if (allData.success && Array.isArray(allData.data)) {
          // Use all products for bundles and top rated (filtered)
          setBundles(allData.data.slice(0, 4));
          setTopRated(allData.data.filter(p => p.rating >= 4.5).slice(0, 6));
          setFeedProducts(allData.data);
          setHasMoreFeed(allData.pagination?.hasMore || false);
        } else {
          console.warn('All products data invalid:', allData);
          setBundles([]);
          setTopRated([]);
          setFeedProducts([]);
          setHasMoreFeed(false);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Set all to empty arrays on error
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
          onLocationClick={() => console.log('Location clicked')}
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
      </Container>
    );
  }

  return (
    <Container>
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => setShowNotifications(true)}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onSearchClick={() => setShowSearch(true)}
        unreadCount={unreadCount}
      />
      
      <Content>
        <HeroCarousel />
        
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
            title="🔥 Hot Near You"
            geoLabel={`Trending in ${suburb}`}
            products={hotProducts}
            viewAllText="See all"
            onViewAll={() => navigate('/hot')}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            variant="hot"
          />
        )}
        
        <FlashDealsSection
          products={flashDeals}
          onViewAll={() => navigate('/deals')}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
        
        {recommended.length > 0 && (
          <DiscoveryModule
            title="✨ Recommended For You"
            subtitle="Because you browsed electronics"
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
            title="🆕 New from Local Stores"
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
            title={`⭐ Top-Rated in ${suburb}`}
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
          <ProductGrid
            products={feedProducts.length > 0 ? feedProducts : bundles}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onLoadMore={handleLoadMoreFeed}
            hasMore={hasMoreFeed}
            loading={loadingMoreFeed}
            itemsPerPage={itemsPerPage}
          />
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
          // Refresh unread count when panel closes
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
    </Container>
  );
};
