import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { StatusBadge } from './StatusBadge';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: ${props => props.theme.shadows.sm};
  position: relative;
  
  ${props => props.$needsAttention && `
    border-color: ${props.theme.colors.warning[300]};
    box-shadow: ${props.theme.shadows.md};
    transform: translateY(-2px);
  `}
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StoreInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  margin-bottom: 2px;
`;

const OrderNumber = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ThumbnailsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin: ${props => props.theme.spacing.sm} 0;
  align-items: center;
`;

const Thumbnail = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MoreIndicator = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const DeliveryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex: 1;
`;

const DeliveryIcon = styled.span`
  font-size: 16px;
`;

const DeliveryText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const Total = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const Chevron = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 18px;
  margin-left: ${props => props.theme.spacing.xs};
`;

export const OrderCard = ({ order, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick(order);
    } else {
      navigate(`/orders/${order.id}`);
    }
  };

  const statusMetadata = order.statusMetadata || {};
  const thumbnails = order.productThumbnails || [];
  const storeGroups = order.storeGroups || [];
  const primaryStore = storeGroups[0] || {};
  
  const getDeliveryIcon = () => {
    if (order.deliveryMethod === 'pickup') return '🏬';
    if (order.deliveryMethod === 'group') return '🚚';
    return '🛵';
  };

  const getDeliveryText = () => {
    if (statusMetadata.subtext) {
      return statusMetadata.subtext;
    }
    if (order.eta) {
      return order.eta;
    }
    return 'In progress';
  };

  return (
    <Card 
      onClick={handleClick}
      $needsAttention={order.needsAttention}
    >
      <TopRow>
        <StoreInfo>
          <StoreName>{primaryStore.storeName || 'Store'}</StoreName>
          <OrderNumber>Order #{order.id.slice(-8)}</OrderNumber>
        </StoreInfo>
        <StatusWrapper>
          <StatusBadge
            status={order.status}
            color={statusMetadata.badgeColor}
            isUrgent={statusMetadata.isUrgent}
            icon={statusMetadata.icon}
          >
            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </StatusBadge>
        </StatusWrapper>
      </TopRow>

      {thumbnails.length > 0 && (
        <ThumbnailsRow>
          {thumbnails.slice(0, 3).map((product, index) => (
            <Thumbnail key={product.id || index}>
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <span>📦</span>
              )}
            </Thumbnail>
          ))}
          {order.items && order.items.length > 3 && (
            <MoreIndicator>+{order.items.length - 3}</MoreIndicator>
          )}
        </ThumbnailsRow>
      )}

      <BottomRow>
        <DeliveryInfo>
          <DeliveryIcon>{getDeliveryIcon()}</DeliveryIcon>
          <DeliveryText>{getDeliveryText()}</DeliveryText>
        </DeliveryInfo>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Total>R{parseFloat(order.totals?.total || 0).toFixed(2)}</Total>
          <Chevron>›</Chevron>
        </div>
      </BottomRow>
    </Card>
  );
};

