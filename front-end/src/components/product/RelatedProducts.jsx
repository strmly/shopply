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
  margin: 0;
  font-size: 13px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const LoadMoreButton = styled.button`
  width: 100%;
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RelatedProducts = ({ 
  products, 
  location, 
  onProductClick, 
  onAddToCart,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  if (!products || products.length === 0) return null;

  const suburb = location?.suburb || 'your area';

  return (
    <Container>
      <SectionHeader>
        <div>
          <SectionTitle>Related Items Near You</SectionTitle>
          <Subtitle>Available near {suburb}</Subtitle>
        </div>
      </SectionHeader>
      
      <ProductsGrid>
        {products.map((product, index) => (
          <ProductCard
            key={product.id || index}
            product={product}
            onClick={() => onProductClick && onProductClick(product)}
            onAddToCart={() => onAddToCart && onAddToCart(product)}
          />
        ))}
      </ProductsGrid>
      
      {(hasMore || (onLoadMore && products.length >= 4)) && (
        <LoadMoreButton
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}
    </Container>
  );
};











