import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at 16% 0%, rgba(61,129,239,0.14), transparent 30%),
    radial-gradient(circle at 90% 20%, rgba(21,161,124,0.12), transparent 26%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 54%, #ffffff 100%);
  animation: ${fadeIn} 0.35s ease;
  padding-bottom: 104px;
`;

const Hero = styled.header`
  width: min(1180px, calc(100% - 28px));
  margin: 18px auto 20px;
  border-radius: 30px;
  padding: clamp(18px, 5vw, 34px);
  background:
    linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,247,255,0.94)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  box-shadow: 0 24px 62px rgba(16,24,40,0.1);
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
  margin-bottom: 18px;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 6px 0 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(34px, 9vw, 64px);
  line-height: 0.96;
  font-weight: 900;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  max-width: 760px;
  margin: 14px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: clamp(14px, 2.5vw, 17px);
  line-height: 1.5;
  font-weight: 700;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228,231,236,0.92);
  border-radius: 18px;
  padding: 13px;
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  font-weight: 900;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const Content = styled.main`
  width: min(1180px, calc(100% - 28px));
  margin: 0 auto;
`;

const Loading = styled.div`
  min-height: 320px;
  display: grid;
  place-items: center;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 900;
`;

const Empty = styled.div`
  min-height: 320px;
  display: grid;
  place-items: center;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
`;

export const RecommendedPage = ({ location }) => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const suburb = location?.suburb || location?.city || 'your area';

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '48', suburb });
    if (location?.lat && location?.lng) {
      params.set('lat', location.lat);
      params.set('lng', location.lng);
    }
    if (location) params.set('location', JSON.stringify(location));
    return params.toString();
  }, [location, suburb]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/community/recommended-by-neighbors?${query}`);
        const data = await response.json();
        if (active && data.success) setFeed(data.data);
      } catch (error) {
        console.error('Error loading neighbor recommendations:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [query]);

  const products = feed?.products || [];

  const handleAddToCart = async (product) => {
    try {
      await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', productId: product.id, quantity: 1, storeId: product.storeId }),
      });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <Page>
      <TopNavigation location={location} title="Recommended by Neighbors" />
      <Hero>
        <BackButton type="button" onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
        <Eyebrow>Community picks</Eyebrow>
        <Title>Recommended by Neighbors</Title>
        <Subtitle>{feed?.subtitle || `Furniture picks people around ${suburb} keep saving, buying, and rating highly.`}</Subtitle>
        <Stats>
          <Stat><StatValue>{feed?.totalNeighborSignals || 0}</StatValue><StatLabel>neighbor signals</StatLabel></Stat>
          <Stat><StatValue>{products.length}</StatValue><StatLabel>trusted local finds</StatLabel></Stat>
          <Stat><StatValue>{String(feed?.topCategory || 'home').replace(/_/g, ' ')}</StatValue><StatLabel>top room</StatLabel></Stat>
        </Stats>
      </Hero>
      <Content>
        {loading ? (
          <Loading>Loading neighbor recommendations...</Loading>
        ) : products.length === 0 ? (
          <Empty>Check back soon for neighbor recommendations near {suburb}.</Empty>
        ) : (
          <ProductGrid
            products={products}
            onProductClick={(product) => navigate(`/product/${product.id}`)}
            onAddToCart={handleAddToCart}
          />
        )}
      </Content>
      <BottomNavigation currentPath="/recommended" />
    </Page>
  );
};
