import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import furnitureApi from '../../utils/furnitureApi';
import FurnitureProductCard from './FurnitureProductCard';
import RoomCard from './RoomCard';
import SellerCard from './SellerCard';
import SearchBar from './SearchBar';

/**
 * Furniture Home Screen - Main marketplace entry point
 * Features: Room-led browsing, hyperlocal products, top-rated sellers
 */

const FurnitureHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [tier, setTier] = useState('auto');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Get user location (from localStorage or geolocation)
      const savedLocation = localStorage.getItem('userLocation');
      let location;
      
      if (savedLocation) {
        location = JSON.parse(savedLocation);
      } else {
        // Default to Johannesburg if no location
        location = { lat: -26.2041, lng: 28.0473 };
      }
      
      setUserLocation(location);

      // Fetch home feed
      const response = await furnitureApi.getHome(location.lat, location.lng, tier);
      
      if (response.success) {
        setHomeData(response.data);
      } else {
        setError('Failed to load furniture marketplace');
      }
    } catch (err) {
      console.error('Error loading home:', err);
      setError('Unable to load furniture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    navigate(`/furniture/search?q=${encodeURIComponent(query)}`);
  };

  const handleRoomClick = (roomId) => {
    navigate(`/furniture/room/${roomId}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/furniture/product/${productId}`);
  };

  const handleSellerClick = (sellerId) => {
    navigate(`/furniture/seller/${sellerId}`);
  };

  const handleChangeTier = (newTier) => {
    setTier(newTier);
    loadHomeData();
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <LoadingText>Finding furniture near you...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={loadHomeData}>Retry</RetryButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header with location */}
      <Header>
        <LocationChip onClick={() => navigate('/furniture/location')}>
          <LocationIcon>📍</LocationIcon>
          <LocationText>
            Delivering to {userLocation ? 'Your Location' : 'Johannesburg'}
          </LocationText>
        </LocationChip>
        <TierChip onClick={() => handleChangeTier(tier === 'auto' ? 'T0' : 'auto')}>
          {tier === 'auto' ? 'Auto' : tier} · {homeData?.metadata?.tierLabel || 'Within 5km'}
        </TierChip>
      </Header>

      {/* Search Bar */}
      <SearchSection>
        <SearchBar 
          placeholder="Search sofas, beds, desks..."
          onSearch={handleSearch}
        />
      </SearchSection>

      {/* Modules */}
      {homeData?.modules?.map((module) => (
        <Module key={module.id}>
          <ModuleHeader>
            <ModuleTitle>{module.title}</ModuleTitle>
            {module.subtitle && <ModuleSubtitle>{module.subtitle}</ModuleSubtitle>}
            <ViewAllLink onClick={() => navigate(`/furniture/${module.id}`)}>
              View All →
            </ViewAllLink>
          </ModuleHeader>

          {module.type === 'products' && (
            <ProductGrid>
              {module.items.slice(0, 6).map((product) => (
                <FurnitureProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </ProductGrid>
          )}

          {module.type === 'rooms' && (
            <RoomGrid>
              {module.items.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onClick={() => handleRoomClick(room.id)}
                />
              ))}
            </RoomGrid>
          )}

          {module.type === 'sellers' && (
            <SellerGrid>
              {module.items.slice(0, 4).map((seller) => (
                <SellerCard
                  key={seller.id}
                  seller={seller}
                  onClick={() => handleSellerClick(seller.sellerId)}
                />
              ))}
            </SellerGrid>
          )}
        </Module>
      ))}

      {/* Infinite scroll placeholder */}
      <InfiniteScrollTrigger>
        <LoadMoreText>Load more furniture...</LoadMoreText>
      </InfiniteScrollTrigger>
    </Container>
  );
};

// Styled Components

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding-bottom: 80px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LocationChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8e8e8;
  }
`;

const LocationIcon = styled.span`
  font-size: 14px;
`;

const LocationText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #333;
`;

const TierChip = styled.button`
  padding: 8px 12px;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #bbdefb;
  }
`;

const SearchSection = styled.div`
  padding: 16px;
  background: white;
`;

const Module = styled.section`
  margin: 24px 0;
  padding: 0 16px;
`;

const ModuleHeader = styled.div`
  margin-bottom: 16px;
`;

const ModuleTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const ModuleSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const SellerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

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

const ErrorIcon = styled.div`
  font-size: 48px;
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

const InfiniteScrollTrigger = styled.div`
  padding: 24px;
  text-align: center;
`;

const LoadMoreText = styled.p`
  color: #999;
  font-size: 14px;
`;

export default FurnitureHome;

