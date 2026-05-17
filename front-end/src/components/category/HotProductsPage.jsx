import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #FF6B6B 0%, #FFE5E5 15%, #FFFFFF 30%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const HeroHeader = styled.div`
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const FireIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
  animation: flicker 2s ease-in-out infinite;
  
  @keyframes flicker {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.1) rotate(-5deg); }
    75% { transform: scale(1.1) rotate(5deg); }
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
  margin: 0;
  font-weight: 500;
`;

const ProductCount = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: rgba(255,255,255,0.2);
  border-radius: ${props => props.theme.radii.md};
  backdrop-filter: blur(10px);
  display: inline-block;
  ${props => props.theme.typography.body2}
  font-weight: 600;
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
import { getCurrentUserId } from '../../utils/currentUser.js';

export const HotProductsPage = ({ location }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const suburb = location?.suburb || 'Your Area';

  useEffect(() => {
    loadProducts();
  }, [location]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const lat = location?.lat;
      const lng = location?.lng;
      let url = `${API_BASE_URL}/products/hot?limit=50`;
      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error loading hot products:', err);
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

      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
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
      const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('shopply_cart_count', cartCount.toString());

      try {
        await fetch(`${API_BASE_URL}/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getCurrentUserId(),
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading hot products...</div>
        </LoadingContainer>
        <BottomNavigation currentPath="/hot" />
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
            <FireIcon>🔥</FireIcon>
            <Title>Hot Near You</Title>
            <Subtitle>Trending products in {suburb}</Subtitle>
            <ProductCount>
              {products.length} {products.length === 1 ? 'product' : 'products'} trending now
            </ProductCount>
          </HeaderContent>
        </HeroHeader>

        {products.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔥</EmptyIcon>
            <EmptyTitle>No Hot Products</EmptyTitle>
            <EmptyMessage>
              Check back soon for trending products in your area!
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
      
      <BottomNavigation currentPath="/hot" />
    </Container>
  );
};


