import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: ${props => props.theme.colors.card.default};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.radii.md};
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.button}
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.surfaceAlt};
  }
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  border: 1px solid transparent;

  &:hover {
    background: ${props => props.theme.colors.surfaceAlt};
    border-color: ${props => props.theme.colors.border.default};
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.surfaceAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const ProductStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  flex-wrap: wrap;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const TrendIcon = styled.span`
  font-size: 14px;
`;

const Arrow = styled.span`
  font-size: 12px;
  color: ${props => props.$isPositive ? props.theme.colors.status.success : props.theme.colors.status.error};
`;

const InsightBox = styled.div`
  background: ${props => props.theme.colors.info[100]};
  border-left: 3px solid ${props => props.theme.colors.info[500]};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  margin-top: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProductPerformance = ({ data, sellerId }) => {
  const [filter, setFilter] = useState('bestsellers');

  if (!data || !data.products || data.products.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Product Performance</Title>
        </Header>
        <EmptyState>
          Add at least 3 products to see performance insights.
        </EmptyState>
      </Container>
    );
  }

  const { products, insights } = data;

  const filters = [
    { key: 'bestsellers', label: 'Best Sellers' },
    { key: 'trending', label: 'Trending' },
    { key: 'low_performers', label: 'Low Performers' },
    { key: 'returns', label: 'Returns' }
  ];

  return (
    <Container>
      <Header>
        <Title>Product Performance</Title>
        <Tabs>
          {filters.map(f => (
            <Tab
              key={f.key}
              $active={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Tab>
          ))}
        </Tabs>
      </Header>

      <ProductList>
        {products.map((product) => (
          <ProductRow key={product.productId}>
            <ProductImage>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                '📦'
              )}
            </ProductImage>
            <ProductInfo>
              <ProductName>
                {product.name}
                {product.isTrending && <TrendIcon>🔥</TrendIcon>}
                {product.isDeclining && <TrendIcon>⚠️</TrendIcon>}
              </ProductName>
              <ProductStats>
                <StatItem>
                  <strong>Sales:</strong> {product.sales}
                </StatItem>
                <StatItem>
                  <strong>Revenue:</strong> {formatCurrency(product.revenue)}
                </StatItem>
                <StatItem>
                  <strong>Orders:</strong> {product.orders}
                </StatItem>
                {product.salesChange !== undefined && (
                  <StatItem>
                    <Arrow $isPositive={product.salesChange >= 0}>
                      {product.salesChange >= 0 ? '▲' : '▼'}
                    </Arrow>
                    {Math.abs(product.salesChange).toFixed(1)}%
                  </StatItem>
                )}
              </ProductStats>
            </ProductInfo>
          </ProductRow>
        ))}
      </ProductList>

      {insights && insights.length > 0 && (
        <InsightBox>
          {insights.map((insight, index) => (
            <div key={index}>{insight}</div>
          ))}
        </InsightBox>
      )}
    </Container>
  );
};


