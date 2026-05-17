import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ProductCard } from './ProductCard';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  padding: 0 clamp(14px, 5vw, 48px);
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
  min-width: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const LoadMoreButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: min(100%, 420px);
  min-height: 54px;
  margin: 28px auto 0;
  padding: 0 22px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: 0;
  border-radius: 999px;
  ${props => props.theme.typography.button}
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow:
    0 18px 34px rgba(61, 129, 239, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(135deg) translateY(1px);
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    transform: translateY(-2px);
    box-shadow: 0 24px 48px rgba(61, 129, 239, 0.3);
  }

  &:hover::after {
    transform: rotate(135deg) translate(-2px, 3px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 12px 24px rgba(61, 129, 239, 0.14);
  }

  &:disabled::after {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: currentColor;
    border-radius: 999px;
    transform: none;
    animation: ${spin} 0.8s linear infinite;
  }
`;

const SeeMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: min(100%, 420px);
  min-height: 48px;
  margin: 24px auto 0;
  padding: 0 22px;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1.5px solid ${props => props.theme.colors.primary};
  border-radius: 999px;
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &::after {
    content: '';
    width: 7px;
    height: 7px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(45deg) translateY(-1px);
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover {
    background: ${props => props.theme.colors.primary}12;
    transform: translateY(-1px);
  }

  &:hover::after {
    transform: rotate(45deg) translate(2px, -3px);
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
  onSeeMore,
  hasMore = false,
  loading = false,
  itemsPerPage = 8,
}) => {
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);

  useEffect(() => {
    if (!onLoadMore && products.length > 0) {
      setDisplayedCount(itemsPerPage);
    }
  }, [products.length, onLoadMore, itemsPerPage]);

  const validProducts = products.filter(p => p && p.id && p.name);

  const displayedProducts = onLoadMore
    ? validProducts
    : validProducts.slice(0, displayedCount);

  const canLoadMore = !!onLoadMore && !onSeeMore && hasMore;

  const canSeeMore = !!onSeeMore && validProducts.length > itemsPerPage;

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

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
        <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}

      {canSeeMore && (
        <SeeMoreButton onClick={onSeeMore}>
          See More
        </SeeMoreButton>
      )}

      {loading && !canLoadMore && (
        <LoadingText>Loading more products...</LoadingText>
      )}
    </Container>
  );
};
