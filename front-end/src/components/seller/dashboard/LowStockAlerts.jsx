import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.4s ease-out;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  overflow-x: auto;
  overflow-y: hidden;
  padding: ${props => props.theme.spacing.xs} 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.border.light} transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.light};
    border-radius: ${props => props.theme.radii.pill};
  }
`;

const StockPill = styled.button`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => {
    if (props.$isCritical) {
      return props.theme.colors.dangerSoftBg;
    }
    return props.theme.colors.warningSoftBg;
  }};
  border: 2px solid ${props => {
    if (props.$isCritical) {
      return props.theme.colors.dangerBase;
    }
    return props.theme.colors.warningBase;
  }};
  border-radius: ${props => props.theme.radii.pill};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  scroll-snap-align: start;
  min-width: 220px;
  animation: ${props => props.$pulse ? 'pulse 2s ease-in-out infinite' : 'none'};
  box-shadow: ${props => props.theme.shadows.sm};

  @keyframes pulse {
    0%, 100% {
      border-color: ${props => {
        if (props.$isCritical) {
          return props.theme.colors.dangerBase;
        }
        return props.theme.colors.warningBase;
        }};
    }
    50% {
      border-color: ${props => {
        if (props.$isCritical) {
          return props.theme.colors.dangerBase;
        }
        return props.theme.colors.warningBase;
        }};
      opacity: 0.7;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProductImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.radii.md};
  object-fit: cover;
  background: ${props => props.theme.colors.surface};
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const StockInfo = styled.div`
  ${props => props.theme.typography.caption}
  font-size: 11px;
  color: ${props => {
    if (props.$isCritical) {
      return props.theme.colors.dangerBase;
    }
    return props.theme.colors.warningBase;
  }};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WarningIcon = styled.span`
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-size: 14px;
`;

const OutOfStockBadge = styled.div`
  background: ${props => props.theme.colors.dangerBase};
  color: white;
  padding: 2px 8px;
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.caption}
  font-size: 10px;
  font-weight: 700;
  margin-top: 4px;
`;

export const LowStockAlerts = ({ 
  lowStockProducts = { products: [], criticalCount: 0 },
  onProductClick 
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const { products, criticalCount } = lowStockProducts;

  if (products.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Low Stock Alerts</Title>
        </Header>
        <EmptyState>
          Stock levels look good 👍
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Low Stock Alerts</Title>
        {criticalCount > 0 && (
          <div style={{ 
            background: '#C62850', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '12px', 
            fontWeight: 700 
          }}>
            {criticalCount} critical
          </div>
        )}
      </Header>

      <ScrollContainer>
        {products.map((product) => {
          const isOutOfStock = product.stock === 'out' || product.stockQuantity === 0;
          const isCritical = product.isCritical || isOutOfStock;
          const stockText = isOutOfStock 
            ? 'Out of Stock' 
            : product.stockQuantity !== null 
              ? `${product.stockQuantity} left`
              : 'Low stock';

          return (
            <StockPill
              key={product.id}
              $isCritical={isCritical}
              $pulse={isCritical}
              onClick={() => handleProductClick(product)}
              aria-label={`${product.name}: ${stockText}. ${isCritical ? 'Critical' : 'Low'} stock. Click to update stock.`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProductClick(product);
                }
              }}
            >
              {product.image ? (
                <ProductImage src={product.image} alt={product.name} />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#F2F4F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  📦
                </div>
              )}
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <StockInfo $isCritical={isCritical}>
                  <WarningIcon>⚠️</WarningIcon>
                  <span>{stockText}</span>
                </StockInfo>
                {isOutOfStock && (
                  <OutOfStockBadge>Add Stock</OutOfStockBadge>
                )}
              </ProductInfo>
            </StockPill>
          );
        })}
      </ScrollContainer>
    </Container>
  );
};
