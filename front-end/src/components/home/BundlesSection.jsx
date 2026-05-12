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
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(232,245,235,0.9) 100%) padding-box,
    linear-gradient(140deg, rgba(34,197,94,0.22), rgba(61,129,239,0.12), rgba(255,255,255,0.82)) border-box;
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
    background: rgba(34, 197, 94, 0.1);
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

const HeaderIcon = styled.div`
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(34, 197, 94, 0.12);
  color: ${props => props.theme.colors.successBase || '#16a34a'};
  border: 1px solid rgba(34, 197, 94, 0.24);
  font-size: 22px;
  font-weight: 900;
  box-shadow: 0 16px 32px rgba(34, 197, 94, 0.14);
`;

const HeaderCopy = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase || '#16a34a'};
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
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    justify-content: flex-start;
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
  border: 1px solid rgba(34, 197, 94, 0.22);
  color: ${props => props.theme.colors.successBase || '#16a34a'};
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
    background: ${props => props.theme.colors.successBase || '#16a34a'};
    transform: translateY(-1px);
  }
`;

const SavingsBadge = styled.div`
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.theme.colors.successBase || '#16a34a'};
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  padding: 4px 8px;
  margin-top: 6px;
  width: fit-content;
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
  gap: 6px;
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.lg};
  margin: 0 ${props => props.theme.spacing.xl};
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.spacing.xxl * 2};
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  font-weight: 600;
`;

const EmptyMessage = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

export const BundlesSection = ({
  products = [],
  suburb = 'Your Area',
  onViewAll,
  onProductClick,
  onAddToCart,
}) => {
  const hasBundles = products.length > 0;

  return (
    <SectionContainer>
      <Shell>
        <Header>
          <HeaderIcon>B</HeaderIcon>
          <HeaderCopy>
            <Eyebrow>Curated sets</Eyebrow>
            <Title>Bundles Near You</Title>
            <Subtitle>Save more when you buy a curated set in {suburb}.</Subtitle>
          </HeaderCopy>
          <HeaderActions>
            <CountBadge>
              {products.length} {products.length === 1 ? 'bundle' : 'bundles'} available
            </CountBadge>
            {hasBundles && onViewAll && (
              <ViewAllLink onClick={onViewAll}>See all</ViewAllLink>
            )}
          </HeaderActions>
        </Header>

        {hasBundles ? (
          <ScrollContainer>
            <ProductsList>
              {products.map((product, index) => {
                const savings = product.originalPrice && product.discount
                  ? Math.round(product.originalPrice - product.price)
                  : null;
                const displayProduct = {
                  ...product,
                  originalPrice: product.originalPrice ?? null,
                };
                return (
                  <ProductWrapper key={product.id || index}>
                    <ProductCard
                      product={displayProduct}
                      variant="bundle"
                      onClick={() => onProductClick && onProductClick(product)}
                      onAddToCart={() => onAddToCart && onAddToCart(product)}
                    />
                    {savings && (
                      <SavingsBadge>Save R{savings.toLocaleString()} vs buying separately</SavingsBadge>
                    )}
                  </ProductWrapper>
                );
              })}
            </ProductsList>
          </ScrollContainer>
        ) : (
          <EmptyState>
            <EmptyIcon>B</EmptyIcon>
            <EmptyTitle>No Bundles Available</EmptyTitle>
            <EmptyMessage>Check back soon for curated bundle deals.</EmptyMessage>
          </EmptyState>
        )}
      </Shell>
    </SectionContainer>
  );
};


