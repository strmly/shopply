import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LocationSelector from './LocationSelector';
import HyperlocalProductCard from './HyperlocalProductCard';
import ExpansionBanner from './ExpansionBanner';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api.js';

/**
 * HyperlocalHomePage Component
 * Main home screen with hyperlocal product discovery
 */
const HyperlocalHomePage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(0); // Auto by default
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Johannesburg');

  useEffect(() => {
    if (location) {
      loadFeed();
    }
  }, [location, selectedRadius]);

  const loadFeed = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/hyperlocal/feed/home?lat=${location.lat}&lng=${location.lng}&tier_index=${selectedRadius}`
      );
      const result = await response.json();
      
      if (result.success) {
        setFeed(result.data);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    // In production, reverse geocode to get address
    setAddress('Johannesburg'); // Placeholder
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
      </Header>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Finding the best products near you...</LoadingText>
        </LoadingContainer>
      ) : feed ? (
        <Content>
          <InfoBanner>
            <InfoIcon>✨</InfoIcon>
            <InfoText>
              Showing the best local products from top-rated sellers{' '}
              <Strong>{feed.tierLabel?.toLowerCase()}</Strong>
            </InfoText>
          </InfoBanner>

          {/* Top Near You */}
          {feed.modules?.topNearYou?.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>Top Near You</SectionTitle>
                <SectionSubtitle>
                  Best products within {feed.tierLabel?.toLowerCase()}
                </SectionSubtitle>
              </SectionHeader>
              <ProductGrid>
                {feed.modules.topNearYou.map((product) => (
                  <HyperlocalProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </ProductGrid>
            </Section>
          )}

          {/* Best Sellers Nearby */}
          {feed.modules?.bestSellersNearby?.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>🔥 Best Sellers Nearby</SectionTitle>
                <SectionSubtitle>Most popular in your area</SectionSubtitle>
              </SectionHeader>
              <ProductGrid>
                {feed.modules.bestSellersNearby.map((product) => (
                  <HyperlocalProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </ProductGrid>
            </Section>
          )}

          {/* Top Rated Sellers */}
          {feed.modules?.topRatedSellers?.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>⭐ Top-Rated Sellers</SectionTitle>
                <SectionSubtitle>Products from highly-rated local sellers</SectionSubtitle>
              </SectionHeader>
              <ProductGrid>
                {feed.modules.topRatedSellers.map((product) => (
                  <HyperlocalProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </ProductGrid>
            </Section>
          )}

          {/* Fresh Restocks */}
          {feed.modules?.freshRestocks?.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>📦 Fresh Restocks</SectionTitle>
                <SectionSubtitle>Recently stocked near you</SectionSubtitle>
              </SectionHeader>
              <ProductGrid>
                {feed.modules.freshRestocks.map((product) => (
                  <HyperlocalProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </ProductGrid>
            </Section>
          )}

          {/* Flash Deals */}
          {feed.modules?.flashDeals?.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>⚡ Flash Deals Near You</SectionTitle>
                <SectionSubtitle>Limited time offers</SectionSubtitle>
              </SectionHeader>
              <ProductGrid>
                {feed.modules.flashDeals.map((product) => (
                  <HyperlocalProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </ProductGrid>
            </Section>
          )}

          {/* New Arrivals */}
          {feed.modules?.newArrivals?.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>✨ New Arrivals</SectionTitle>
                <SectionSubtitle>Just added by local sellers</SectionSubtitle>
              </SectionHeader>
              <ProductGrid>
                {feed.modules.newArrivals.map((product) => (
                  <HyperlocalProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </ProductGrid>
            </Section>
          )}
        </Content>
      ) : null}
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

const Content = styled.div`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%);
  border-radius: 12px;
  margin-bottom: 24px;
`;

const InfoIcon = styled.div`
  font-size: 20px;
`;

const InfoText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
`;

const Strong = styled.span`
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary || '#007AFF'};
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#000'};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.div`
  font-size: 13px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: ${props => props.theme?.colors?.primary || '#007AFF'};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

export default HyperlocalHomePage;

