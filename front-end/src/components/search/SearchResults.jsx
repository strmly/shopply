import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import { WaveLoader } from '../ui/LoadingSpinner';

const Container = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px min(5vw, 48px);
  animation: ${fadeIn} 0.3s ease-in;
`;

const ResultsHero = styled.section`
  position: relative;
  overflow: hidden;
  margin-bottom: 18px;
  padding: 26px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(241,247,255,0.86) 100%) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.22), rgba(196, 184, 252, 0.18), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.1);

  &::after {
    content: '';
    position: absolute;
    inset: auto 22px 0 auto;
    width: 190px;
    height: 190px;
    background: radial-gradient(circle, rgba(126, 193, 246, 0.2), transparent 70%);
    pointer-events: none;
  }
`;

const ResultsHeader = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: ${props => props.theme.colors.primarySoftText};
  ${props => props.theme.typography.caption}
  font-weight: 900;
  text-transform: uppercase;
`;

const DotMark = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.successBase};
`;

const ResultsTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: 0;
`;

const ResultsSubtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 12px 0 0;
  max-width: 620px;
  font-weight: 500;
`;

const ResultsCount = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 22px;
  padding: 14px 16px;
  min-width: 150px;
  text-align: center;
`;

const CountValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 28px;
  line-height: 1;
  font-weight: 900;
`;

const CountLabel = styled.div`
  ${props => props.theme.typography.caption}
  margin-top: 5px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
`;

const FilterChips = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const FilterChip = styled.button`
  display: flex;
  align-items: center;
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : '#ffffff'};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.3)' : props.theme.colors.border.default};
  border-radius: 999px;
  padding: 8px 11px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.caption}
  font-weight: 900;
  color: ${props => props.$active ? props.theme.colors.primarySoftText : props.theme.colors.text.primary};
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.04);

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const ProductsSurface = styled.div`
  padding: 18px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.05);

  @media (max-width: 640px) {
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: 999px;
  ${props => props.theme.typography.button}
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.16);

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
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
  padding: 16px;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const LoadingContainer = styled.div`
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 12px;
  min-height: 300px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const LoadingMark = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(16, 24, 40, 0.08);
`;

const EmptyState = styled.div`
  display: grid;
  justify-items: center;
  gap: 12px;
  min-height: 360px;
  text-align: center;
  padding: 36px 24px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.22), rgba(196, 184, 252, 0.18), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const EmptyIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 24px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
`;

const EmptyTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 900;
`;

const EmptyText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  max-width: 460px;
  font-weight: 600;
`;

const RecoverySection = styled.div`
  margin-top: 16px;
  width: 100%;
`;

const RecoveryTitle = styled.h4`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 12px;
  font-weight: 900;
`;

const RecoveryChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

const RecoveryChip = styled.button`
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  padding: 10px 12px;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
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
  filters = {},
  onFilterChange,
}) => {
  const toggleFilter = (key, value) => {
    if (!onFilterChange) return;
    const current = filters[key];
    if (current === value || (value === true && current)) {
      const next = { ...filters };
      delete next[key];
      onFilterChange(next);
    } else {
      onFilterChange({ ...filters, [key]: value });
    }
  };
  if (loading && results.length === 0) {
    return (
      <Container>
        <ProductGridSkeleton count={8} />
      </Container>
    );
  }

  if (results.length === 0 && !loading) {
    const suburb = location?.suburb || 'your area';
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>S</EmptyIcon>
          <EmptyTitle>No matches for "{query}" near {suburb}</EmptyTitle>
          <EmptyText>
            Try searching with different keywords or browse trending items near you.
          </EmptyText>

          <RecoverySection>
            <RecoveryTitle>Suggested alternatives</RecoveryTitle>
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
      <ResultsHero>
        <ResultsHeader>
          <div>
            <Eyebrow><DotMark />Curated in {suburb}</Eyebrow>
            <ResultsTitle>Results for "{query}"</ResultsTitle>
            <ResultsSubtitle>
              Beautiful local finds ranked by availability, proximity, and what shoppers nearby are loving.
            </ResultsSubtitle>
          </div>
          <ResultsCount>
            <CountValue>{displayCount}</CountValue>
            <CountLabel>{displayCount === 1 ? 'item' : 'items'} nearby</CountLabel>
          </ResultsCount>
        </ResultsHeader>

        <FilterChips>
          <FilterChip $active={!!filters.inStock} onClick={() => toggleFilter('inStock', true)}>In stock</FilterChip>
          <FilterChip $active={!!filters.onSale} onClick={() => toggleFilter('onSale', true)}>On sale</FilterChip>
          <FilterChip $active={filters.maxPrice === 2000} onClick={() => toggleFilter('maxPrice', 2000)}>Under R2 000</FilterChip>
          <FilterChip $active={!!filters.fastDelivery} onClick={() => toggleFilter('fastDelivery', true)}>Fast delivery</FilterChip>
          <FilterChip $active={!!filters.freeDelivery} onClick={() => toggleFilter('freeDelivery', true)}>Free delivery</FilterChip>
          <FilterChip $active={filters.sortBy === 'rating'} onClick={() => toggleFilter('sortBy', 'rating')}>Highly rated</FilterChip>
          <FilterChip $active={filters.sortBy === 'popular'} onClick={() => toggleFilter('sortBy', 'popular')}>Popular</FilterChip>
        </FilterChips>
      </ResultsHero>

      <ProductsSurface>
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
      </ProductsSurface>

      {hasMore && !loadingMore && (
        <LoadMoreButton onClick={onLoadMore}>
          Load more
        </LoadMoreButton>
      )}

      {loadingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <WaveLoader />
        </div>
      )}
    </Container>
  );
};
