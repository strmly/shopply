import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => {
    if (props.status === 'completed') return props.theme.colors.successBase;
    if (props.status === 'preparing') return props.theme.colors.primary;
    return props.theme.colors.border.light;
  }};
  animation: ${fadeIn} 0.3s ease-in;
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Distance = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const Status = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => {
    if (props.status === 'completed') return props.theme.colors.successBase;
    if (props.status === 'preparing') return props.theme.colors.primary;
    return props.theme.colors.text.secondary;
  }};
  font-weight: 600;
  font-size: 14px;
  margin-top: ${props => props.theme.spacing.xs};
`;

const ETA = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  margin-top: 4px;
`;

const getStatusIcon = (status) => {
  const icons = {
    'completed': '✓',
    'preparing': '📦',
    'waiting': '⏳',
  };
  return icons[status] || '⏳';
};

export const StoreInformationBlocks = ({ storeStatuses }) => {
  if (!storeStatuses || storeStatuses.length === 0) {
    return null;
  }

  return (
    <Container>
      {storeStatuses.map((store, index) => (
        <Card key={store.storeId || index} status={store.status}>
          <StoreHeader>
            <StoreName>
              {getStatusIcon(store.status)} {store.storeName}
            </StoreName>
            <Distance>{store.distance?.toFixed(1) || 0} km away</Distance>
          </StoreHeader>
          <Status status={store.status}>{store.message}</Status>
          <ETA>ETA pickup: {store.eta}</ETA>
        </Card>
      ))}
    </Container>
  );
};











