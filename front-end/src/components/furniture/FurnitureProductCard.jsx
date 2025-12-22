import React from 'react';
import styled from 'styled-components';

/**
 * Furniture Product Card Component
 * Displays furniture item with image, price, condition, distance, dimensions
 */

const FurnitureProductCard = ({ product, onClick }) => {
  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Card onClick={onClick}>
      {/* Image */}
      <ImageContainer>
        <Image src={product.coverImage || product.image} alt={product.name} />
        {hasDiscount && (
          <DiscountBadge>-{product.discount}%</DiscountBadge>
        )}
        {product.condition !== 'new' && (
          <ConditionBadge condition={product.condition}>
            {product.condition.replace('-', ' ')}
          </ConditionBadge>
        )}
      </ImageContainer>

      {/* Content */}
      <Content>
        <ProductName>{product.name}</ProductName>
        
        {/* Price */}
        <PriceRow>
          <Price>R{effectivePrice.toFixed(2)}</Price>
          {hasDiscount && (
            <OriginalPrice>R{product.price.toFixed(2)}</OriginalPrice>
          )}
        </PriceRow>

        {/* Metadata */}
        <MetadataRow>
          <Distance>{product.distanceFormatted || `${product.distance}km`}</Distance>
          {product.dimensionsSnippet && (
            <>
              <Separator>•</Separator>
              <Dimensions>{product.dimensionsSnippet}</Dimensions>
            </>
          )}
        </MetadataRow>

        {/* Store & Delivery */}
        <StoreRow>
          <StoreName>{product.storeName}</StoreName>
        </StoreRow>

        {product.leadTimeDaysMax <= 2 && (
          <DeliveryBadge>
            🚚 Delivers in {product.leadTimeDaysMax === 0 ? 'same day' : `${product.leadTimeDaysMax} days`}
          </DeliveryBadge>
        )}

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <BadgesRow>
            {product.badges.slice(0, 2).map((badge, idx) => (
              <Badge key={idx} color={badge.color}>
                {badge.text}
              </Badge>
            ))}
          </BadgesRow>
        )}
      </Content>
    </Card>
  );
};

// Styled Components

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
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

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 aspect ratio */
  background: #f5f5f5;
  overflow: hidden;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: #f44336;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
`;

const ConditionBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => {
    if (props.condition === 'like-new') return '#4caf50';
    if (props.condition === 'used') return '#ff9800';
    if (props.condition === 'refurbished') return '#2196f3';
    return '#757575';
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: capitalize;
`;

const Content = styled.div`
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProductName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const Price = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
`;

const OriginalPrice = styled.span`
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
`;

const MetadataRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
`;

const Distance = styled.span`
  font-weight: 500;
  color: #2196f3;
`;

const Separator = styled.span`
  color: #ccc;
`;

const Dimensions = styled.span`
  font-size: 11px;
  color: #888;
`;

const StoreRow = styled.div`
  margin-top: 4px;
`;

const StoreName = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DeliveryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #1976d2;
  margin-top: 4px;
`;

const BadgesRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const Badge = styled.span`
  padding: 3px 6px;
  background: ${props => {
    const colorMap = {
      gold: '#ffd700',
      blue: '#2196f3',
      green: '#4caf50',
      purple: '#9c27b0',
      orange: '#ff9800',
      brown: '#795548',
      indigo: '#3f51b5',
    };
    return colorMap[props.color] || '#757575';
  }};
  color: white;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
`;

export default FurnitureProductCard;

