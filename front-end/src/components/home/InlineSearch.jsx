import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { SearchIdleState } from '../search/SearchIdleState';
import { SearchAutocomplete } from '../search/SearchAutocomplete';
import { SearchResults } from '../search/SearchResults';
import { FilterOverlay } from '../search/FilterOverlay';

const SearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.neutral[900] + '80'};
  z-index: 2000;
  animation: ${fadeIn} 0.2s ease-in;
`;

const SearchPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background};
  max-height: 100vh;
  overflow-y: auto;
  animation: slideDown 0.3s ease-out;
  box-shadow: ${props => props.theme.shadows.lg};

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const SearchHeader = styled.div`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  z-index: 10;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  backdrop-filter: blur(10px);
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  padding-left: ${props => `calc(${props.theme.spacing.xl} + ${props.theme.spacing.lg})`};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.pill};
  background: ${props => props.theme.colors.surface};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.background};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.spacing.lg};
  pointer-events: none;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.8;
  }
`;

const FilterButton = styled.button`
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const SortButton = styled(FilterButton)`
  margin-left: ${props => props.theme.spacing.xs};
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
  align-items: center;
`;

import API_BASE_URL from '@config/api';

export const InlineSearch = ({ location, onClose, onProductClick, onAddToCart }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [repeatPurchases, setRepeatPurchases] = useState([]);
  const [smartShortcuts, setSmartShortcuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('relevance');
  const [searchState, setSearchState] = useState('idle'); // idle, typing, results
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const inputRef = useRef(null);

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }

    // Load recent and trending searches
    loadRecentSearches();
    loadTrendingSearches();
    loadRepeatPurchases();
    loadSmartShortcuts();
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setSearchState('idle');
      setSuggestions(null);
      setSearchResults([]);
      setSearchPage(1);
      setHasMoreResults(false);
      setTotalResults(0);
      return;
    }

    if (query.length >= 2) {
      setSearchState('typing');
      loadSuggestions();
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        setSearchPage(1);
        performSearch(1, true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, sortBy]);

  const loadRecentSearches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/recent`);
      const data = await response.json();
      if (data.success) {
        setRecentSearches(data.data);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadTrendingSearches = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const response = await fetch(`${API_BASE_URL}/search/trending?suburb=${suburb}`);
      const data = await response.json();
      if (data.success) {
        setTrendingSearches(data.data);
      }
    } catch (error) {
      console.error('Error loading trending searches:', error);
    }
  };

  const loadRepeatPurchases = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const city = location?.city || 'Johannesburg';
      const lat = location?.lat || -26.1076;
      const lng = location?.lng || 28.0567;

      const response = await fetch(
        `${API_BASE_URL}/search/repeat-purchases?suburb=${suburb}&city=${city}&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      if (data.success) {
        setRepeatPurchases(data.data);
      }
    } catch (error) {
      console.error('Error loading repeat purchases:', error);
    }
  };

  const loadSmartShortcuts = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const response = await fetch(`${API_BASE_URL}/search/shortcuts?suburb=${suburb}`);
      const data = await response.json();
      if (data.success) {
        setSmartShortcuts(data.data);
      }
    } catch (error) {
      console.error('Error loading smart shortcuts:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const city = location?.city || 'Johannesburg';
      const lat = location?.lat || -26.1076;
      const lng = location?.lng || 28.0567;

      const response = await fetch(
        `${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}&suburb=${suburb}&city=${city}&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async (page = 1, resetResults = false) => {
    if (!query.trim()) return;

    if (resetResults) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const suburb = location?.suburb || 'Sandton';
      const city = location?.city || 'Johannesburg';
      const lat = location?.lat || -26.1076;
      const lng = location?.lng || 28.0567;

      const params = new URLSearchParams({
        q: query,
        suburb,
        city,
        lat: lat.toString(),
        lng: lng.toString(),
        sortBy,
        page: page.toString(),
        limit: '16', // Load 16 items per page (4x4 grid)
        ...filters,
      });

      const response = await fetch(`${API_BASE_URL}/search/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (resetResults) {
          setSearchResults(data.data || []);
        } else {
          setSearchResults(prev => [...prev, ...(data.data || [])]);
        }
        setSearchState('results');
        setSearchPage(page);
        setHasMoreResults(data.pagination?.hasMore || false);
        setTotalResults(data.pagination?.total || data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = searchPage + 1;
    performSearch(nextPage, false);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      setQuery(suggestion.label);
    } else if (suggestion.type === 'category') {
      setQuery(suggestion.data.category);
    } else if (suggestion.type === 'store') {
      setQuery(suggestion.label);
    } else if (suggestion.type === 'contextual' || suggestion.type === 'semantic') {
      setQuery(suggestion.data?.searchTerm || suggestion.label);
    }
  };

  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
  };

  const handleTrendingSearchClick = (searchTerm) => {
    setQuery(searchTerm);
  };

  const handleRemoveRecentSearch = async (searchTerm) => {
    try {
      await fetch(`${API_BASE_URL}/search/recent`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm }),
      });
      loadRecentSearches();
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== false).length;

  return (
    <SearchOverlay onClick={onClose}>
      <SearchPanel onClick={(e) => e.stopPropagation()}>
        <SearchHeader>
          <SearchBarContainer>
            <SearchWrapper>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                ref={inputRef}
                type="text"
                placeholder="Search nearby stores…"
                value={query}
                onChange={handleQueryChange}
              />
            </SearchWrapper>
            <CloseButton onClick={onClose}>Cancel</CloseButton>
          </SearchBarContainer>
          {searchState === 'results' && (
            <FilterRow>
              <FilterButton 
                $active={showFilters || activeFilterCount > 0}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </FilterButton>
              <SortButton
                $active={sortBy !== 'relevance'}
                onClick={() => {
                  const sortOptions = ['relevance', 'nearest', 'price_asc', 'price_desc', 'popular', 'rating'];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
              >
                Sort: {sortBy === 'relevance' ? 'Relevance' : 
                       sortBy === 'nearest' ? 'Nearest' :
                       sortBy === 'price_asc' ? 'Price ↑' :
                       sortBy === 'price_desc' ? 'Price ↓' :
                       sortBy === 'popular' ? 'Popular' : 'Rating'}
              </SortButton>
            </FilterRow>
          )}
        </SearchHeader>

        {searchState === 'idle' && (
          <SearchIdleState
            recentSearches={recentSearches}
            trendingSearches={trendingSearches}
            repeatPurchases={repeatPurchases}
            smartShortcuts={smartShortcuts}
            location={location}
            onRecentSearchClick={handleRecentSearchClick}
            onTrendingSearchClick={handleTrendingSearchClick}
            onRemoveRecentSearch={handleRemoveRecentSearch}
            onRepeatPurchaseClick={handleProductClick}
            onShortcutClick={(shortcut) => {
              setFilters(shortcut.filter || {});
              setQuery('');
            }}
            onCategoryClick={(category) => {
              setQuery(category.label);
            }}
          />
        )}

        {searchState === 'typing' && suggestions && (
          <SearchAutocomplete
            suggestions={suggestions}
            query={query}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {searchState === 'results' && (
          <SearchResults
            results={searchResults}
            query={query}
            location={location}
            loading={loading}
            onProductClick={handleProductClick}
            onAddToCart={onAddToCart}
            onLoadMore={handleLoadMore}
            hasMore={hasMoreResults}
            loadingMore={loadingMore}
            totalResults={totalResults}
          />
        )}

        {showFilters && (
          <FilterOverlay
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </SearchPanel>
    </SearchOverlay>
  );
};

