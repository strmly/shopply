import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StoreGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: 14px;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-left: ${props => props.theme.spacing.md};
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

export const OrderContentsPreview = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card>
      <Title>🛍 Order Contents</Title>
      
      {items.map((storeGroup, index) => (
        <StoreGroup key={storeGroup.storeId || index}>
          <StoreName>{storeGroup.storeName || 'Store'}</StoreName>
          <ItemList>
            {storeGroup.items && storeGroup.items.map((item) => {
              const product = item.product || item;
              const quantity = item.quantity || 1;
              return (
                <ItemRow key={item.id}>
                  <span>•</span>
                  <span>{product.name || 'Item'} x{quantity}</span>
                </ItemRow>
              );
            })}
          </ItemList>
        </StoreGroup>
      ))}
    </Card>
  );
};











