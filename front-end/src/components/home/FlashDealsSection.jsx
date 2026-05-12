import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from './ProductCard';

const SectionContainer = styled.section`
  margin: 0 min(5vw, 48px) 34px;
  animation: ${fadeIn} 0.5s ease-in;
`;

const Shell = styled.div`
  position: relative;
  overflow: hidden;
  padding: 22px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(254,247,227,0.9) 100%) padding-box,
    linear-gradient(140deg, rgba(245, 158, 11, 0.28), rgba(61, 129, 239, 0.14), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.09);

  &::after {
    content: '';
    position: absolute;
    right: -56px;
    top: -64px;
    width: 172px;
    height: 172px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.12);
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
  margin-bottom: 18px;

  @media (max-width: 680px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const Icon = styled.div`
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: ${props => props.theme.colors.warning[100]};
  color: ${props => props.theme.colors.warning[600]};
  border: 1px solid rgba(245, 158, 11, 0.24);
  font-size: 26px;
  font-weight: 900;
  box-shadow: 0 16px 32px rgba(245, 158, 11, 0.15);
`;

const Copy = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warning[600]};
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(24px, 4vw, 36px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
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
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    justify-content: flex-start;
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
  border: 1px solid rgba(245, 158, 11, 0.22);
  color: ${props => props.theme.colors.warning[600]};
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.05);
`;

const ViewAllLink = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.text.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 16px 30px rgba(16, 24, 40, 0.16);

  &:hover {
    background: ${props => props.theme.colors.warning[600]};
    transform: translateY(-1px);
  }
`;

const ScrollContainer = styled.div`
  position: relative;
  z-index: 1;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductsList = styled.div`
  display: flex;
  gap: 16px;
  width: max-content;
  padding: 2px 2px 4px;
`;

const ProductWrapper = styled.div`
  width: min(260px, 72vw);
  flex-shrink: 0;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const CountdownBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 11px;
  background: ${props => props.$urgent
    ? 'rgba(239, 68, 68, 0.08)'
    : 'rgba(245, 158, 11, 0.08)'};
  border: 1px solid ${props => props.$urgent
    ? 'rgba(239, 68, 68, 0.2)'
    : 'rgba(245, 158, 11, 0.2)'};
  border-radius: 12px;
`;

const CountdownLabel = styled.span`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: ${props => props.$urgent
    ? props.theme.colors.dangerBase
    : props.theme.colors.warning[600]};
  animation: ${props => props.$urgent ? pulse : 'none'} 1.2s ease-in-out infinite;
`;

const CountdownTime = styled.span`
  font-size: 11px;
  font-weight: 900;
  color: ${props => props.$urgent
    ? props.theme.colors.dangerBase
    : props.theme.colors.warning[700]};
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
`;

const StockBar = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.secondary};
  text-align: right;
`;

const EmptyState = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  padding: 34px 20px 38px;
  text-align: center;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(228, 231, 236, 0.72);
  border-radius: 24px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
`;

const EmptyIcon = styled.div`
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  margin-bottom: 16px;
  background: ${props => props.theme.colors.warning[100]};
  color: ${props => props.theme.colors.warning[600]};
  border: 1px solid rgba(245, 158, 11, 0.24);
  font-size: 30px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(245, 158, 11, 0.14);
`;

const EmptyTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 900;
`;

const EmptyMessage = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  max-width: 360px;
  margin: 0;
  font-weight: 700;
`;

function useCountdown(endDate) {
  const getRemaining = () => {
    const diff = new Date(endDate) - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, total: 0 };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, total: diff };
  };

  const [time, setTime] = useState(getRemaining);

  useEffect(() => {
    if (!endDate) return;
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return time;
}

function FlashCard({ product, onProductClick, onAddToCart }) {
  const endDate = product.flashDeal?.endDate;
  const { h, m, s, total } = useCountdown(endDate);
  const isUrgent = total > 0 && total < 2 * 3600 * 1000;
  const remaining = product.flashDeal?.remaining;

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = total > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : 'Expired';

  const displayProduct = {
    ...product,
    originalPrice: product.price,
    price: product.flashDealPrice ?? product.price,
  };

  return (
    <ProductWrapper>
      <ProductCard
        product={displayProduct}
        variant="flash"
        onClick={() => onProductClick && onProductClick(product)}
        onAddToCart={() => onAddToCart && onAddToCart(product)}
      />
      {endDate && (
        <CountdownBar $urgent={isUrgent}>
          <CountdownLabel $urgent={isUrgent}>Ends in</CountdownLabel>
          <CountdownTime $urgent={isUrgent}>{timeStr}</CountdownTime>
        </CountdownBar>
      )}
      {remaining !== null && remaining !== undefined && (
        <StockBar>{remaining} left</StockBar>
      )}
    </ProductWrapper>
  );
}

export const FlashDealsSection = ({
  products = [],
  onViewAll,
  onProductClick,
  onAddToCart,
}) => {
  const hasDeals = products.length > 0;

  return (
    <SectionContainer>
      <Shell>
        <Header>
          <Icon>%</Icon>
          <Copy>
            <Eyebrow>Limited time only</Eyebrow>
            <Title>Flash Deals</Title>
            <Subtitle>Limited offers with local availability, picked for fast decisions.</Subtitle>
          </Copy>
          <HeaderActions>
            <CountBadge>
              {products.length} {products.length === 1 ? 'deal' : 'deals'} available now
            </CountBadge>
            {hasDeals && onViewAll && (
              <ViewAllLink type="button" onClick={onViewAll}>
                See all deals
              </ViewAllLink>
            )}
          </HeaderActions>
        </Header>

        {hasDeals ? (
          <ScrollContainer>
            <ProductsList>
              {products.map((product, index) => (
                <FlashCard
                  key={product.id || index}
                  product={product}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                />
              ))}
            </ProductsList>
          </ScrollContainer>
        ) : (
          <EmptyState>
            <EmptyIcon>%</EmptyIcon>
            <EmptyTitle>No Flash Deals</EmptyTitle>
            <EmptyMessage>
              Check back soon for limited-time offers from nearby stores.
            </EmptyMessage>
          </EmptyState>
        )}
      </Shell>
    </SectionContainer>
  );
};
