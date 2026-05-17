import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { BottomNavigation } from '../home/BottomNavigation';
import { OrderTimeline } from './OrderTimeline';
import { OrderListSkeleton } from './SkeletonLoader';
import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 52%, #ffffff 100%);
  animation: ${fadeIn} 0.45s ease;
  padding-bottom: 104px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const HeaderInner = styled.div`
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
  padding: calc(18px + env(safe-area-inset-top)) 0 18px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228, 231, 236, 0.95);
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);
`;

const TitleWrap = styled.div`
  min-width: 0;
  flex: 1;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 3px 0 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(26px, 6vw, 44px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const HeaderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const Content = styled.main`
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
  padding: 22px 0 0;
`;

const StatusHero = styled.section`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.22), rgba(228,231,236,0.9), rgba(245,158,11,0.14)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  padding: clamp(18px, 4vw, 26px);
  box-shadow: 0 22px 50px rgba(16, 24, 40, 0.08);
  margin-bottom: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const StatusMark = styled.div`
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 20px;
  font-weight: 900;
`;

const StatusHeading = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(24px, 5vw, 36px);
  line-height: 1;
  font-weight: 900;
`;

const MutedText = styled.p`
  margin: 8px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.45;
  font-size: 14px;
  font-weight: 700;
`;

const ProgressTrack = styled.div`
  grid-column: 1 / -1;
  height: 8px;
  border-radius: 999px;
  background: rgba(228, 231, 236, 0.86);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.$progress}%;
  height: 100%;
  border-radius: inherit;
  background: ${props => {
    if (props.$color === 'green') return props.theme.colors.successBase;
    if (props.$color === 'amber') return props.theme.colors.warningBase;
    if (props.$color === 'red') return props.theme.colors.dangerBase;
    return props.theme.colors.primary;
  }};
`;

const Section = styled.section`
  background: rgba(255,255,255,0.96);
  border: 1px solid rgba(228, 231, 236, 0.92);
  border-radius: 24px;
  padding: clamp(16px, 3vw, 22px);
  margin-bottom: 16px;
  box-shadow: 0 16px 34px rgba(16, 24, 40, 0.06);
`;

const SectionTitle = styled.h3`
  margin: 0 0 14px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 900;
`;

const ItemsList = styled.div`
  display: grid;
  gap: 12px;
`;

const ItemCard = styled.div`
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid rgba(228, 231, 236, 0.9);

  @media (max-width: 560px) {
    grid-template-columns: 58px minmax(0, 1fr);
  }
`;

const ItemImage = styled.div`
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 560px) {
    width: 58px;
    height: 58px;
  }
`;

const ItemName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
`;

const ItemDetails = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 700;
  margin-top: 4px;
`;

const ItemPrice = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  text-align: right;

  @media (max-width: 560px) {
    grid-column: 2;
    text-align: left;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(228, 231, 236, 0.88);

  &:last-child {
    border-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 700;
`;

const InfoValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 900;
  text-align: right;
`;

const TotalValue = styled(InfoValue)`
  font-size: 22px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
`;

const WhatsAppButton = styled.a`
  flex: 1;
  min-width: 190px;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 999px;
  background: #128c7e;
  color: #ffffff;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 16px 30px rgba(18, 140, 126, 0.24);

  &:hover {
    background: #075e54;
  }
`;

const StatePanel = styled(Section)`
  min-height: 320px;
  display: grid;
  place-items: center;
  text-align: center;
`;

const formatStatus = (status = 'pending') => (
  status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
);

const formatMoney = (value) => `R${parseFloat(value || 0).toFixed(2)}`;

const formatPayment = (method = 'seller_whatsapp') => {
  if (method === 'seller_whatsapp') return 'Confirm with seller on WhatsApp';
  return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [itemsWithImages, setItemsWithImages] = useState([]);
  const userId = getCurrentUserId();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/my-orders/${orderId}?userId=${userId}`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Order could not load');
        setOrder(data.data);
      } catch (err) {
        console.error('Error loading order:', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  useEffect(() => {
    const loadItemImages = async () => {
      if (!order?.items) return;
      const nextItems = await Promise.all(order.items.map(async (item) => {
        const thumbnail = order.productThumbnails?.find(t => t.id === item.productId);
        if (thumbnail?.image) return { ...item, image: thumbnail.image, name: thumbnail.name };

        try {
          const response = await fetch(`${API_BASE_URL}/products/${item.productId}`);
          const data = await response.json();
          const product = data.success ? data.data : null;
          return {
            ...item,
            image: product?.images?.[0] || product?.image || null,
            name: product?.name || item.name || 'Product',
          };
        } catch {
          return { ...item, image: null, name: item.name || 'Product' };
        }
      }));
      setItemsWithImages(nextItems);
    };

    loadItemImages();
  }, [order]);

  const handleReorder = async () => {
    try {
      setReordering(true);
      const response = await fetch(`${API_BASE_URL}/my-orders/${orderId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) navigate('/cart');
      else alert(data.message || 'Failed to reorder');
    } catch {
      alert('Failed to reorder. Please try again.');
    } finally {
      setReordering(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/my-orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) navigate('/orders');
      else alert(data.message || 'Failed to cancel order');
    } catch {
      alert('Failed to cancel order. Please try again.');
    }
  };

  const renderShell = (children, title = 'Order Details') => (
    <Container>
      <Header>
        <HeaderInner>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <TitleWrap>
              <Eyebrow>Shopply orders</Eyebrow>
              <Title>{title}</Title>
            </TitleWrap>
          </HeaderTop>
        </HeaderInner>
      </Header>
      <Content>{children}</Content>
      <BottomNavigation currentPath="/orders" />
    </Container>
  );

  if (loading) {
    return renderShell(<OrderListSkeleton />);
  }

  if (!order) {
    return renderShell(
      <StatePanel>
        <div>
          <SectionTitle>Order not found</SectionTitle>
          <MutedText>This order could not be loaded. It may have been removed or belongs to another account.</MutedText>
          <Actions>
            <Button variant="primary" onClick={() => navigate('/orders')}>Back to orders</Button>
          </Actions>
        </div>
      </StatePanel>,
      'Order Not Found'
    );
  }

  const statusMetadata = order.statusMetadata || {};
  const statusLabel = formatStatus(order.status);
  const primaryStore = order.storeGroups?.[0] || {};
  const items = itemsWithImages.length > 0 ? itemsWithImages : order.items || [];
  const whatsappHandoffs = order.whatsappHandoff?.filter(item => item.href) || [];
  const canCancel = ['pending', 'pending_seller_confirmation', 'confirmed'].includes(order.status);
  const canTrack = ['processing', 'preparing', 'out_for_delivery'].includes(order.status);

  return renderShell(
    <>
      <HeaderMeta>
        <StatusBadge
          status={order.status}
          color={statusMetadata.badgeColor}
          isUrgent={statusMetadata.isUrgent}
          icon={statusMetadata.icon}
        >
          {statusLabel}
        </StatusBadge>
      </HeaderMeta>

      <StatusHero>
        <StatusMark>{String(statusMetadata.icon || statusLabel || 'O').slice(0, 1).toUpperCase()}</StatusMark>
        <div>
          <Eyebrow>Order status</Eyebrow>
          <StatusHeading>{statusLabel}</StatusHeading>
          <MutedText>{statusMetadata.subtext || 'Order in progress'}</MutedText>
        </div>
        <ProgressTrack>
          <ProgressFill $progress={statusMetadata.progress ?? 0} $color={statusMetadata.badgeColor} />
        </ProgressTrack>
      </StatusHero>

      {whatsappHandoffs.length > 0 && (
        <Section>
          <SectionTitle>Seller WhatsApp</SectionTitle>
          <MutedText>Send or reopen your order message with the seller to confirm availability, delivery timing, and next steps.</MutedText>
          <Actions>
            {whatsappHandoffs.map(item => (
              <WhatsAppButton
                key={`${item.storeId}-${item.whatsappNumber}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {item.storeName || 'seller'}
              </WhatsAppButton>
            ))}
          </Actions>
        </Section>
      )}

      {order.timeline?.length > 0 && <OrderTimeline timeline={order.timeline} />}

      <Section>
        <SectionTitle>Items</SectionTitle>
        <ItemsList>
          {items.map((item, index) => (
            <ItemCard key={`${item.productId || 'item'}-${index}`}>
              <ItemImage>
                {item.image ? <img src={item.image} alt={item.name || 'Order item'} /> : (item.name || 'T').slice(0, 1).toUpperCase()}
              </ItemImage>
              <div>
                <ItemName>{item.name || `Item ${index + 1}`}</ItemName>
                <ItemDetails>
                  Quantity: {item.quantity || 1}{item.variant?.name ? ` | ${item.variant.name}` : ''}
                </ItemDetails>
              </div>
              <ItemPrice>{formatMoney((item.price || 0) * (item.quantity || 1))}</ItemPrice>
            </ItemCard>
          ))}
        </ItemsList>
      </Section>

      <Section>
        <SectionTitle>Order summary</SectionTitle>
        <InfoGrid>
          <InfoRow>
            <InfoLabel>Store</InfoLabel>
            <InfoValue>{primaryStore.storeName || 'Shopply seller'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Fulfilment</InfoLabel>
            <InfoValue>{order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</InfoValue>
          </InfoRow>
          {order.deliveryAddress && (
            <InfoRow>
              <InfoLabel>Address</InfoLabel>
              <InfoValue>{[order.deliveryAddress.suburb, order.deliveryAddress.city].filter(Boolean).join(', ') || 'Saved address'}</InfoValue>
            </InfoRow>
          )}
          {order.eta && (
            <InfoRow>
              <InfoLabel>Estimated arrival</InfoLabel>
              <InfoValue>{order.eta}</InfoValue>
            </InfoRow>
          )}
          <InfoRow>
            <InfoLabel>Payment</InfoLabel>
            <InfoValue>{formatPayment(order.paymentMethod)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Items total</InfoLabel>
            <InfoValue>{formatMoney(order.totals?.itemsTotal)}</InfoValue>
          </InfoRow>
          {order.totals?.deliveryFee > 0 && (
            <InfoRow>
              <InfoLabel>Delivery fee</InfoLabel>
              <InfoValue>{formatMoney(order.totals.deliveryFee)}</InfoValue>
            </InfoRow>
          )}
          {order.totals?.discount > 0 && (
            <InfoRow>
              <InfoLabel>Discount</InfoLabel>
              <InfoValue>-{formatMoney(order.totals.discount)}</InfoValue>
            </InfoRow>
          )}
          <InfoRow>
            <InfoLabel>Total</InfoLabel>
            <TotalValue>{formatMoney(order.totals?.total)}</TotalValue>
          </InfoRow>
        </InfoGrid>
      </Section>

      <Actions>
        {canTrack && <Button variant="primary" onClick={() => navigate(`/tracking/${orderId}`)} style={{ flex: 1 }}>Track order</Button>}
        {order.canReorder && (
          <Button variant="secondary" onClick={handleReorder} disabled={reordering} style={{ flex: 1 }}>
            {reordering ? 'Adding to cart...' : 'Reorder'}
          </Button>
        )}
        {canCancel && (
          <Button variant="outline" onClick={handleCancel} style={{ flex: 1, borderColor: '#C62850', color: '#C62850' }}>
            Cancel order
          </Button>
        )}
      </Actions>
    </>,
    `Order #${String(order.id || '').slice(-8)}`
  );
};
