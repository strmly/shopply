import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { CartItemCard } from './CartItemCard';

const Container = styled.section`
  animation: ${fadeIn} 0.3s ease-in;
  display: grid;
  gap: 14px;
`;

const StoreHeader = styled.div`
  padding: 18px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.22), rgba(196, 184, 252, 0.18), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  box-shadow: 0 16px 34px rgba(16, 24, 40, 0.07);
`;

const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 560px) {
    align-items: flex-start;
  }
`;

const StoreDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
`;

const StoreLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 22px;
  font-weight: 900;
  flex-shrink: 0;
`;

const StoreText = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StoreMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
  flex-wrap: wrap;
`;

const MetaPill = styled.span`
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 999px;
  padding: 5px 8px;
`;

const ViewStoreButton = styled.button`
  background: ${props => props.theme.colors.text.primary};
  border: none;
  color: ${props => props.theme.colors.text.inverse};
  border-radius: 999px;
  padding: 10px 14px;
  ${props => props.theme.typography.caption}
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;
  box-shadow: 0 14px 28px rgba(16, 24, 40, 0.14);

  &:hover {
    background: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const ItemsList = styled.div`
  display: grid;
  gap: 14px;
`;

export const StoreGrouping = ({ storeGroup, onUpdateQuantity, onRemoveItem }) => {
  return (
    <Container>
      <StoreHeader>
        <StoreInfo>
          <StoreDetails>
            <StoreLogo>S</StoreLogo>
            <StoreText>
              <StoreName>{storeGroup.storeName}</StoreName>
              <StoreMeta>
                <MetaPill>4.6 rated</MetaPill>
                <MetaPill>{storeGroup.distance?.toFixed(1) || 0}km away</MetaPill>
                <MetaPill>{storeGroup.eta || 'Delivers today'}</MetaPill>
                <MetaPill>Fee R{storeGroup.deliveryFee?.toFixed(2) || '0.00'}</MetaPill>
              </StoreMeta>
            </StoreText>
          </StoreDetails>
          <ViewStoreButton>View store</ViewStoreButton>
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
