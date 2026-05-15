import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #FDF4FF 0%, #FAE8FF 15%, #FFFFFF 30%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const HeroHeader = styled.div`
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #A855F7 0%, #9333EA 50%, #7C3AED 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
    animation: sparkle 4s ease-in-out infinite;
  }
  
  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const StarIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
  animation: twinkle 2s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
  
  @keyframes twinkle {
    0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
    50% { opacity: 0.8; transform: scale(1.15) rotate(180deg); }
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

const PersonalBadge = styled.div`
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

export const RecommendedPage = ({ location }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'default';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/recommended?userId=${userId}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error loading recommended products:', err);
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading recommendations...</div>
        </LoadingContainer>
        <BottomNavigation currentPath="/recommended" />
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
            <StarIcon>✨</StarIcon>
            <Title>Recommended For You</Title>
            <Subtitle>Curated just for you based on your preferences</Subtitle>
            <PersonalBadge>
              🎯 Personalized
            </PersonalBadge>
            <ProductCount>
              {products.length} {products.length === 1 ? 'recommendation' : 'recommendations'} for you
            </ProductCount>
          </HeaderContent>
        </HeroHeader>

        {products.length === 0 ? (
          <EmptyState>
            <EmptyIcon>✨</EmptyIcon>
            <EmptyTitle>No Recommendations Yet</EmptyTitle>
            <EmptyMessage>
              Start browsing to get personalized recommendations!
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
      
      <BottomNavigation currentPath="/recommended" />
    </Container>
  );
};


