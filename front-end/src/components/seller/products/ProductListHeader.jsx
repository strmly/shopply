import React from 'react';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  z-index: 10;
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 24px;
`;

const AddButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  ${props => props.theme.typography.button}
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  background: white;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

export const ProductListHeader = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterStock,
  onFilterStockChange,
  filterVisibility,
  onFilterVisibilityChange,
  onAddProduct,
}) => {
  return (
    <Header>
      <TopRow>
        <Title>Products</Title>
        <AddButton onClick={onAddProduct}>
          <span>+</span>
          <span>Add Product</span>
        </AddButton>
      </TopRow>
      <FiltersRow>
        <SearchInput
          type="text"
          placeholder="Search products, SKU, barcode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="best_sellers">Best Sellers</option>
          <option value="low_stock">Low Stock</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="category">Category</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </Select>
        <Select
          value={filterStock}
          onChange={(e) => onFilterStockChange(e.target.value)}
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </Select>
        <Select
          value={filterVisibility}
          onChange={(e) => onFilterVisibilityChange(e.target.value)}
        >
          <option value="all">All Products</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </Select>
      </FiltersRow>
    </Header>
  );
};


