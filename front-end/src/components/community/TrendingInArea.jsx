import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';
import API_BASE_URL from '@config/api';

const Section = styled.section`
  margin: 0 clamp(14px, 5vw, 48px) 34px;
  animation: ${fadeIn} 0.4s ease-in;
`;

const Shell = styled.div`
  position: relative;
  overflow: hidden;
  padding: 22px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(241,245,255,0.9) 100%) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.24), rgba(196,184,252,0.16), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.09);

  @media (max-width: 520px) {
    padding: 16px;
    border-radius: 24px;
  }

  &::after {
    content: '';
    position: absolute;
    right: -56px;
    top: -64px;
    width: 172px;
    height: 172px;
    border-radius: 999px;
    background: rgba(61, 129, 239, 0.08);
    pointer-events: none;
  }
`;

const Header = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 680px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const HeaderIcon = styled.div`
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.2);
  font-size: 22px;
  font-weight: 900;
  box-shadow: 0 16px 32px rgba(61, 129, 239, 0.14);

  @media (max-width: 520px) {
    width: 48px;
    height: 48px;
    border-radius: 17px;
    font-size: 18px;
  }
`;

const HeaderCopy = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(22px, 3.5vw, 32px);
  line-height: 1;
  font-weight: 900;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 8px 0 0;
  font-weight: 700;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    flex-wrap: wrap;
  }
`;

const CountBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(61, 129, 239, 0.2);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.05);
`;

const Grid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const CardWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TrendBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  background: ${props => props.theme.colors.successSoftBg};
  border: 1px solid rgba(34, 197, 94, 0.18);
`;

const TrendArrow = styled.span`
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.theme.colors.successBase};
  text-transform: uppercase;
`;

const TrendText = styled.span`
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.theme.colors.successBase};
`;

const TrendReason = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const SkeletonCard = styled.div`
  aspect-ratio: 1 / 1.5;
  background: linear-gradient(90deg, rgba(228,231,236,0.4) 25%, rgba(248,250,252,0.6) 50%, rgba(228,231,236,0.4) 75%);
  background-size: 200% 100%;
  border-radius: 24px;
  animation: shimmer 1.4s ease-in-out infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ViewAllBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  transition: all 0.18s ease;
  box-shadow: 0 16px 30px rgba(16, 24, 40, 0.16);
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    transform: translateY(-1px);
  }
`;

export const TrendingInArea = ({ location, limit = 3, showViewAll = true }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const suburb = location?.suburb || 'Your Area';

  useEffect(() => {
    load();
  }, [location]);

  const load = async () => {
    try {
      setLoading(true);

      // Try H3 trending endpoint if coordinates are available
      let storedLocation = null;
      try {
        storedLocation = JSON.parse(localStorage.getItem('shopply_location') || 'null');
      } catch {}

      if (storedLocation?.lat && storedLocation?.lng) {
        const h3Res = await fetch(
          `${API_BASE_URL}/hyperlocal/trending?lat=${storedLocation.lat}&lng=${storedLocation.lng}&limit=9`
        );
        const h3Data = await h3Res.json();
        if (h3Data.success && h3Data.data?.products?.length > 0) {
          const prods = h3Data.data.products.map(p => ({ ...p, _trend: { reason: h3Data.data.tierLabel || 'Trending nearby' } }));
          setTotal(prods.length);
          setItems(prods);
          return;
        }
      }

      // Fallback: community/trending endpoint
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const trendRes = await fetch(
        `${API_BASE_URL}/community/trending?location=${locationParam}&limit=9`
      );
      const trendData = await trendRes.json();

      if (!trendData.success || !trendData.data?.length) {
        setItems([]);
        return;
      }

      const trending = trendData.data.filter(t => t.productId);
      setTotal(trending.length);

      const products = await Promise.all(
        trending.map(t =>
          fetch(`${API_BASE_URL}/products/${t.productId}`)
            .then(r => r.json())
            .then(d => d.success ? { ...d.data, _trend: t } : null)
            .catch(() => null)
        )
      );

      const all = products.filter(Boolean);
      setItems(all);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Shell>
          <Header>
            <HeaderIcon>S</HeaderIcon>
            <HeaderCopy>
              <Eyebrow>Trending in {suburb}</Eyebrow>
              <Title>Local demand is moving</Title>
            </HeaderCopy>
          </Header>
          <LoadingGrid>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </LoadingGrid>
        </Shell>
      </Section>
    );
  }

  if (items.length === 0) return null;

  const displayed = items.slice(0, limit);

  return (
    <Section>
      <Shell>
        <Header>
          <HeaderIcon>S</HeaderIcon>
          <HeaderCopy>
            <Eyebrow>Trending in {suburb}</Eyebrow>
            <Title>Local demand is moving</Title>
            <Subtitle>Products gaining traction near you right now.</Subtitle>
          </HeaderCopy>
          <HeaderActions>
            <CountBadge>{total || items.length} popular now</CountBadge>
            {showViewAll && (
              <ViewAllBtn onClick={() => navigate('/trending', { state: { location } })}>
                See all
              </ViewAllBtn>
            )}
          </HeaderActions>
        </Header>

        <Grid>
          {displayed.map((product) => {
            const trend = product._trend;
            const pct = trend?.trendPercent;
            const reason = trend?.reason || 'Trending nearby';
            return (
              <CardWrap key={product.id}>
                <ProductCard
                  product={product}
                  variant="hot"
                  onClick={() => navigate(`/product/${product.id}`)}
                  onAddToCart={() => {}}
                />
                <TrendBadge>
                  <TrendArrow>UP</TrendArrow>
                  {pct != null && <TrendText>+{pct}%</TrendText>}
                  <TrendReason>{reason}</TrendReason>
                </TrendBadge>
              </CardWrap>
            );
          })}
        </Grid>
      </Shell>
    </Section>
  );
};
