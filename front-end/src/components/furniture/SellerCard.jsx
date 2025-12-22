import React from 'react';
import styled from 'styled-components';

/**
 * Seller Card Component
 * Displays seller/store information
 */

const SellerCard = ({ seller, onClick }) => {
  return (
    <Card onClick={onClick}>
      <Header>
        <LogoContainer>
          {seller.logo ? (
            <Logo src={seller.logo} alt={seller.name} />
          ) : (
            <LogoPlaceholder>{seller.name.charAt(0)}</LogoPlaceholder>
          )}
        </LogoContainer>
        
        {seller.storeQualityScore > 0.9 && (
          <VerifiedBadge>✓</VerifiedBadge>
        )}
      </Header>

      <Content>
        <SellerName>{seller.name}</SellerName>
        
        {seller.address && (
          <Location>
            📍 {seller.address.suburb}, {seller.address.city}
          </Location>
        )}

        <MetadataRow>
          {seller.rating && (
            <Rating>
              <Star>⭐</Star>
              <RatingText>{seller.rating.toFixed(1)}</RatingText>
            </Rating>
          )}
          
          {seller.distance !== undefined && (
            <>
              <Separator>•</Separator>
              <Distance>{seller.distanceFormatted || `${seller.distance.toFixed(1)}km`}</Distance>
            </>
          )}
        </MetadataRow>

        {seller.storeType && (
          <StoreType>{seller.storeType.replace('-', ' ')}</StoreType>
        )}

        {seller.deliveryModes && seller.deliveryModes.length > 0 && (
          <DeliveryModes>
            {seller.deliveryModes.includes('local_delivery') && '🚚 '}
            {seller.deliveryModes.includes('pickup') && '🏪 '}
            {seller.deliveryModes.includes('courier_freight') && '📦 '}
            Delivery available
          </DeliveryModes>
        )}
      </Content>
    </Card>
  );
};

// Styled Components

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const LogoContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LogoPlaceholder = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #666;
`;

const VerifiedBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
`;

const SellerName = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Location = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetadataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Star = styled.span`
  font-size: 12px;
`;

const RatingText = styled.span`
  font-weight: 600;
  color: #1a1a1a;
`;

const Separator = styled.span`
  color: #ccc;
`;

const Distance = styled.span`
  color: #2196f3;
  font-weight: 500;
`;

const StoreType = styled.div`
  font-size: 11px;
  color: #888;
  text-transform: capitalize;
`;

const DeliveryModes = styled.div`
  font-size: 11px;
  color: #666;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 4px;
`;

export default SellerCard;

