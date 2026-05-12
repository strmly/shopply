import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from './ProductCard';

const ModuleContainer = styled.section`
  margin-bottom: 38px;
  animation: ${fadeIn} 0.5s ease-in;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  padding: 0 min(5vw, 48px);
  margin: 0 auto ${props => props.theme.spacing.md};
  max-width: 1180px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 800;
  line-height: 1.3;
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
  padding: 8px 0;
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

const ScrollContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 min(5vw, 48px);
  scroll-snap-type: x mandatory;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductsList = styled.div`
  display: flex;
  gap: 16px;
  width: max-content;
  padding-bottom: ${props => props.theme.spacing.xs};
  margin: 0 auto;
  max-width: 1180px;
`;

const ProductWrapper = styled.div`
  width: 260px;
  flex-shrink: 0;
  scroll-snap-align: start;

  @media (max-width: 640px) {
    width: 220px;
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
