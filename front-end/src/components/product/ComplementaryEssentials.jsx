import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  margin: ${props => props.theme.spacing.xl} 0;
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 600;
  font-size: 18px;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: ${props => props.theme.spacing.xs} 0 0 0;
  font-size: 13px;
`;

const ProductsScroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: ${props => props.theme.spacing.md} 0;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductsList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  width: max-content;
`;

const ProductWrapper = styled.div`
  width: 160px;
  flex-shrink: 0;
`;

const BundleBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.successBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: 4px 8px;
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-weight: 700;
  font-size: 10px;
  z-index: 10;
`;

export const ComplementaryEssentials = ({ products, mainProduct, location, onProductClick, onAddToCart }) => {
  if (!products || products.length === 0) return null;

  const suburb = location?.suburb || 'your area';

  return (
    <Container>
      <SectionHeader>
        <div>
          <SectionTitle>💡 Complementary Essentials Near You</SectionTitle>
          <Subtitle>Perfect additions to your order</Subtitle>
        </div>
      </SectionHeader>
      
      <ProductsScroll>
        <ProductsList>
          {products.map((product, index) => (
            <ProductWrapper key={product.id || index} style={{ position: 'relative' }}>
              {index === 0 && <BundleBadge>RECOMMENDED</BundleBadge>}
              <ProductCard
                product={product}
                onClick={() => onProductClick && onProductClick(product)}
                onAddToCart={() => onAddToCart && onAddToCart(product)}
              />
            </ProductWrapper>
          ))}
        </ProductsList>
      </ProductsScroll>
    </Container>
  );
};











