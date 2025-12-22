import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ProductCard } from './ProductCard';

const Container = styled.div`
  padding: 0 ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${props => props.theme.spacing.sm};

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
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

const LoadingText = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

export const ProductGrid = ({ 
  products = [], 
  onProductClick, 
  onAddToCart,
  onLoadMore,
  hasMore = false,
  loading = false,
  itemsPerPage = 4,
}) => {
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);

  // Reset displayed count when products change (for client-side pagination)
  useEffect(() => {
    if (!onLoadMore && products.length > 0) {
      setDisplayedCount(itemsPerPage);
    }
  }, [products.length, onLoadMore, itemsPerPage]);
  
  // Filter out invalid products
  const validProducts = products.filter(p => p && p.id && p.name);
  
  // If onLoadMore is provided, show all products (API pagination)
  // Otherwise, show only displayedCount items (client-side pagination)
  const displayedProducts = onLoadMore 
    ? validProducts 
    : validProducts.slice(0, displayedCount);
  
  const canLoadMore = onLoadMore 
    ? hasMore 
    : displayedCount < validProducts.length;

  const handleLoadMore = () => {
    if (onLoadMore) {
      // If there's a load more handler, use it (for API pagination)
      onLoadMore();
    } else {
      // Otherwise, just show more items from the current list
      setDisplayedCount(prev => prev + itemsPerPage);
    }
  };

  // Debug logging
  if (products.length > 0 && validProducts.length === 0) {
    console.warn('ProductGrid: All products are invalid', products);
  }

  if (validProducts.length === 0 && !loading) return null;

  return (
    <Container>
      <Grid>
        {displayedProducts.map((product, index) => (
          <ProductCard
            key={product.id || index}
            product={product}
            onClick={() => onProductClick && onProductClick(product)}
            onAddToCart={() => onAddToCart && onAddToCart(product)}
          />
        ))}
      </Grid>
      
      {canLoadMore && (
        <LoadMoreButton
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}
      
      {loading && !canLoadMore && (
        <LoadingText>Loading more products...</LoadingText>
      )}
    </Container>
  );
};











