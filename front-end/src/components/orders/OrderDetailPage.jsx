import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { BottomNavigation } from '../home/BottomNavigation';
import { OrderTimeline } from './OrderTimeline';
import { OrderListSkeleton } from './SkeletonLoader';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xl};
  padding-top: calc(${props => props.theme.spacing.xl} + env(safe-area-inset-top));
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  margin: 0;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const StatusSection = styled(Section)`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
`;

const StatusIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatusText = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.sm};
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ItemCard = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.background};
`;

const ItemImage = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${props => props.theme.radii.sm};
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ItemDetails = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const ItemPrice = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  text-align: right;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

const InfoValue = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  text-align: right;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} 0;
  margin-top: ${props => props.theme.spacing.md};
  border-top: 2px solid ${props => props.theme.colors.border.default};
`;

const TotalLabel = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
`;

const TotalValue = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 700;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';

export const OrderDetailPage = ({ location }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [itemsWithImages, setItemsWithImages] = useState([]);

  const userId = 'default'; // In production, get from auth context

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && order.items) {
      loadItemImages();
    }
  }, [order]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/my-orders/${orderId}?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItemImages = async () => {
    if (!order || !order.items) return;

    try {
      const itemsWithImagesData = await Promise.all(
        order.items.map(async (item) => {
          // If item already has image from productThumbnails, use it
          const thumbnail = order.productThumbnails?.find(t => t.id === item.productId);
          if (thumbnail?.image) {
            return { ...item, image: thumbnail.image, name: thumbnail.name };
          }

          // Otherwise, fetch product details
          try {
            const response = await fetch(`${API_BASE_URL}/products/${item.productId}`);
            const data = await response.json();
            if (data.success && data.data) {
              const product = data.data;
              const image = product.images?.[0] || product.image || null;
              return { ...item, image, name: product.name || item.name || 'Product' };
            }
          } catch (error) {
            console.error(`Error loading product ${item.productId}:`, error);
          }
          return { ...item, image: null, name: item.name || 'Product' };
        })
      );
      setItemsWithImages(itemsWithImagesData);
    } catch (error) {
      console.error('Error loading item images:', error);
      setItemsWithImages(order.items || []);
    }
  };

  const handleReorder = async () => {
    try {
      setReordering(true);
      const response = await fetch(`${API_BASE_URL}/my-orders/${orderId}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/cart');
      } else {
        alert(data.message || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. Please try again.');
    } finally {
      setReordering(false);
    }
  };

  const handleTrackOrder = () => {
    navigate(`/tracking/${orderId}`);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
            <Title>Order Details</Title>
            <div style={{ width: '40px' }}></div>
          </HeaderTop>
        </Header>
      <Content>
        <OrderListSkeleton />
      </Content>
        <BottomNavigation currentPath="/orders" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <Header>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
            <Title>Order Not Found</Title>
            <div style={{ width: '40px' }}></div>
          </HeaderTop>
        </Header>
        <Content>
          <LoadingState>Order not found</LoadingState>
        </Content>
        <BottomNavigation currentPath="/orders" />
      </Container>
    );
  }

  const statusMetadata = order.statusMetadata || {};
  const storeGroups = order.storeGroups || [];
  const primaryStore = storeGroups[0] || {};

  return (
    <Container>
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Title>Order #{order.id.slice(-8)}</Title>
          <div style={{ width: '40px' }}></div>
        </HeaderTop>
        <StatusBadge
          status={order.status}
          color={statusMetadata.badgeColor}
          isUrgent={statusMetadata.isUrgent}
          icon={statusMetadata.icon}
        >
          {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </StatusBadge>
        {statusMetadata.subtext && (
          <StatusText>{statusMetadata.subtext}</StatusText>
        )}
      </Header>

      <Content>
        <StatusSection>
          <StatusIcon>{statusMetadata.icon || '📦'}</StatusIcon>
          <StatusText>{statusMetadata.subtext || 'Order in progress'}</StatusText>
          {statusMetadata.progress !== undefined && (
            <div style={{ 
              marginTop: '16px', 
              width: '100%', 
              height: '4px', 
              background: '#E4E7EC', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${statusMetadata.progress}%`,
                height: '100%',
                background: statusMetadata.badgeColor === 'green' 
                  ? '#15A17C' 
                  : statusMetadata.badgeColor === 'amber'
                  ? '#F59E0B'
                  : '#3D81EF',
                transition: 'width 0.5s ease'
              }} />
            </div>
          )}
        </StatusSection>

        {order.timeline && order.timeline.length > 0 && (
          <OrderTimeline timeline={order.timeline} />
        )}

        <Section>
          <SectionTitle>Items</SectionTitle>
          <ItemsList>
            {(itemsWithImages.length > 0 ? itemsWithImages : order.items || []).map((item, index) => (
              <ItemCard key={index}>
                <ItemImage>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>📦</span>
                  )}
                </ItemImage>
                <ItemInfo>
                  <ItemName>{item.name || `Item ${index + 1}`}</ItemName>
                  <ItemDetails>
                    Quantity: {item.quantity} {item.variant && `• ${item.variant.name}`}
                  </ItemDetails>
                </ItemInfo>
                <ItemPrice>
                  R{parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </ItemPrice>
              </ItemCard>
            ))}
          </ItemsList>
        </Section>

        <Section>
          <SectionTitle>Store</SectionTitle>
          <InfoRow>
            <InfoLabel>Store Name</InfoLabel>
            <InfoValue>{primaryStore.storeName || 'Store'}</InfoValue>
          </InfoRow>
        </Section>

        <Section>
          <SectionTitle>Delivery</SectionTitle>
          <InfoRow>
            <InfoLabel>Method</InfoLabel>
            <InfoValue>
              {order.deliveryMethod === 'pickup' ? '🏬 Pickup' : 
               order.deliveryMethod === 'group' ? '🚚 Group Delivery' : 
               '🛵 Delivery'}
            </InfoValue>
          </InfoRow>
          {order.deliveryAddress && (
            <InfoRow>
              <InfoLabel>Address</InfoLabel>
              <InfoValue>
                {order.deliveryAddress.suburb || ''} {order.deliveryAddress.city || ''}
              </InfoValue>
            </InfoRow>
          )}
          {order.eta && (
            <InfoRow>
              <InfoLabel>Estimated Arrival</InfoLabel>
              <InfoValue>{order.eta}</InfoValue>
            </InfoRow>
          )}
        </Section>

        <Section>
          <SectionTitle>Payment</SectionTitle>
          <InfoRow>
            <InfoLabel>Method</InfoLabel>
            <InfoValue>{order.paymentMethod || 'Card'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Items Total</InfoLabel>
            <InfoValue>R{parseFloat(order.totals?.itemsTotal || 0).toFixed(2)}</InfoValue>
          </InfoRow>
          {order.totals?.deliveryFee > 0 && (
            <InfoRow>
              <InfoLabel>Delivery Fee</InfoLabel>
              <InfoValue>R{parseFloat(order.totals.deliveryFee).toFixed(2)}</InfoValue>
            </InfoRow>
          )}
          {order.totals?.discount > 0 && (
            <InfoRow>
              <InfoLabel>Discount</InfoLabel>
              <InfoValue>-R{parseFloat(order.totals.discount).toFixed(2)}</InfoValue>
            </InfoRow>
          )}
          <TotalRow>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>R{parseFloat(order.totals?.total || 0).toFixed(2)}</TotalValue>
          </TotalRow>
        </Section>

        <ActionButtons>
          {order.status === 'out_for_delivery' || order.status === 'processing' || order.status === 'preparing' ? (
            <Button 
              variant="primary" 
              onClick={handleTrackOrder}
              style={{ flex: 1 }}
            >
              Track Order
            </Button>
          ) : null}
          {order.canReorder && (
            <Button 
              variant="secondary" 
              onClick={handleReorder}
              disabled={reordering}
              style={{ flex: 1 }}
            >
              {reordering ? 'Adding to cart...' : 'Reorder'}
            </Button>
          )}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <Button 
              variant="outline" 
              onClick={async () => {
                if (confirm('Are you sure you want to cancel this order?')) {
                  try {
                    const response = await fetch(`${API_BASE_URL}/my-orders/${orderId}/cancel`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      navigate('/orders');
                    } else {
                      alert(data.message || 'Failed to cancel order');
                    }
                  } catch (error) {
                    alert('Failed to cancel order. Please try again.');
                  }
                }
              }}
              style={{ flex: 1, borderColor: '#C62850', color: '#C62850' }}
            >
              Cancel Order
            </Button>
          )}
        </ActionButtons>
      </Content>

      <BottomNavigation currentPath="/orders" />
    </Container>
  );
};

