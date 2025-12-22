import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { CartItemCard } from './CartItemCard';

const Container = styled.section`
  margin: ${props => props.theme.spacing.xl} 0;
  animation: ${fadeIn} 0.3s ease-in;
`;

const StoreHeader = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.light};
`;

const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const StoreDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
`;

const StoreLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const StoreText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
`;

const StoreMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  flex-wrap: wrap;
`;

const ViewStoreButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  font-size: 13px;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: 0 ${props => props.theme.spacing.xl};
`;

export const StoreGrouping = ({ storeGroup, onUpdateQuantity, onRemoveItem, location }) => {
  return (
    <Container>
      <StoreHeader>
        <StoreInfo>
          <StoreDetails>
            <StoreLogo>🏪</StoreLogo>
            <StoreText>
              <StoreName>{storeGroup.storeName}</StoreName>
              <StoreMeta>
                <span>⭐ 4.6</span>
                <span>•</span>
                <span>{storeGroup.distance?.toFixed(1) || 0}km away</span>
                <span>•</span>
                <span>{storeGroup.eta || 'Delivers Today'}</span>
                <span>•</span>
                <span>Fee: R{storeGroup.deliveryFee?.toFixed(2) || '0.00'}</span>
              </StoreMeta>
            </StoreText>
          </StoreDetails>
          <ViewStoreButton>View Store</ViewStoreButton>
        </StoreInfo>
      </StoreHeader>

      <ItemsList>
        {storeGroup.items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </ItemsList>
    </Container>
  );
};











