import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LocationSelector from './LocationSelector';
import HyperlocalProductCard from './HyperlocalProductCard';
import ExpansionBanner from './ExpansionBanner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api.js';

/**
 * HyperlocalSearchPage Component
 * Search page with Uber-style radius expansion
 */
const HyperlocalSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(0); // Auto by default
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Johannesburg');
  const [filters, setFilters] = useState({
    inStockOnly: true,
    minRating: 0,
    minPrice: null,
    maxPrice: null,
  });

  useEffect(() => {
    if (location && searchQuery) {
      performSearch();
    }
  }, [location, searchQuery, selectedRadius, filters]);

  const performSearch = async () => {
    if (!location || !searchQuery) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        lat: location.lat,
        lng: location.lng,
        tier_index: selectedRadius,
        in_stock_only: filters.inStockOnly ? '1' : '0',
      });

      if (filters.minRating) params.append('min_rating', filters.minRating);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);

      const response = await fetch(
        `${API_BASE_URL}/hyperlocal/search?${params.toString()}`
      );
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    setAddress('Johannesburg'); // Placeholder
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && location) {
      performSearch();
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Container>
      <Header>
        <LocationSelector
          onLocationChange={handleLocationChange}
          onRadiusChange={setSelectedRadius}
          initialRadius={selectedRadius}
          address={address}
        />

        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder="Search for products, stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchButton type="submit">
            🔍
          </SearchButton>
        </SearchForm>

        <FiltersRow>
          <FilterChip
            active={filters.inStockOnly}
            onClick={() => setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
          >
            ✓ In Stock Only
          </FilterChip>
          <FilterChip
            active={filters.minRating >= 4}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              minRating: prev.minRating >= 4 ? 0 : 4 
            }))}
          >
            ⭐ 4+ Rating
          </FilterChip>
        </FiltersRow>
      </Header>

      <Content>
        {loading && (
          <ExpansionBanner isSearching={true} />
        )}

        {!loading && searchResults && (
          <>
            <ExpansionBanner
              expanded={searchResults.expanded}
              effectiveRadius={searchResults.effectiveRadiusKm}
              effectiveLabel={searchResults.tierLabel}
              expansionSteps={searchResults.expansionSteps}
              query={searchQuery}
            />

            {searchResults.results.length > 0 ? (
              <>
                <ResultsHeader>
                  <ResultsCount>
                    {searchResults.totalResults} results for "{searchQuery}"
                  </ResultsCount>
                  <ResultsSubtext>
                    {searchResults.tierLabel}
                  </ResultsSubtext>
                </ResultsHeader>

                <ProductGrid>
                  {searchResults.results.map((product) => (
                    <HyperlocalProductCard
                      key={product.id}
                      product={product}
                      onClick={handleProductClick}
                    />
                  ))}
                </ProductGrid>
              </>
            ) : (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyText>
                  We couldn't find "{searchQuery}" within {searchResults.effectiveRadiusKm}km
                </EmptyText>
                <EmptyActions>
                  <EmptyButton onClick={() => setSelectedRadius(Math.min(selectedRadius + 1, 4))}>
                    Expand Search Radius
                  </EmptyButton>
                  <EmptyButton secondary onClick={() => setSearchQuery('')}>
                    Try Different Search
                  </EmptyButton>
                </EmptyActions>
              </EmptyState>
            )}
          </>
        )}

        {!loading && !searchResults && searchQuery && (
          <EmptyState>
            <EmptyIcon>📍</EmptyIcon>
            <EmptyTitle>Ready to search</EmptyTitle>
            <EmptyText>
              We'll find the best "{searchQuery}" near you
            </EmptyText>
          </EmptyState>
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme?.colors?.primary || '#007AFF'};
  }
`;

const SearchButton = styled.button`
  padding: 12px 20px;
  background: ${props => props.theme?.colors?.primary || '#007AFF'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme?.colors?.primaryDark || '#0056b3'};
    transform: scale(1.05);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }
`;

const FilterChip = styled.div`
  padding: 8px 16px;
  background: ${props => props.active 
    ? props.theme?.colors?.primary || '#007AFF'
    : '#f0f0f0'
  };
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Content = styled.div`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ResultsHeader = styled.div`
  margin-bottom: 16px;
`;

const ResultsCount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#000'};
`;

const ResultsSubtext = styled.div`
  font-size: 13px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin-top: 4px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#000'};
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin: 0 0 24px 0;
  max-width: 400px;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const EmptyButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.secondary 
    ? 'transparent' 
    : props.theme?.colors?.primary || '#007AFF'
  };
  color: ${props => props.secondary 
    ? props.theme?.colors?.primary || '#007AFF'
    : 'white'
  };
  border: ${props => props.secondary 
    ? `2px solid ${props.theme?.colors?.primary || '#007AFF'}`
    : 'none'
  };
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

export default HyperlocalSearchPage;

