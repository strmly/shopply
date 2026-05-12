import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from './ProductCard';

const ModuleContainer = styled.section`
  margin-bottom: 38px;
  animation: ${fadeIn} 0.5s ease-in;
  overflow: hidden;

  @media (max-width: 520px) {
    margin-bottom: 30px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  padding: 0 clamp(14px, 5vw, 48px);
  margin: 0 auto ${props => props.theme.spacing.md};
  max-width: 1180px;
  min-width: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  @media (max-width: 380px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 800;
  line-height: 1.3;
  min-width: 0;

  @media (max-width: 520px) {
    font-size: 22px;
    line-height: 1.15;
  }

  @media (max-width: 360px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  font-weight: 500;
  max-width: 680px;
  overflow-wrap: anywhere;
`;

const ViewAllLink = styled.button`
  ${props => props.theme.typography.body2}
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  font-weight: 600;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 14px 28px rgba(61, 129, 239, 0.22);

  &:hover {
    color: ${props => props.theme.colors.text.inverse};
    transform: translateY(-1px);
    box-shadow: 0 18px 34px rgba(61, 129, 239, 0.28);
  }

  &::after {
    content: '→';
    font-size: ${props => props.theme.typography.body1?.match(/font-size:\s*(\d+px)/)?.[1] || '16px'};
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover::after {
    transform: translateX(2px);
  }

  @media (max-width: 380px) {
    min-height: 34px;
    padding: 0 12px;
  }
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 clamp(14px, 5vw, 48px);
  scroll-snap-type: x mandatory;
  scroll-padding-inline: clamp(14px, 5vw, 48px);
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductsList = styled.div`
  display: flex;
  gap: 16px;
  width: max-content;
  padding: 2px 0 ${props => props.theme.spacing.xs};
  margin: 0 auto;
  max-width: 1180px;

  @media (max-width: 520px) {
    gap: 12px;
    margin: 0;
  }
`;

const ProductWrapper = styled.div`
  width: clamp(210px, 46vw, 260px);
  flex-shrink: 0;
  scroll-snap-align: start;

  @media (max-width: 760px) {
    width: clamp(210px, 56vw, 250px);
  }

  @media (max-width: 420px) {
    width: min(82vw, 250px);
  }

  @media (max-width: 340px) {
    width: calc(100vw - 28px);
  }
`;

export const DiscoveryModule = ({ 
  title, 
  subtitle,
  geoLabel,
  products = [], 
  viewAllText = 'See all',
  onViewAll,
  onProductClick,
  onAddToCart,
  variant,
}) => {
  // Debug: Log if products are empty
  if (products.length === 0) {
    console.log(`DiscoveryModule "${title}": No products to display`);
    return null;
  }
  
  // Filter out any null/undefined products
  const validProducts = products.filter(p => p && p.id);
  if (validProducts.length === 0) {
    console.warn(`DiscoveryModule "${title}": All products are invalid`, products);
    return null;
  }

  const displaySubtitle = subtitle || geoLabel;

  return (
    <ModuleContainer>
      <Header>
        <HeaderRow>
          <Title>{title}</Title>
          {onViewAll && (
            <ViewAllLink onClick={onViewAll}>
              {viewAllText}
            </ViewAllLink>
          )}
        </HeaderRow>
        {displaySubtitle && (
          <Subtitle>{displaySubtitle}</Subtitle>
        )}
      </Header>
      <ScrollContainer>
        <ProductsList>
          {validProducts.map((product, index) => (
            <ProductWrapper key={product.id || index}>
              <ProductCard
                product={product}
                variant={variant}
                onClick={() => onProductClick && onProductClick(product)}
                onAddToCart={() => onAddToCart && onAddToCart(product)}
              />
            </ProductWrapper>
          ))}
        </ProductsList>
      </ScrollContainer>
    </ModuleContainer>
  );
};
