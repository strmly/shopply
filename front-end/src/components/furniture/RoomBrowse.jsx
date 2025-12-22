import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import furnitureApi from '../../utils/furnitureApi';
import FurnitureProductCard from './FurnitureProductCard';
import FilterPanel from './FilterPanel';

/**
 * Room Browse Component
 * Browse furniture by room with filters
 */

const RoomBrowse = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadRoomProducts();
  }, [roomId, filters]);

  const loadRoomProducts = async () => {
    try {
      setLoading(true);
      
      // Get user location
      const savedLocation = localStorage.getItem('userLocation');
      const location = savedLocation 
        ? JSON.parse(savedLocation) 
        : { lat: -26.2041, lng: 28.0473 };
      
      setUserLocation(location);

      // Fetch products
      const response = await furnitureApi.getProductsByRoom(
        roomId,
        location.lat,
        location.lng
      );
      
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading room products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/furniture/product/${productId}`);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <LoadingText>Loading furniture...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={loadRoomProducts}>Retry</RetryButton>
        </ErrorState>
      </Container>
    );
  }

  const room = data?.room || {};
  const products = data?.products || [];

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
        <HeaderContent>
          <RoomIcon>{room.icon}</RoomIcon>
          <div>
            <RoomTitle>{room.label}</RoomTitle>
            <RoomSubtitle>{products.length} items available near you</RoomSubtitle>
          </div>
        </HeaderContent>
      </Header>

      {/* Filters Bar */}
      <FiltersBar>
        <FilterButton onClick={() => setShowFilters(!showFilters)}>
          🎛️ Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
        </FilterButton>
        <SortButton>
          Sort: Best Match
        </SortButton>
      </FiltersBar>

      {/* Filter Panel (Slide-in) */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <ProductsGrid>
          {products.map((product) => (
            <FurnitureProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </ProductsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyText>No furniture found</EmptyText>
          <EmptySubtext>Try adjusting your filters or search area</EmptySubtext>
        </EmptyState>
      )}
    </Container>
  );
};

// Styled Components

const Container = styled.div`
  min-height: 100vh;
  background: #f9f9f9;
  padding-bottom: 80px;
`;

const Header = styled.div`
  background: white;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #2196f3;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RoomIcon = styled.span`
  font-size: 40px;
`;

const RoomTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const RoomSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
`;

const FiltersBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8e8e8;
  }
`;

const SortButton = styled.button`
  padding: 8px 16px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  padding: 24px;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1976d2;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

export default RoomBrowse;

