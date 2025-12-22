import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';

const Container = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const ResultsCount = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const FilterChips = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FilterChip = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : props.theme.colors.surface};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.caption}
  font-weight: 500;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.primary};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.spacing.xxl * 4};
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const RecoverySection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  width: 100%;
`;

const RecoveryTitle = styled.h4`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: left;
`;

const RecoveryChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const RecoveryChip = styled.button`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
  }
`;

export const SearchResults = ({
  results,
  query,
  location,
  loading,
  onProductClick,
  onAddToCart,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  totalResults,
}) => {
  if (loading && results.length === 0) {
    return (
      <Container>
        <LoadingContainer>Searching...</LoadingContainer>
      </Container>
    );
  }

  if (results.length === 0 && !loading) {
    const suburb = location?.suburb || 'your area';
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No matches for "{query}" near {suburb}</EmptyTitle>
          <EmptyText>
            Try searching with different keywords or browse trending items near you.
          </EmptyText>
          
          <RecoverySection>
            <RecoveryTitle>Suggested Alternatives</RecoveryTitle>
            <RecoveryChips>
              <RecoveryChip>Wider radius results</RecoveryChip>
              <RecoveryChip>Popular in {suburb}</RecoveryChip>
              <RecoveryChip>New arrivals</RecoveryChip>
              <RecoveryChip>Similar products</RecoveryChip>
            </RecoveryChips>
          </RecoverySection>
        </EmptyState>
      </Container>
    );
  }

  const suburb = location?.suburb || 'your area';
  const displayCount = totalResults !== undefined ? totalResults : results.length;

  return (
    <Container>
      <ResultsHeader>
        <ResultsCount>
          {displayCount} {displayCount === 1 ? 'item' : 'items'} near {suburb}
        </ResultsCount>
      </ResultsHeader>

      <FilterChips>
        <FilterChip $active>In Stock</FilterChip>
        <FilterChip>On Sale</FilterChip>
        <FilterChip>Under R50</FilterChip>
        <FilterChip>Deliver Today</FilterChip>
        <FilterChip>Free Delivery</FilterChip>
        <FilterChip>Within 1 km</FilterChip>
        <FilterChip>Highly Rated</FilterChip>
        <FilterChip>Popular Nearby</FilterChip>
      </FilterChips>

      <ProductsGrid>
        {results.map((product, index) => (
          <ProductCard
            key={product.id || index}
            product={product}
            onClick={() => onProductClick && onProductClick(product)}
            onAddToCart={() => onAddToCart && onAddToCart(product)}
          />
        ))}
      </ProductsGrid>

      {hasMore && (
        <LoadMoreButton
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}

      {loadingMore && !hasMore && (
        <LoadingText>Loading more products...</LoadingText>
      )}
    </Container>
  );
};

