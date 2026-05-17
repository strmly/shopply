import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';

const Section = styled.section`
  width: min(1180px, calc(100% - 28px));
  margin: 0 auto 38px;
  animation: ${fadeIn} 0.35s ease;
`;

const Shell = styled.div`
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.24), rgba(21,161,124,0.16), rgba(196,184,252,0.24)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  padding: clamp(16px, 3vw, 22px);
  box-shadow: 0 22px 54px rgba(16, 24, 40, 0.08);
  overflow: hidden;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: end;
  margin-bottom: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(24px, 5vw, 36px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  max-width: 720px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
`;

const SeeAll = styled.button`
  min-height: 42px;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(61,129,239,0.22);
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228,231,236,0.9);
  border-radius: 18px;
  padding: 12px;
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
  margin-top: 5px;
`;

const Rail = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 2px 2px 8px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Item = styled.div`
  width: clamp(220px, 44vw, 264px);
  flex: 0 0 auto;
  scroll-snap-align: start;
`;

const Signal = styled.div`
  margin-top: 10px;
  border: 1px solid rgba(228,231,236,0.9);
  border-radius: 18px;
  padding: 11px;
  background: rgba(255,255,255,0.86);
`;

const SignalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const NeighborStack = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-left: -7px;
  border: 2px solid #ffffff;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 10px;
  font-weight: 900;

  &:first-child {
    margin-left: 0;
  }
`;

const Pill = styled.span`
  border-radius: 999px;
  padding: 5px 9px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;

const Reason = styled.div`
  margin-top: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.35;
  font-weight: 800;
`;

const LoadingCard = styled.div`
  height: 360px;
  width: clamp(220px, 44vw, 264px);
  flex: 0 0 auto;
  border-radius: 24px;
  background: linear-gradient(110deg, #eef4ff 8%, #ffffff 18%, #eef4ff 33%);
  background-size: 200% 100%;
  animation: shimmer 1.3s linear infinite;

  @keyframes shimmer {
    to { background-position-x: -200%; }
  }
`;

export const CommunityRecommendations = ({ location, onProductClick, onAddToCart }) => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  const suburb = location?.suburb || location?.city || 'your area';

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '10', suburb });
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
  if (!loading && products.length === 0) return null;

  return (
    <Section>
      <Shell>
        <Header>
          <div>
            <Eyebrow>Community picks</Eyebrow>
            <Title>Recommended by Neighbors</Title>
            <Subtitle>{feed?.subtitle || `Furniture picks people around ${suburb} keep saving, buying, and rating highly.`}</Subtitle>
          </div>
          <SeeAll type="button" onClick={() => navigate('/recommended')}>See all</SeeAll>
        </Header>

        <Stats>
          <Stat>
            <StatValue>{feed?.totalNeighborSignals || 0}</StatValue>
            <StatLabel>neighbor signals nearby</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{products.length || '...'}</StatValue>
            <StatLabel>locally trusted picks</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{String(feed?.topCategory || 'home').replace(/_/g, ' ')}</StatValue>
            <StatLabel>most recommended room</StatLabel>
          </Stat>
        </Stats>

        <Rail>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <LoadingCard key={index} />)
            : products.map(product => (
              <Item key={product.id}>
                <ProductCard
                  product={product}
                  variant="recommended"
                  onClick={() => onProductClick ? onProductClick(product) : navigate(`/product/${product.id}`)}
                  onAddToCart={() => onAddToCart && onAddToCart(product)}
                />
                <Signal>
                  <SignalRow>
                    <NeighborStack>
                      {(product.neighborSignal?.curatorNames || []).map(name => (
                        <Avatar key={name}>{name.slice(0, 1)}</Avatar>
                      ))}
                    </NeighborStack>
                    <Pill>{product.neighborSignal?.neighborCount || 0} neighbors</Pill>
                  </SignalRow>
                  <Reason>
                    Recommended for {product.neighborSignal?.reason || 'strong local quality'}.
                  </Reason>
                </Signal>
              </Item>
            ))}
        </Rail>
      </Shell>
    </Section>
  );
};
