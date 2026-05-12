import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 15%, #FFFFFF 30%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const HeroHeader = styled.div`
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.9; }
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
  animation: bounce 2s ease-in-out infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-10px) scale(1.1); }
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: white;
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: rgba(255,255,255,0.95);
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 500;
`;

const Badge = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: rgba(255,255,255,0.2);
  border-radius: ${props => props.theme.radii.md};
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.3);
`;

const ProductCount = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.caption}
  opacity: 0.9;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const CurateButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.4);
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.6);
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

import API_BASE_URL from '@config/api';

// Bundle type configuration
const BUNDLE_CONFIG = {
  'grocery-stores': {
    icon: '🛒',
    title: 'Best Grocery Stores Near You',
    subtitle: 'Local shoppers recommend these stores for fresh produce and great prices',
    badge: '🌟 Recommended by Neighbors',
  },
  'electronics': {
    icon: '📱',
    title: 'Top Rated Electronics',
    subtitle: 'Community favorites for tech and gadgets',
    badge: '⭐ Community Favorites',
  },
  'food-favorites': {
    icon: '🍽️',
    title: 'Local Food Favorites',
    subtitle: 'Restaurants and food items loved by your neighbors',
    badge: '❤️ Loved by Neighbors',
  },
};

export const CommunityBundlePage = ({ location }) => {
  const { bundleType } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bundleInfo, setBundleInfo] = useState(null);
  const suburb = location?.suburb || 'Your Area';

  const config = BUNDLE_CONFIG[bundleType] || BUNDLE_CONFIG['grocery-stores'];

  useEffect(() => {
    if (bundleType) {
      loadProducts();
    }
  }, [bundleType, location]);

  // Refresh when returning from curation page
  useEffect(() => {
    const handleFocus = () => {
      if (bundleType) {
        loadProducts();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [bundleType]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(
        `${API_BASE_URL}/community/bundles/${bundleType}?limit=50&location=${locationParam}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
        setBundleInfo(data.bundleInfo);
      } else {
        console.error('Error loading bundle:', data.message);
      }
    } catch (err) {
      console.error('Error loading bundle products:', err);
      // Set empty state on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (product) => {
    if (!product || !product.id) return;

    try {
      const cartItem = {
        ...product,
        quantity: 1,
        selectedVariant: null,
        addedAt: new Date().toISOString(),
      };

      const cart = JSON.parse(localStorage.getItem('tsenga_cart') || '[]');
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('tsenga_cart', JSON.stringify(cart));
      const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('tsenga_cart_count', cartCount.toString());

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

      window.dispatchEvent(new Event('cartUpdated'));
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
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <LoadingContainer>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{config.icon}</div>
          <div>Loading {config.title.toLowerCase()}...</div>
        </LoadingContainer>
        <BottomNavigation currentPath="/community" />
      </Container>
    );
  }

  return (
    <Container>
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => navigate('/')}
        onSearchClick={() => navigate('/search')}
      />
      
      <Content>
        <HeroHeader>
          <HeaderContent>
            <Icon>{config.icon}</Icon>
            <Title>{bundleInfo?.title || config.title}</Title>
            <Subtitle>{bundleInfo?.description || config.subtitle}</Subtitle>
            <Badge>
              {config.badge}
            </Badge>
            <ProductCount>
              {products.length} {products.length === 1 ? 'item' : 'items'} recommended in {suburb}
              {bundleInfo?.curatorCount > 0 && (
                <> • Curated by {bundleInfo.curatorCount} {bundleInfo.curatorCount === 1 ? 'local' : 'locals'}</>
              )}
            </ProductCount>
            <ActionButtons>
              <CurateButton onClick={() => navigate(`/community/bundle/${bundleType}/curate`)}>
                ✨ Curate Bundle
              </CurateButton>
            </ActionButtons>
          </HeaderContent>
        </HeroHeader>

        {products.length === 0 ? (
          <EmptyState>
            <EmptyIcon>{config.icon}</EmptyIcon>
            <EmptyTitle>No Recommendations Yet</EmptyTitle>
            <EmptyMessage>
              Check back soon for community recommendations in your area!
            </EmptyMessage>
          </EmptyState>
        ) : (
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        )}
      </Content>
      
      <BottomNavigation currentPath="/community" />
    </Container>
  );
};
