import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { InlineEditPrice } from './InlineEditPrice';
import { InlineEditStock } from './InlineEditStock';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { toast } from '../../ui/Toast';

const slideIn = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-80px);
  }
`;

const Container = styled.div`
  position: relative;
  background: ${props => props.theme.colors.card.default};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  overflow: hidden;
  transition: ${props => props.theme.transitions.swift};
  opacity: ${props => (props.$hidden ? 0.5 : 1)};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.border.default};
  }
`;

const SwipeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  transform: ${props => `translateX(${props.$translateX}px)`};
  transition: ${props => (props.$isDragging ? 'none' : 'transform 0.3s ease-out')};
  background: ${props => {
    if (props.$swipeDirection === 'left') return props.theme.colors.danger[100];
    if (props.$swipeDirection === 'right') return props.theme.colors.info[100];
    return 'transparent';
  }};
`;

const SwipeAction = styled.div`
  position: absolute;
  ${props => (props.$side === 'left' ? 'right: 0;' : 'left: 0;')}
  width: 80px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$action === 'delete') return props.theme.colors.danger[500];
    if (props.$action === 'edit') return props.theme.colors.primary;
    return 'transparent';
  }};
  color: white;
  font-size: 24px;
`;

const RowContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: white;
  width: 100%;
  min-height: 80px;
`;

const Thumbnail = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  object-fit: cover;
  background: ${props => props.theme.colors.surface};
  cursor: pointer;
  flex-shrink: 0;
`;

const PlaceholderThumbnail = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 24px;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  min-width: 0;
`;

const ProductTitle = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const ProductDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const Price = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const StockInfo = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.$stock === 'out') return props.theme.colors.danger[500];
    if (props.$stock === 'low') return props.theme.colors.warning[500];
    return props.theme.colors.text.secondary;
  }};
  cursor: pointer;
  font-weight: ${props => (props.$stock === 'low' || props.$stock === 'out' ? 600 : 400)};

  &:hover {
    opacity: 0.8;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-shrink: 0;
`;

const VisibilityToggle = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  background: ${props => (props.$visible ? props.theme.colors.success[100] : props.theme.colors.surface)};
  color: ${props => (props.$visible ? props.theme.colors.success[600] : props.theme.colors.text.tertiary)};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => (props.$visible ? props.theme.colors.success[200] : props.theme.colors.surfaceAlt)};
    transform: scale(1.05);
  }
`;

const MenuButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${props => props.theme.spacing.xs};
  background: white;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: none;
  background: white;
  text-align: left;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    background: ${props => props.theme.colors.surface};
  }

  &:first-child {
    border-top-left-radius: ${props => props.theme.radii.md};
    border-top-right-radius: ${props => props.theme.radii.md};
  }

  &:last-child {
    border-bottom-left-radius: ${props => props.theme.radii.md};
    border-bottom-right-radius: ${props => props.theme.radii.md};
  }
`;

export const ProductRow = ({
  product,
  onEdit,
  onDelete,
  onToggleVisibility,
  onDuplicate,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingStock, setEditingStock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    if (editingPrice || editingStock) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || editingPrice || editingStock) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;

    if (Math.abs(diff) > 10) {
      setTranslateX(diff);
      setSwipeDirection(diff < 0 ? 'left' : 'right');
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || editingPrice || editingStock) return;
    setIsDragging(false);

    if (Math.abs(translateX) > 60) {
      if (translateX < 0) {
        // Swipe left - delete
        setShowDeleteConfirm(true);
      } else {
        // Swipe right - edit
        onEdit(product.id);
      }
    }

    setTranslateX(0);
    setSwipeDirection(null);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete(product.id);
  };

  const handlePriceClick = () => {
    if (!editingStock) {
      setEditingPrice(true);
    }
  };

  const handleStockClick = () => {
    if (!editingPrice) {
      setEditingStock(true);
    }
  };

  const handlePriceSave = async (price, discountPrice) => {
    const success = await onUpdate(product.id, { price, discountPrice });
    if (success) {
      setEditingPrice(false);
      toast.success('Price updated successfully');
    } else {
      toast.error('Failed to update price');
    }
  };

  const handleStockSave = async (stockQuantity) => {
    const success = await onUpdate(product.id, { stockQuantity });
    if (success) {
      setEditingStock(false);
      toast.success('Stock updated successfully');
    } else {
      toast.error('Failed to update stock');
    }
  };

  const getDisplayPrice = () => {
    const price = product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;
    return `R${price.toFixed(2)}`;
  };

  const getStockText = () => {
    if (!product.trackInventory) return 'Unlimited';
    if (product.stock === 'out') return 'OUT OF STOCK';
    if (product.stock === 'low') return `Low stock: ${product.stockQuantity} left`;
    return `${product.stockQuantity} in stock`;
  };

  return (
    <Container
      ref={containerRef}
      $hidden={!product.isVisible}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SwipeContainer
        $translateX={translateX}
        $isDragging={isDragging}
        $swipeDirection={swipeDirection}
      >
        {swipeDirection === 'left' && (
          <SwipeAction $side="left" $action="delete">
            🗑️
          </SwipeAction>
        )}
        {swipeDirection === 'right' && (
          <SwipeAction $side="right" $action="edit">
            ✏️
          </SwipeAction>
        )}

        <RowContent>
          {product.image || (product.images && product.images.length > 0) ? (
            <Thumbnail
              src={product.image || product.images[0]}
              alt={product.name}
              onClick={() => onEdit(product.id)}
            />
          ) : (
            <PlaceholderThumbnail>📦</PlaceholderThumbnail>
          )}

          <ProductInfo>
            <ProductTitle onClick={() => onEdit(product.id)}>
              {product.name}
            </ProductTitle>
            <ProductDetails>
              {editingPrice ? (
                <InlineEditPrice
                  price={product.price}
                  discountPrice={product.discountPrice}
                  onSave={handlePriceSave}
                  onCancel={() => setEditingPrice(false)}
                />
              ) : (
                <Price onClick={handlePriceClick}>{getDisplayPrice()}</Price>
              )}
              <span>•</span>
              {editingStock ? (
                <InlineEditStock
                  stockQuantity={product.stockQuantity || 0}
                  trackInventory={product.trackInventory !== false}
                  onSave={handleStockSave}
                  onCancel={() => setEditingStock(false)}
                />
              ) : (
                <StockInfo
                  $stock={product.stock}
                  onClick={handleStockClick}
                >
                  {getStockText()}
                </StockInfo>
              )}
            </ProductDetails>
          </ProductInfo>

          <Actions>
            <VisibilityToggle
              $visible={product.isVisible}
              onClick={() => onToggleVisibility(product.id, !product.isVisible)}
              title={product.isVisible ? 'Hide product' : 'Show product'}
            >
              {product.isVisible ? '👁️' : '👁️‍🗨️'}
            </VisibilityToggle>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <MenuButton onClick={() => setShowMenu(!showMenu)}>⋮</MenuButton>
              {showMenu && (
                <MenuDropdown>
                  <MenuItem onClick={() => { setShowMenu(false); onEdit(product.id); }}>
                    ✏️ Edit
                  </MenuItem>
                  <MenuItem onClick={() => { setShowMenu(false); onDuplicate(product.id); }}>
                    📋 Duplicate
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowMenu(false);
                      onToggleVisibility(product.id, !product.isVisible);
                    }}
                  >
                    {product.isVisible ? '👁️‍🗨️ Hide' : '👁️ Show'}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    style={{ color: 'red' }}
                  >
                    🗑️ Delete
                  </MenuItem>
                </MenuDropdown>
              )}
            </div>
          </Actions>
        </RowContent>
      </SwipeContainer>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </Container>
  );
};

