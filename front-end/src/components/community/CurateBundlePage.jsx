import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #FEF3C7 0%, #FEF9E7 15%, #FFFFFF 30%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
`;

const HeroHeader = styled.div`
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.9; }
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
  animation: bounce 2s ease-in-out infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-10px) scale(1.1); }
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: white;
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: rgba(255,255,255,0.95);
  margin: 0;
  font-weight: 500;
`;

const SearchContainer = styled.div`
  margin: ${props => props.theme.spacing.lg} 0;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ProductsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ProductCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  border: 2px solid ${props => props.curated ? props.theme.colors.primary : props.theme.colors.border.light};
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ProductImage = styled.div`
  width: 100%;
  padding-top: 100%;
  position: relative;
  background: ${props => props.theme.colors.background};
  overflow: hidden;
`;

const ProductImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: ${props => props.theme.spacing.sm};
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const CuratedBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  padding: 4px 8px;
  border-radius: ${props => props.theme.radii.sm};
  font-size: 10px;
  font-weight: 700;
  z-index: 1;
`;

const AddButton = styled.button`
  width: 100%;
  margin-top: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.curated ? props.theme.colors.success : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  min-height: 40vh;
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

const Toast = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.success ? '#10B981' : '#EF4444'};
  color: white;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radii.lg};
  ${props => props.theme.typography.body1}
  font-weight: 600;
  z-index: 1000;
  box-shadow: ${props => props.theme.shadows.lg};
  animation: ${fadeIn} 0.3s ease-in;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

const BUNDLE_CONFIG = {
  'grocery-stores': {
    icon: '🛒',
    title: 'Curate Grocery Stores',
    subtitle: 'Add your favorite grocery stores and products',
  },
  'electronics': {
    icon: '📱',
    title: 'Curate Electronics',
    subtitle: 'Share your top tech recommendations',
  },
  'food-favorites': {
    icon: '🍽️',
    title: 'Curate Food Favorites',
    subtitle: 'Recommend your favorite local food items',
  },
};

export const CurateBundlePage = ({ location }) => {
  const { bundleType } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [curating, setCurating] = useState({});
  const [curatedProductIds, setCuratedProductIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const userId = getCurrentUserId();
  const userName = 'Local Shopper'; // In production, get from user profile

  const config = BUNDLE_CONFIG[bundleType] || BUNDLE_CONFIG['grocery-stores'];

  useEffect(() => {
    loadProducts();
  }, [bundleType]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Get all products that could be added to this bundle
      const categoryMap = {
        'grocery-stores': 'Groceries',
        'electronics': 'Electronics',
        'food-favorites': 'Groceries', // Food items are in Groceries or Braai
      };
      
      const category = categoryMap[bundleType] || 'Groceries';
      const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}&limit=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const loadedProducts = data.data || [];
        setProducts(loadedProducts);
        // Load curated products after products are set
        if (loadedProducts.length > 0) {
          // Use a small delay to ensure state is updated
          setTimeout(() => {
            loadCuratedProducts();
          }, 300);
        }
      } else {
        console.error('Error loading products:', data.message);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCuratedProducts = async () => {
    try {
      // Get all curated items for this bundle and check which ones belong to current user
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(
        `${API_BASE_URL}/community/bundles/${bundleType}/curated?location=${locationParam}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filter items curated by current user
        const userCurated = new Set();
        data.data.forEach(item => {
          if (item.userId === userId && item.productId) {
            userCurated.add(item.productId);
          }
        });
        setCuratedProductIds(userCurated);
      }
    } catch (err) {
      console.error('Error loading curated products:', err);
      // Don't show error to user, just log it
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.storeName?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleCurateProduct = async (product) => {
    if (curating[product.id]) return;

    try {
      setCurating(prev => ({ ...prev, [product.id]: true }));

      const locationParam = location ? {
        suburb: location.suburb,
        city: location.city,
      } : null;

      const response = await fetch(
        `${API_BASE_URL}/community/bundles/${bundleType}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            userId,
            userName,
            location: locationParam,
            reason: '',
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setCuratedProductIds(prev => new Set([...prev, product.id]));
        setToast({ message: '✓ Added to bundle!', success: true });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: data.message || 'Failed to add product', success: false });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error curating product:', error);
    } finally {
      setCurating(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  };

  const handleRemoveCurated = async (product) => {
    if (curating[product.id]) return;

    try {
      setCurating(prev => ({ ...prev, [product.id]: true }));

      const response = await fetch(
        `${API_BASE_URL}/community/bundles/${bundleType}/items/${product.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setCuratedProductIds(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        setToast({ message: '✓ Removed from bundle', success: true });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: data.message || 'Failed to remove product', success: false });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error removing product:', error);
    } finally {
      setCurating(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{config.icon}</div>
          <div>Loading products...</div>
        </LoadingContainer>
        <BottomNavigation currentPath="/community" />
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
      
      {toast && (
        <Toast success={toast.success}>
          {toast.success ? '✓' : '✕'} {toast.message}
        </Toast>
      )}
      
      <Content>
        <HeroHeader>
          <HeaderContent>
            <Icon>{config.icon}</Icon>
            <Title>{config.title}</Title>
            <Subtitle>{config.subtitle}</Subtitle>
          </HeaderContent>
        </HeroHeader>

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search for products to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchContainer>

        {filteredProducts.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyTitle>No Products Found</EmptyTitle>
            <EmptyMessage>
              {searchQuery ? 'Try a different search term' : 'No products available in this category'}
            </EmptyMessage>
          </EmptyState>
        ) : (
          <ProductsList>
            {filteredProducts.map((product) => {
              const isCurated = curatedProductIds.has(product.id);
              const isCurating = curating[product.id];

              return (
                <ProductCard
                  key={product.id}
                  curated={isCurated}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {isCurated && <CuratedBadge>✓ Curated</CuratedBadge>}
                  <ProductImage>
                    {product.image ? (
                      <ProductImg src={product.image} alt={product.name} />
                    ) : (
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        fontSize: '48px',
                        opacity: 0.3
                      }}>
                        📦
                      </div>
                    )}
                  </ProductImage>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>R{product.price?.toFixed(2) || '0.00'}</ProductPrice>
                    <AddButton
                      curated={isCurated}
                      disabled={isCurating}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurated) {
                          handleRemoveCurated(product);
                        } else {
                          handleCurateProduct(product);
                        }
                      }}
                    >
                      {isCurating
                        ? '...'
                        : isCurated
                        ? '✓ Remove'
                        : '+ Add to Bundle'}
                    </AddButton>
                  </ProductInfo>
                </ProductCard>
              );
            })}
          </ProductsList>
        )}
      </Content>
      
      <BottomNavigation currentPath="/community" />
    </Container>
  );
};
