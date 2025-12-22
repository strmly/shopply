import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from './ProductCard';

const SectionContainer = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-in;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  padding: 0 ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  font-weight: 500;
`;

const ViewAllLink = styled.button`
  ${props => props.theme.typography.body2}
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    color: ${props => props.theme.colors.primaryHover};
    transform: translateX(2px);
  }

  &::after {
    content: '→';
    font-size: ${props => props.theme.typography.body1?.match(/font-size:\s*(\d+px)/)?.[1] || '16px'};
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover::after {
    transform: translateX(${props => props.theme.spacing.xs});
  }
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

const CountBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary + '15'};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
`;

const CountText = styled.span`
  margin-left: ${props => props.theme.spacing.sm};
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 ${props => props.theme.spacing.xl};
  scroll-snap-type: x mandatory;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductsList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  width: max-content;
  padding-bottom: ${props => props.theme.spacing.xs};
`;

const ProductWrapper = styled.div`
  width: ${props => props.theme.spacing.xxl * 10};
  flex-shrink: 0;
  scroll-snap-align: start;
`;

export const FlashDealsSection = ({
  products = [],
  onViewAll,
  onProductClick,
  onAddToCart,
}) => {
  const hasDeals = products.length > 0;

  return (
    <SectionContainer>
      <Header>
        <HeaderRow>
          <Title>
            <span>⚡</span>
            Flash Deals
          </Title>
          {hasDeals && onViewAll && (
            <ViewAllLink onClick={onViewAll}>
              See all deals
            </ViewAllLink>
          )}
        </HeaderRow>
        <Subtitle>Limited time offers - Don't miss out!</Subtitle>
        <CountBadge>
          ⏰ Limited Time Only
          <CountText>
            {products.length} {products.length === 1 ? 'deal' : 'deals'} available now
          </CountText>
        </CountBadge>
      </Header>

      {hasDeals ? (
        <ScrollContainer>
          <ProductsList>
            {products.map((product, index) => (
              <ProductWrapper key={product.id || index}>
                <ProductCard
                  product={product}
                  variant="flash"
                  onClick={() => onProductClick && onProductClick(product)}
                  onAddToCart={() => onAddToCart && onAddToCart(product)}
                />
              </ProductWrapper>
            ))}
          </ProductsList>
        </ScrollContainer>
      ) : (
        <EmptyState>
          <EmptyIcon>⚡</EmptyIcon>
          <EmptyTitle>No Flash Deals</EmptyTitle>
          <EmptyMessage>
            Check back soon for amazing limited-time deals!
          </EmptyMessage>
        </EmptyState>
      )}
    </SectionContainer>
  );
};

