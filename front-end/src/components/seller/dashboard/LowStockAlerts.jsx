import styled from 'styled-components';

const Card = styled.div`
  padding: 18px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 900;
`;

const CountBadge = styled.div`
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${props => props.$critical ? props.theme.colors.dangerBase : props.theme.colors.primarySoftBg};
  color: ${props => props.$critical ? '#ffffff' : props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 950;
`;

const List = styled.div`
  display: grid;
  gap: 10px;
`;

const Item = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid ${props => props.$critical ? 'rgba(245, 158, 11, 0.3)' : 'rgba(61, 129, 239, 0.16)'};
  background: ${props => props.$critical
    ? 'linear-gradient(135deg, #FFF7E6 0%, #F1F7FF 100%)'
    : props.theme.colors.gradient.soft};
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(16, 24, 40, 0.08);
  }

  @media (max-width: 520px) {
    grid-template-columns: 44px minmax(0, 1fr);
  }
`;

const Image = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  object-fit: cover;
  background: #ffffff;

  @media (max-width: 520px) {
    width: 44px;
    height: 44px;
  }
`;

const Placeholder = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #ffffff;
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  font-weight: 950;

  @media (max-width: 520px) {
    width: 44px;
    height: 44px;
  }
`;

const ProductName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductMeta = styled.div`
  margin-top: 4px;
  color: ${props => props.$critical ? props.theme.colors.warningBase : props.theme.colors.primary};
  font-size: 12px;
  font-weight: 850;
`;

const Action = styled.div`
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;

  @media (max-width: 520px) {
    display: none;
  }
`;

const EmptyState = styled.div`
  padding: 24px;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  font-size: 14px;
  font-weight: 800;
`;

export const LowStockAlerts = ({
  lowStockProducts = { products: [], criticalCount: 0 },
  onProductClick,
}) => {
  const { products = [], criticalCount = 0 } = lowStockProducts;

  if (products.length === 0) {
    return (
      <Card>
        <Header>
          <Title>Stock Alerts</Title>
          <CountBadge>Healthy</CountBadge>
        </Header>
        <EmptyState>Stock levels look healthy. We will surface urgent items here.</EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <Title>Stock Alerts</Title>
        <CountBadge $critical={criticalCount > 0}>{criticalCount > 0 ? `${criticalCount} critical` : `${products.length} low`}</CountBadge>
      </Header>

      <List>
        {products.slice(0, 5).map((product) => {
          const isOut = product.stock === 'out' || product.stockQuantity === 0;
          const isCritical = product.isCritical || isOut;
          const stockText = isOut ? 'Out of stock' : product.stockQuantity !== null ? `${product.stockQuantity} left` : 'Low stock';

          return (
            <Item
              key={product.id}
              type="button"
              $critical={isCritical}
              onClick={() => onProductClick?.(product)}
              aria-label={`${product.name}: ${stockText}. Edit product stock.`}
            >
              {product.image ? (
                <Image src={product.image} alt={product.name} />
              ) : (
                <Placeholder>PR</Placeholder>
              )}
              <div>
                <ProductName>{product.name}</ProductName>
                <ProductMeta $critical={isCritical}>{stockText}</ProductMeta>
              </div>
              <Action>Update</Action>
            </Item>
          );
        })}
      </List>
    </Card>
  );
};
