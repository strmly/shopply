import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 54%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const Hero = styled.section`
  max-width: 1180px;
  margin: 24px auto 22px;
  padding: 0 min(5vw, 48px);
`;

const HeroPanel = styled.div`
  padding: 30px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(241,247,255,0.86) 100%) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.24), rgba(196, 184, 252, 0.2), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.1);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 22px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Icon = styled.div`
  width: 82px;
  height: 82px;
  border-radius: 26px;
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.18);
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.12);
`;

const Eyebrow = styled.div`
  width: fit-content;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.18);
  border-radius: 999px;
  padding: 7px 11px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 12px 0 0;
  font-weight: 500;
  max-width: 560px;
`;

const CountCard = styled.div`
  min-width: 150px;
  padding: 16px;
  border-radius: 22px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  text-align: center;
`;

const CountValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 30px;
  line-height: 1;
  font-weight: 900;
`;

const CountLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
  margin-top: 5px;
`;

const CenterState = styled.div`
  max-width: 680px;
  margin: 40px auto;
  padding: 36px 24px;
  text-align: center;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const StateIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 22px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
`;

const StateTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 900;
`;

const StateMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

export const NewArrivalsPage = ({ location }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/new-arrivals?limit=50`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error loading new arrivals:', err);
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
      } catch (syncError) {
        console.error('Error syncing cart to backend:', syncError);
      }

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (cartError) {
      console.error('Error adding to cart:', cartError);
    }
  };

  const nav = (
    <TopNavigation
      location={location}
      onLocationClick={() => console.log('Location clicked')}
      onSearch={(query) => console.log('Search:', query)}
      onNotificationClick={() => navigate('/')}
      onSearchClick={() => navigate('/search')}
    />
  );

  if (loading) {
    return (
      <Container>
        {nav}
        <CenterState>
          <StateIcon>N</StateIcon>
          <StateTitle>Loading new arrivals</StateTitle>
          <StateMessage>Finding fresh drops from local stores.</StateMessage>
        </CenterState>
        <BottomNavigation currentPath="/new" />
      </Container>
    );
  }

  return (
    <Container>
      {nav}

      <Content>
        <Hero>
          <HeroPanel>
            <Icon>N</Icon>
            <div>
              <Eyebrow>Fresh drops</Eyebrow>
              <Title>New Arrivals</Title>
              <Subtitle>Fresh drops from local stores, curated into a calmer browse.</Subtitle>
            </div>
            <CountCard>
              <CountValue>{products.length}</CountValue>
              <CountLabel>{products.length === 1 ? 'new product' : 'new products'}</CountLabel>
            </CountCard>
          </HeroPanel>
        </Hero>

        {products.length === 0 ? (
          <CenterState>
            <StateIcon>N</StateIcon>
            <StateTitle>No New Arrivals</StateTitle>
            <StateMessage>Check back soon for fresh products from local stores.</StateMessage>
          </CenterState>
        ) : (
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        )}
      </Content>

      <BottomNavigation currentPath="/new" />
    </Container>
  );
};
