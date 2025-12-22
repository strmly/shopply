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

export const FrequentlyBoughtTogether = ({ products, mainProduct, onProductClick, onAddToCart }) => {
  if (!products || products.length === 0) return null;

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>Frequently Bought Together</SectionTitle>
      </SectionHeader>
      
      <ProductsScroll>
        <ProductsList>
          {products.map((product, index) => (
            <ProductWrapper key={product.id || index}>
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











