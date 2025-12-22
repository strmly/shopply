import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { ProductRow } from './ProductRow';
import { ProductListHeader } from './ProductListHeader';
import { EmptyProductState } from './EmptyProductState';
import { SkeletonCard, SkeletonText, Skeleton } from '../../ui/Skeleton';
import { toast } from '../../ui/Toast';

import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const SkeletonProductRow = styled(SkeletonCard)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  min-height: 80px;
`;

const LoadMoreButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  ${props => props.theme.typography.button}
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.md};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ProductListPage = ({ location }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('best_sellers');
  const [filterStock, setFilterStock] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get seller ID from localStorage
  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };

  // Load products
  const loadProducts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const sellerId = getSellerId();
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        sortBy: sortBy,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (filterStock !== 'all') {
        params.append('stockStatus', filterStock);
      }

      if (filterVisibility !== 'all') {
        params.append('visibility', filterVisibility === 'visible');
      }

      if (filterStock === 'low') {
        params.append('lowStock', 'true');
      }

      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load products (${response.status})`);
      }

      const json = await response.json();

      if (json.success) {
        if (reset || pageNum === 1) {
          setProducts(json.data || []);
        } else {
          setProducts(prev => [...prev, ...(json.data || [])]);
        }
        setHasMore(json.pagination?.hasMore || false);
        setPage(pageNum);
      } else {
        throw new Error(json.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      if (pageNum === 1) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, sortBy, filterStock, filterVisibility]);

  // Initial load
  useEffect(() => {
    loadProducts(1, true);
  }, [searchQuery, sortBy, filterStock, filterVisibility]);

  // Handle product actions
  const handleProductUpdate = async (productId, updates) => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products/${productId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const json = await response.json();
      if (json.success) {
        // Update local state
        setProducts(prev =>
          prev.map(p => (p.id === productId ? json.data : p))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating product:', err);
      return false;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products/${productId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const handleToggleVisibility = async (productId, isVisible) => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products/${productId}/visibility`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isVisible }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const json = await response.json();
      if (json.success) {
        setProducts(prev =>
          prev.map(p => (p.id === productId ? json.data : p))
        );
        toast.success(`Product ${isVisible ? 'published' : 'hidden'} successfully`);
      }
    } catch (err) {
      console.error('Error updating visibility:', err);
      toast.error('Failed to update visibility. Please try again.');
    }
  };

  const handleDuplicateProduct = async (productId) => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products/${productId}/duplicate`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to duplicate product');
      }

      const json = await response.json();
      if (json.success) {
        // Reload products to show the new duplicate
        loadProducts(1, true);
        toast.success('Product duplicated successfully');
      }
    } catch (err) {
      console.error('Error duplicating product:', err);
      toast.error('Failed to duplicate product. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(page + 1, false);
    }
  };

  const handleAddProduct = () => {
    navigate('/seller/products/new');
  };

  const handleEditProduct = (productId) => {
    navigate(`/seller/products/${productId}/edit`);
  };

  if (loading && products.length === 0) {
    return (
      <Container>
        <TopNavigation />
        <Content>
          <ProductListHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterStock={filterStock}
            onFilterStockChange={setFilterStock}
            filterVisibility={filterVisibility}
            onFilterVisibilityChange={setFilterVisibility}
            onAddProduct={handleAddProduct}
          />
          <LoadingContainer>
            {[...Array(5)].map((_, i) => (
              <SkeletonProductRow key={i}>
                <Skeleton $width="64px" $height="64px" $circle />
                <div style={{ flex: 1 }}>
                  <SkeletonText $size="large" />
                  <SkeletonText $size="small" style={{ marginTop: '8px' }} />
                </div>
              </SkeletonProductRow>
            ))}
          </LoadingContainer>
        </Content>
        <BottomNavigation />
      </Container>
    );
  }

  if (error && products.length === 0) {
    return (
      <Container>
        <TopNavigation />
        <Content>
          <ProductListHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterStock={filterStock}
            onFilterStockChange={setFilterStock}
            filterVisibility={filterVisibility}
            onFilterVisibilityChange={setFilterVisibility}
            onAddProduct={handleAddProduct}
          />
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
            <button onClick={() => loadProducts(1, true)}>Retry</button>
          </div>
        </Content>
        <BottomNavigation />
      </Container>
    );
  }

  return (
    <Container>
      <TopNavigation />
      <Content>
        <ProductListHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterStock={filterStock}
          onFilterStockChange={setFilterStock}
          filterVisibility={filterVisibility}
          onFilterVisibilityChange={setFilterVisibility}
          onAddProduct={handleAddProduct}
        />

        {products.length === 0 ? (
          <EmptyProductState onAddProduct={handleAddProduct} />
        ) : (
          <>
            <ProductsList>
              {products.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleVisibility={handleToggleVisibility}
                  onDuplicate={handleDuplicateProduct}
                  onUpdate={handleProductUpdate}
                />
              ))}
            </ProductsList>

            {hasMore && (
              <LoadMoreButton
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </LoadMoreButton>
            )}
          </>
        )}
      </Content>
      <BottomNavigation />
    </Container>
  );
};

