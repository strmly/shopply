import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';

/* ─── Layout ─────────────────────────────────────────── */

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #F8FAFC 100%);
  padding-bottom: 80px;
  animation: ${fadeIn} 0.4s ease-in;
`;

const Nav = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);
  padding: 0 min(5vw, 48px);
  height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  background: #ffffff;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  flex-shrink: 0;
  transition: all 0.18s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
    transform: translateY(-1px);
  }
`;

const NavTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const NavSub = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: auto;
`;

const Body = styled.div`
  padding: 28px min(5vw, 48px) 0;
`;

/* ─── Header card ─────────────────────────────────────── */

const HeroCard = styled.div`
  position: relative;
  overflow: hidden;
  padding: 28px 28px 24px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(241,245,255,0.9) 100%) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.24), rgba(196,184,252,0.16), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.09);
  margin-bottom: 24px;

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

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.div`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.theme.colors.primarySoftText};
  margin-bottom: 6px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px;
  line-height: 1.05;
`;

const HeroSub = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

/* ─── Grid ────────────────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const CardWrap = styled.div`
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

/* ─── Skeleton ────────────────────────────────────────── */

const SkeletonGrid = styled(Grid)``;

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

const Empty = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 700;
`;

/* ─── Component ───────────────────────────────────────── */

export const TrendingPage = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const location = routerLocation.state?.location || null;
  const suburb = location?.suburb || 'Your Area';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
        const trendRes = await fetch(
          `${API_BASE_URL}/community/trending?location=${locationParam}&limit=30`
        );
        const trendData = await trendRes.json();

        if (!trendData.success || !trendData.data?.length) {
          setItems([]);
          return;
        }

        const trending = trendData.data.filter(t => t.productId);

        const products = await Promise.all(
          trending.map(t =>
            fetch(`${API_BASE_URL}/products/${t.productId}`)
              .then(r => r.json())
              .then(d => d.success ? { ...d.data, _trend: t } : null)
              .catch(() => null)
          )
        );

        setItems(products.filter(Boolean));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Page>
      <Nav>
        <BackBtn onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </BackBtn>
        <NavTitle>Trending in {suburb}</NavTitle>
        {!loading && <NavSub>{items.length} popular now</NavSub>}
      </Nav>

      <Body>
        <HeroCard>
          <HeroInner>
            <Eyebrow>Local demand</Eyebrow>
            <HeroTitle>What's moving near you</HeroTitle>
            <HeroSub>Products gaining traction in {suburb} right now — ranked by local demand signals.</HeroSub>
          </HeroInner>
        </HeroCard>

        {loading ? (
          <SkeletonGrid>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </SkeletonGrid>
        ) : items.length === 0 ? (
          <Empty>No trending products found for your area right now.</Empty>
        ) : (
          <Grid>
            {items.map((product) => {
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
        )}
      </Body>

      <BottomNavigation currentPath="/trending" />
    </Page>
  );
};
