import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { StatusBadge } from './StatusBadge';

const Card = styled.article`
  position: relative;
  overflow: hidden;
  cursor: pointer;
  animation: ${fadeIn} 0.3s ease;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.16)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 22px);
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &::after {
    content: '';
    position: absolute;
    right: -64px;
    top: -72px;
    width: 170px;
    height: 170px;
    border-radius: 999px;
    background: ${props => props.$needsAttention ? 'rgba(245, 158, 11, 0.1)' : 'rgba(61, 129, 239, 0.08)'};
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 28px 58px rgba(16, 24, 40, 0.12);
  }
`;

const TopRow = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const StoreName = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(18px, 4vw, 24px);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0;
`;

const MetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(228, 231, 236, 0.95);
`;

const ProductStrip = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  margin: 16px 0;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ThumbnailsRow = styled.div`
  display: flex;
  align-items: center;
`;

const Thumbnail = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: #ffffff;
  border: 2px solid #ffffff;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  box-shadow: 0 14px 24px rgba(16, 24, 40, 0.1);
  margin-left: ${props => props.$stacked ? '-12px' : '0'};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemSummary = styled.div`
  min-width: 0;
`;

const ItemTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 700;
  margin-top: 4px;
`;

const BottomRow = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
  padding-top: 14px;
  border-top: 1px solid rgba(228, 231, 236, 0.9);

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatusText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
`;

const TotalBlock = styled.div`
  text-align: right;

  @media (max-width: 620px) {
    text-align: left;
  }
`;

const TotalLabel = styled.div`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Total = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
  margin-top: 3px;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
`;

const OpenButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 14px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 14px 26px rgba(61, 129, 239, 0.2);
`;

const WhatsAppButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #128c7e;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 14px 26px rgba(18, 140, 126, 0.22);

  &:hover {
    background: #075e54;
  }
`;

const formatStatus = (status = 'pending') => (
  status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
);

const formatDate = (value) => {
  if (!value) return 'Today';
  return new Date(value).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
};

export const OrderCard = ({ order, onClick }) => {
  const navigate = useNavigate();

  const statusMetadata = order.statusMetadata || {};
  const storeGroups = order.storeGroups || [];
  const primaryStore = storeGroups[0] || {};
  const thumbnails = order.productThumbnails?.length
    ? order.productThumbnails
    : (order.items || []).slice(0, 3).map((item) => ({ id: item.productId, name: item.name, image: item.image }));
  const handoff = order.whatsappHandoff?.find(item => item.href);
  const itemCount = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;
  const firstItem = order.items?.[0]?.name || thumbnails?.[0]?.name || 'Shopply order';

  const handleClick = () => {
    if (onClick) onClick(order);
    else navigate(`/orders/${order.id}`);
  };

  return (
    <Card onClick={handleClick} $needsAttention={order.needsAttention}>
      <TopRow>
        <div>
          <StoreName>{primaryStore.storeName || 'Shopply seller'}</StoreName>
          <MetaLine>
            <Pill>Order #{String(order.id || '').slice(-8)}</Pill>
            <Pill>{formatDate(order.createdAt)}</Pill>
            <Pill>{order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</Pill>
          </MetaLine>
        </div>
        <StatusBadge
          status={order.status}
          color={statusMetadata.badgeColor}
          isUrgent={statusMetadata.isUrgent}
          icon={statusMetadata.icon}
        >
          {formatStatus(order.status)}
        </StatusBadge>
      </TopRow>

      <ProductStrip>
        <ThumbnailsRow>
          {thumbnails.slice(0, 3).map((product, index) => (
            <Thumbnail key={product.id || index} $stacked={index > 0}>
              {product.image ? <img src={product.image} alt={product.name || 'Order item'} /> : (product.name || 'T').slice(0, 1).toUpperCase()}
            </Thumbnail>
          ))}
          {itemCount > 3 && <Thumbnail $stacked>+{itemCount - 3}</Thumbnail>}
        </ThumbnailsRow>
        <ItemSummary>
          <ItemTitle>{firstItem}</ItemTitle>
          <ItemText>{itemCount} item{itemCount === 1 ? '' : 's'} from {primaryStore.storeName || 'this seller'}</ItemText>
        </ItemSummary>
      </ProductStrip>

      <BottomRow>
        <div>
          <StatusText>{statusMetadata.subtext || order.eta || 'Order in progress'}</StatusText>
          <ActionRow>
            {handoff?.href && (
              <WhatsAppButton
                href={handoff.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                WhatsApp seller
              </WhatsAppButton>
            )}
            <OpenButton>View details</OpenButton>
          </ActionRow>
        </div>
        <TotalBlock>
          <TotalLabel>Total</TotalLabel>
          <Total>R{parseFloat(order.totals?.total || 0).toFixed(2)}</Total>
        </TotalBlock>
      </BottomRow>
    </Card>
  );
};
