import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  margin: ${props => props.theme.spacing.md} 0;
  border-radius: ${props => props.theme.radii.lg};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const StoreList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const StoreCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$selected
    ? props.theme.colors.primarySoftBg
    : props.theme.colors.background};
  border: 2px solid ${props => props.$selected
    ? props.theme.colors.primary
    : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const StoreInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
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

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Price = styled.div`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
`;

const ETA = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-weight: 600;
  font-size: 11px;
`;

const BestValueBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.successBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 10px;
  margin-left: ${props => props.theme.spacing.xs};
`;

export const MultiStoreSelector = ({ stores = [], selectedStore, onSelectStore, location }) => {
  if (!stores || stores.length <= 1) return null;

  // Sort stores by best value (price + distance)
  const sortedStores = [...stores].sort((a, b) => {
    const scoreA = (a.price || 999) + (a.distance || 999);
    const scoreB = (b.price || 999) + (b.distance || 999);
    return scoreA - scoreB;
  });

  const bestStore = sortedStores[0];

  return (
    <Container>
      <SectionTitle>
        📍 Available at {stores.length} stores near you
      </SectionTitle>
      <StoreList>
        {sortedStores.map((store, index) => {
          const isSelected = selectedStore?.id === store.id;
          const isBestValue = store.id === bestStore.id;

          return (
            <StoreCard
              key={store.id || index}
              $selected={isSelected}
              onClick={() => onSelectStore && onSelectStore(store)}
            >
              <StoreInfo>
                <StoreName>
                  {store.name || store.storeName}
                  {isBestValue && <BestValueBadge>BEST VALUE</BestValueBadge>}
                </StoreName>
                <StoreMeta>
                  <span>📍 {store.distance || 0}km</span>
                  {store.stock && <span>📦 {store.stock}</span>}
                  {store.pickupAvailable && <span>🏪 Pickup</span>}
                </StoreMeta>
              </StoreInfo>
              <PriceInfo>
                <Price>R{store.price?.toFixed(2) || '0.00'}</Price>
                <ETA>{store.eta || 'Deliver Today'}</ETA>
              </PriceInfo>
            </StoreCard>
          );
        })}
      </StoreList>
    </Container>
  );
};











