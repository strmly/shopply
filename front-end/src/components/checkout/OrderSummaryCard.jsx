import { useState } from 'react';
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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Icon = styled.span`
  font-size: 20px;
`;

const SummaryText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const Price = styled.span`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
`;

const Chevron = styled.span`
  font-size: 18px;
  color: ${props => props.theme.colors.text.tertiary};
  transition: transform 0.2s ease;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ExpandedContent = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.2s ease-in;
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
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-left: ${props => props.theme.spacing.md};
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const ItemName = styled.span`
  flex: 1;
`;

const ItemPrice = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.light};
  margin: ${props => props.theme.spacing.sm} 0;
`;

const Subtotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.sm};
`;

export const OrderSummaryCard = ({ cart }) => {
  const [expanded, setExpanded] = useState(false);

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const itemCount = cart.itemCount || cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const itemsTotal = cart.totals?.itemsTotal || 0;

  return (
    <Card>
      <Header onClick={() => setExpanded(!expanded)}>
        <LeftSection>
          <Icon>🛒</Icon>
          <SummaryText>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} • R{itemsTotal.toFixed(2)}
          </SummaryText>
        </LeftSection>
        <Chevron expanded={expanded}>↓</Chevron>
      </Header>

      {expanded && (
        <ExpandedContent>
          {cart.storeGroups && cart.storeGroups.length > 0 ? (
            cart.storeGroups.map((group, index) => (
              <StoreGroup key={group.storeId || index}>
                <StoreName>{group.storeName}</StoreName>
                <ItemList>
                  {group.items.map((item) => {
                    const product = item.product || item;
                    const price = product.price || 0;
                    const quantity = item.quantity || 1;
                    return (
                      <ItemRow key={item.id}>
                        <ItemName>
                          • {product.name} x {quantity}
                        </ItemName>
                        <ItemPrice>R{(price * quantity).toFixed(2)}</ItemPrice>
                      </ItemRow>
                    );
                  })}
                </ItemList>
              </StoreGroup>
            ))
          ) : (
            <ItemList>
              {cart.items.map((item) => {
                const product = item.product || item;
                const price = product.price || 0;
                const quantity = item.quantity || 1;
                return (
                  <ItemRow key={item.id}>
                    <ItemName>
                      • {product.name} x {quantity}
                    </ItemName>
                    <ItemPrice>R{(price * quantity).toFixed(2)}</ItemPrice>
                  </ItemRow>
                );
              })}
            </ItemList>
          )}
          <Divider />
          <Subtotal>
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
            <span>R{itemsTotal.toFixed(2)}</span>
          </Subtotal>
        </ExpandedContent>
      )}
    </Card>
  );
};











