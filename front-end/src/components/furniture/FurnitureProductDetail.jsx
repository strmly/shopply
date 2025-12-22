import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import furnitureApi from '../../utils/furnitureApi';

/**
 * Furniture Product Detail Page
 * Full product details with delivery estimates, dimensions, seller info
 */

const FurnitureProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      
      // Get user location
      const savedLocation = localStorage.getItem('userLocation');
      const location = savedLocation 
        ? JSON.parse(savedLocation) 
        : { lat: -26.2041, lng: 28.0473 };
      
      setUserLocation(location);

      // Fetch product details
      const response = await furnitureApi.getProductDetails(
        productId,
        location.lat,
        location.lng
      );
      
      if (response.success) {
        setData(response.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Unable to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic (integrate with existing cart)
    console.log('Add to cart:', productId);
    alert('Added to cart! (Integration pending)');
  };

  const handleBuyNow = () => {
    // Navigate to checkout
    navigate(`/checkout?product=${productId}`);
  };

  const handleMessageSeller = () => {
    // Navigate to seller messaging
    alert('Message seller (Integration pending)');
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <LoadingText>Loading product...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container>
        <ErrorState>
          <ErrorText>{error || 'Product not found'}</ErrorText>
          <RetryButton onClick={() => navigate(-1)}>Go Back</RetryButton>
        </ErrorState>
      </Container>
    );
  }

  const { product, store, deliveryEstimate } = data;
  const images = product.images || [product.image];
  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
        <HeaderActions>
          <ShareButton>🔗</ShareButton>
          <FavoriteButton>♡</FavoriteButton>
        </HeaderActions>
      </Header>

      {/* Image Gallery */}
      <ImageGallery>
        <MainImage>
          <Image src={images[selectedImageIndex]} alt={product.name} />
          {hasDiscount && (
            <DiscountBadge>-{product.discount}%</DiscountBadge>
          )}
          {product.condition !== 'new' && (
            <ConditionBadge condition={product.condition}>
              {product.condition.replace('-', ' ')}
            </ConditionBadge>
          )}
        </MainImage>
        <ImageThumbnails>
          {images.map((img, idx) => (
            <Thumbnail
              key={idx}
              active={idx === selectedImageIndex}
              onClick={() => setSelectedImageIndex(idx)}
            >
              <img src={img} alt={`${product.name} ${idx + 1}`} />
            </Thumbnail>
          ))}
        </ImageThumbnails>
      </ImageGallery>

      {/* Product Info */}
      <ProductInfo>
        <ProductName>{product.name}</ProductName>
        
        <PriceSection>
          <Price>R{effectivePrice.toFixed(2)}</Price>
          {hasDiscount && (
            <OriginalPrice>R{product.price.toFixed(2)}</OriginalPrice>
          )}
        </PriceSection>

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <BadgesRow>
            {product.badges.map((badge, idx) => (
              <Badge key={idx} color={badge.color}>
                {badge.text}
              </Badge>
            ))}
          </BadgesRow>
        )}

        {/* Key Details */}
        <DetailsSection>
          <DetailRow>
            <DetailIcon>📏</DetailIcon>
            <DetailText>
              <strong>Dimensions:</strong> {product.dimensionsSnippet || 'Not specified'}
            </DetailText>
          </DetailRow>
          
          {product.materialPrimary && (
            <DetailRow>
              <DetailIcon>🔨</DetailIcon>
              <DetailText>
                <strong>Material:</strong> {product.materialPrimary}
              </DetailText>
            </DetailRow>
          )}

          {product.color && (
            <DetailRow>
              <DetailIcon>🎨</DetailIcon>
              <DetailText>
                <strong>Color:</strong> {product.color}
              </DetailText>
            </DetailRow>
          )}

          {product.assemblyRequired && (
            <DetailRow>
              <DetailIcon>🔧</DetailIcon>
              <DetailText>
                <strong>Assembly required</strong>
                {product.assemblyFee && ` (Service available: R${product.assemblyFee})`}
              </DetailText>
            </DetailRow>
          )}

          <DetailRow>
            <DetailIcon>📦</DetailIcon>
            <DetailText>
              <strong>Stock:</strong> {product.stockType.replace('_', ' ')}
            </DetailText>
          </DetailRow>
        </DetailsSection>

        {/* Delivery Estimate */}
        {deliveryEstimate && (
          <DeliverySection>
            <SectionTitle>Delivery Information</SectionTitle>
            <DeliveryCard>
              <DeliveryRow>
                <DeliveryIcon>📍</DeliveryIcon>
                <div>
                  <DeliveryLabel>Distance</DeliveryLabel>
                  <DeliveryValue>{deliveryEstimate.distanceFormatted} away</DeliveryValue>
                </div>
              </DeliveryRow>

              <DeliveryRow>
                <DeliveryIcon>📅</DeliveryIcon>
                <div>
                  <DeliveryLabel>Earliest Delivery</DeliveryLabel>
                  <DeliveryValue>{deliveryEstimate.earliestDelivery || 'Tomorrow'}</DeliveryValue>
                </div>
              </DeliveryRow>

              {deliveryEstimate.deliveryFeeEstimate && (
                <DeliveryRow>
                  <DeliveryIcon>💰</DeliveryIcon>
                  <div>
                    <DeliveryLabel>Delivery Fee Estimate</DeliveryLabel>
                    <DeliveryValue>R{deliveryEstimate.deliveryFeeEstimate}</DeliveryValue>
                  </div>
                </DeliveryRow>
              )}

              <DeliveryModes>
                {deliveryEstimate.deliveryModes?.map((mode) => (
                  <DeliveryMode key={mode}>
                    {mode === 'pickup' && '🏪 Pickup'}
                    {mode === 'local_delivery' && '🚚 Local Delivery'}
                    {mode === 'courier_freight' && '📦 Freight'}
                  </DeliveryMode>
                ))}
              </DeliveryModes>
            </DeliveryCard>
          </DeliverySection>
        )}

        {/* Description */}
        <DescriptionSection>
          <SectionTitle>Description</SectionTitle>
          <Description>{product.description}</Description>
        </DescriptionSection>

        {/* Seller Info */}
        <SellerSection>
          <SectionTitle>Seller Information</SectionTitle>
          <SellerCard onClick={() => navigate(`/furniture/seller/${store.sellerId}`)}>
            <SellerLogo>
              {store.logo ? (
                <img src={store.logo} alt={store.name} />
              ) : (
                <LogoPlaceholder>{store.name.charAt(0)}</LogoPlaceholder>
              )}
            </SellerLogo>
            <SellerInfo>
              <SellerName>{store.name}</SellerName>
              {store.rating && (
                <SellerRating>⭐ {store.rating.toFixed(1)} ({store.reviewCount} reviews)</SellerRating>
              )}
              {store.address && (
                <SellerLocation>
                  📍 {store.address.suburb}, {store.address.city}
                </SellerLocation>
              )}
            </SellerInfo>
            <ViewArrow>→</ViewArrow>
          </SellerCard>

          {store.returnPolicyDays && (
            <ReturnPolicy>
              <ReturnIcon>↩️</ReturnIcon>
              {store.returnPolicyDays}-day return policy
            </ReturnPolicy>
          )}
        </SellerSection>
      </ProductInfo>

      {/* Fixed Bottom CTA */}
      <BottomCTA>
        <MessageButton onClick={handleMessageSeller}>
          💬 Message
        </MessageButton>
        <AddToCartButton onClick={handleAddToCart}>
          🛒 Add to Cart
        </AddToCartButton>
        <BuyNowButton onClick={handleBuyNow}>
          Buy Now
        </BuyNowButton>
      </BottomCTA>
    </Container>
  );
};

// Styled Components (abbreviated for brevity)

const Container = styled.div`
  min-height: 100vh;
  background: #f9f9f9;
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #2196f3;
  cursor: pointer;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  &:hover { color: #f44336; }
`;

const ImageGallery = styled.div`
  background: white;
`;

const MainImage = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f9f9f9;
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
  top: 16px;
  left: 16px;
  background: #f44336;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
`;

const ConditionBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ff9800;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: capitalize;
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  overflow-x: auto;
`;

const Thumbnail = styled.button`
  width: 60px;
  height: 60px;
  border: 2px solid ${props => props.active ? '#2196f3' : '#e0e0e0'};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: 16px;
`;

const ProductName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Price = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
`;

const OriginalPrice = styled.span`
  font-size: 20px;
  color: #999;
  text-decoration: line-through;
`;

const BadgesRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Badge = styled.span`
  padding: 6px 12px;
  background: #2196f3;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const DetailsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailIcon = styled.span`
  font-size: 20px;
`;

const DetailText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

const DeliverySection = styled.div`
  margin: 24px 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
`;

const DeliveryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
`;

const DeliveryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const DeliveryIcon = styled.span`
  font-size: 24px;
`;

const DeliveryLabel = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
`;

const DeliveryValue = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`;

const DeliveryModes = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const DeliveryMode = styled.span`
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const DescriptionSection = styled.div`
  margin: 24px 0;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const SellerSection = styled.div`
  margin: 24px 0;
`;

const SellerCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const SellerLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LogoPlaceholder = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #666;
`;

const SellerInfo = styled.div`
  flex: 1;
`;

const SellerName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
`;

const SellerRating = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0 0 4px 0;
`;

const SellerLocation = styled.p`
  font-size: 12px;
  color: #999;
  margin: 0;
`;

const ViewArrow = styled.span`
  font-size: 24px;
  color: #2196f3;
`;

const ReturnPolicy = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2e7d32;
`;

const ReturnIcon = styled.span`
  font-size: 20px;
`;

const BottomCTA = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.1);
  display: flex;
  gap: 8px;
  z-index: 100;
`;

const MessageButton = styled.button`
  flex: 1;
  padding: 14px;
  background: white;
  border: 2px solid #2196f3;
  color: #2196f3;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e3f2fd;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: 14px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f57c00;
  }
`;

const BuyNowButton = styled.button`
  flex: 1.5;
  padding: 14px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #43a047;
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
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

export default FurnitureProductDetail;

