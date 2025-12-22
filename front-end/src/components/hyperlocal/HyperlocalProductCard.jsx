import React from 'react';
import styled from 'styled-components';
import DistanceBadge from './DistanceBadge';
import WhyThisBadges from './WhyThisBadges';

/**
 * HyperlocalProductCard Component
 * Enhanced product card with locality information
 */
const HyperlocalProductCard = ({ 
  product,
  onClick,
}) => {
  const {
    id,
    name,
    image,
    price,
    discountPrice,
    rating,
    reviewCount,
    distanceKm,
    distanceDisplay,
    whyThis = [],
    store = {},
    inventory = {},
    badges = [],
  } = product;

  const effectivePrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <Card onClick={() => onClick && onClick(product)}>
      <ImageContainer>
        <ProductImage src={image} alt={name} />
        {distanceKm !== undefined && (
          <DistanceOverlay>
            <DistanceBadge distanceKm={distanceKm} distanceDisplay={distanceDisplay} />
          </DistanceOverlay>
        )}
        {badges.length > 0 && (
          <BadgesOverlay>
            {badges.slice(0, 2).map((badge, index) => (
              <Badge key={index} type={badge.type}>
                {badge.text}
              </Badge>
            ))}
          </BadgesOverlay>
        )}
      </ImageContainer>

      <Content>
        <ProductName>{name}</ProductName>

        {store.name && (
          <StoreInfo>
            <StoreName>{store.name}</StoreName>
            {store.isOpenNow !== undefined && (
              <OpenStatus open={store.isOpenNow}>
                {store.isOpenNow ? 'Open' : 'Closed'}
              </OpenStatus>
            )}
          </StoreInfo>
        )}

        <PriceRow>
          <Price hasDiscount={hasDiscount}>R{effectivePrice.toFixed(2)}</Price>
          {hasDiscount && <OriginalPrice>R{price.toFixed(2)}</OriginalPrice>}
        </PriceRow>

        {rating && (
          <RatingRow>
            <Stars>
              {'⭐'.repeat(Math.round(rating))}
            </Stars>
            <RatingText>{rating.toFixed(1)}</RatingText>
            {reviewCount > 0 && <ReviewCount>({reviewCount})</ReviewCount>}
          </RatingRow>
        )}

        {inventory.stockOnHand !== undefined && (
          <StockInfo lowStock={inventory.isLowStock}>
            {inventory.availableNow ? (
              inventory.isLowStock ? (
                `Only ${inventory.stockOnHand} left`
              ) : (
                'In stock'
              )
            ) : (
              'Out of stock'
            )}
          </StockInfo>
        )}

        {whyThis.length > 0 && (
          <WhyThisBadges reasons={whyThis} maxShow={2} />
        )}
      </Content>
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 aspect ratio */
  background: #f5f5f5;
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DistanceOverlay = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
`;

const BadgesOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
`;

const Badge = styled.div`
  padding: 4px 10px;
  background: ${props => {
    switch (props.type) {
      case 'deal': return 'linear-gradient(135deg, #FF5722 0%, #F44336 100%)';
      case 'new': return 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
      default: return 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)';
    }
  }};
  color: white;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Content = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#000'};
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StoreName = styled.div`
  font-size: 11px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  font-weight: 500;
`;

const OpenStatus = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.open ? '#4CAF50' : '#F44336'};
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const Price = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.hasDiscount 
    ? props.theme?.colors?.success || '#4CAF50'
    : props.theme?.colors?.text || '#000'
  };
`;

const OriginalPrice = styled.div`
  font-size: 14px;
  color: ${props => props.theme?.colors?.textSecondary || '#999'};
  text-decoration: line-through;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Stars = styled.div`
  font-size: 12px;
  line-height: 1;
`;

const RatingText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#000'};
`;

const ReviewCount = styled.div`
  font-size: 11px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const StockInfo = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.lowStock 
    ? '#FF9800' 
    : props.theme?.colors?.success || '#4CAF50'
  };
  padding: 4px 8px;
  background: ${props => props.lowStock ? '#FFF8E1' : '#E8F5E9'};
  border-radius: 6px;
  display: inline-block;
  align-self: flex-start;
`;

export default HyperlocalProductCard;

