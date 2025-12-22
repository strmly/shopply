import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CategoryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.circle};
  background: ${props => props.color || props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const CategoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryTitle = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const ProductCount = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

const ErrorTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ErrorMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const RetryButton = styled.button`
  ${props => props.theme.typography.button}
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

import API_BASE_URL from '@config/api';

// Furniture Room/Category metadata (matches backend furnitureTaxonomy.js)
const FURNITURE_ROOMS = {
  'living': { icon: '🛋️', label: 'Living Room', color: '#E8F1FF' },
  'bedroom': { icon: '🛏️', label: 'Bedroom', color: '#F3F0FE' },
  'dining': { icon: '🍽️', label: 'Dining Room', color: '#DBF8EE' },
  'office': { icon: '💼', label: 'Office', color: '#FDE4EE' },
  'outdoor': { icon: '🌳', label: 'Outdoor', color: '#FEF7E3' },
  'kids': { icon: '🧸', label: 'Kids Room', color: '#E6F2FF' },
  'storage': { icon: '📦', label: 'Storage', color: '#FDE4EE' },
  'all': { icon: '🪑', label: 'All Furniture', color: '#DBF8EE' },
};

// Legacy support - keep for backward compatibility
const CATEGORY_MAP = {
  'Living': 'living',
  'Bedroom': 'bedroom',
  'Dining': 'dining',
  'Office': 'office',
  'Outdoor': 'outdoor',
  'Kids': 'kids',
  'Storage': 'storage',
  'All Furniture': 'all',
};

const CATEGORY_METADATA = FURNITURE_ROOMS;

export const CategoryProductsPage = ({ location }) => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 12;

  // Check if this is a furniture room
  const furnitureRoom = FURNITURE_ROOMS[categoryName];
  const categoryMeta = furnitureRoom || { icon: '📦', label: categoryName, color: '#E8F1FF' };

  useEffect(() => {
    if (categoryName) {
      setPage(1);
      setProducts([]);
      loadProducts(1, true);
    }
  }, [categoryName]);

  const loadProducts = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      // Build API URL - filter by room for furniture
      let apiUrl = `${API_BASE_URL}/products?page=${pageNum}&limit=${itemsPerPage}`;
      
      if (furnitureRoom && categoryName !== 'all') {
        // Filter by room for furniture categories
        apiUrl += `&room=${categoryName}`;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          setProducts(data.data || []);
        } else {
          setProducts(prev => [...prev, ...(data.data || [])]);
        }
        setHasMore(data.pagination?.hasMore || false);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, false);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (product) => {
    if (!product || !product.id) return;

    try {
      // Add to localStorage cart
      const cartItem = {
        ...product,
        quantity: 1,
        selectedVariant: null,
        addedAt: new Date().toISOString(),
      };

      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      
      // Check if item already exists
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('shopply_cart', JSON.stringify(cart));
      
      // Update cart count in localStorage
      const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('shopply_cart_count', cartCount.toString());

      // Sync with backend
      try {
        await fetch(`${API_BASE_URL}/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'default',
            productId: product.id,
            quantity: 1,
            variant: null,
            storeId: product.storeId,
          }),
        });
      } catch (error) {
        console.error('Error syncing cart to backend:', error);
      }

      // Dispatch custom event to update cart count in other components
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success feedback
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <TopNavigation 
          location={location}
          onLocationClick={() => console.log('Location clicked')}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <LoadingContainer>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading products...</div>
        </LoadingContainer>
        <BottomNavigation currentPath="/category" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <TopNavigation 
          location={location}
          onLocationClick={() => console.log('Location clicked')}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Error Loading Products</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={loadProducts}>Try Again</RetryButton>
        </ErrorContainer>
        <BottomNavigation currentPath="/category" />
      </Container>
    );
  }

  return (
    <Container>
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => navigate('/')}
        onSearchClick={() => navigate('/search')}
      />
      
      <Content>
        <Header>
          <CategoryHeader>
            <CategoryIcon color={categoryMeta.color}>
              {categoryMeta.icon}
            </CategoryIcon>
            <CategoryInfo>
              <CategoryTitle>{categoryMeta.label}</CategoryTitle>
              <ProductCount>
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </ProductCount>
            </CategoryInfo>
          </CategoryHeader>
        </Header>

        {products.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyTitle>No Products Found</EmptyTitle>
            <EmptyMessage>
              We couldn't find any products in this category. Try browsing other categories!
            </EmptyMessage>
          </EmptyState>
        ) : (
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loadingMore}
            itemsPerPage={itemsPerPage}
          />
        )}
      </Content>
      
      <BottomNavigation currentPath="/category" />
    </Container>
  );
};


