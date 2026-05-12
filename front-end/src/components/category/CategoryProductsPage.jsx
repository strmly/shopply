import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { ProductGrid } from '../home/ProductGrid';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 54%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const Hero = styled.section`
  max-width: 1180px;
  margin: 24px auto 22px;
  padding: 0 min(5vw, 48px);
`;

const HeroPanel = styled.div`
  position: relative;
  overflow: hidden;
  padding: 30px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(241,247,255,0.86) 100%) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.24), rgba(196, 184, 252, 0.2), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.1);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 22px;
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    right: 18px;
    bottom: -50px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(126, 193, 246, 0.2), transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryIcon = styled.div`
  width: 82px;
  height: 82px;
  border-radius: 26px;
  background: ${props => props.$color || props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.primarySoftText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.12);
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.div`
  width: fit-content;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.18);
  border-radius: 999px;
  padding: 7px 11px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const CategoryTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: 0;
`;

const CategoryDescription = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 12px 0 0;
  font-weight: 500;
  max-width: 560px;
`;

const CountCard = styled.div`
  position: relative;
  z-index: 1;
  min-width: 150px;
  padding: 16px;
  border-radius: 22px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  text-align: center;
`;

const CountValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 30px;
  line-height: 1;
  font-weight: 900;
`;

const CountLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
  margin-top: 5px;
`;

const CenterState = styled.div`
  max-width: 680px;
  margin: 40px auto;
  padding: 36px 24px;
  text-align: center;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const StateIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 22px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
`;

const StateTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 900;
`;

const StateMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 18px;
`;

const RetryButton = styled.button`
  ${props => props.theme.typography.button}
  padding: 14px 20px;
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    transform: translateY(-1px);
  }
`;

const FURNITURE_ROOMS = {
  living: { icon: 'L', label: 'Living Room', description: 'Sofas and tables', color: '#E8F1FF' },
  bedroom: { icon: 'B', label: 'Bedroom', description: 'Beds and storage', color: '#F3F0FE' },
  dining: { icon: 'D', label: 'Dining Room', description: 'Tables, chairs, and hosting pieces', color: '#DBF8EE' },
  office: { icon: 'O', label: 'Office', description: 'Desks, storage, and focus pieces', color: '#E6F2FF' },
  outdoor: { icon: 'G', label: 'Outdoor', description: 'Garden, patio, and balcony finds', color: '#FEF7E3' },
  kids: { icon: 'K', label: 'Kids Room', description: 'Playful furniture for little spaces', color: '#FDF2F8' },
  storage: { icon: 'S', label: 'Storage', description: 'Cabinets, shelving, and tidy solutions', color: '#F2F5F9' },
  all: { icon: 'A', label: 'All Rooms', description: 'Every curated local furniture find', color: '#ECFEFF' },
};

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

  const furnitureRoom = FURNITURE_ROOMS[categoryName];
  const categoryMeta = furnitureRoom || {
    icon: 'A',
    label: categoryName,
    description: 'Curated local availability.',
    color: '#E8F1FF',
  };

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

      let apiUrl = `${API_BASE_URL}/products?page=${pageNum}&limit=${itemsPerPage}`;
      if (furnitureRoom && categoryName !== 'all') {
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
      const cartItem = {
        ...product,
        quantity: 1,
        selectedVariant: null,
        addedAt: new Date().toISOString(),
      };

      const cart = JSON.parse(localStorage.getItem('tsenga_cart') || '[]');
      const existingIndex = cart.findIndex(item =>
        item.id === product.id &&
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('tsenga_cart', JSON.stringify(cart));
      const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('tsenga_cart_count', cartCount.toString());

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
      } catch (syncError) {
        console.error('Error syncing cart to backend:', syncError);
      }

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (cartError) {
      console.error('Error adding to cart:', cartError);
    }
  };

  const nav = (
    <TopNavigation
      location={location}
      onLocationClick={() => console.log('Location clicked')}
      onSearch={(query) => console.log('Search:', query)}
      onNotificationClick={() => navigate('/')}
      onSearchClick={() => navigate('/search')}
    />
  );

  if (loading) {
    return (
      <Container>
        {nav}
        <CenterState>
          <StateIcon>{categoryMeta.icon}</StateIcon>
          <StateTitle>Loading {categoryMeta.label}</StateTitle>
          <StateMessage>Finding local availability and beautiful pieces nearby.</StateMessage>
        </CenterState>
        <BottomNavigation currentPath="/category" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        {nav}
        <CenterState>
          <StateIcon>!</StateIcon>
          <StateTitle>Error Loading Products</StateTitle>
          <StateMessage>{error}</StateMessage>
          <RetryButton onClick={() => loadProducts(1, true)}>Try Again</RetryButton>
        </CenterState>
        <BottomNavigation currentPath="/category" />
      </Container>
    );
  }

  return (
    <Container>
      {nav}

      <Content>
        <Hero>
          <HeroPanel>
            <CategoryIcon $color={categoryMeta.color}>{categoryMeta.icon}</CategoryIcon>
            <HeroCopy>
              <Eyebrow>Shop by room</Eyebrow>
              <CategoryTitle>{categoryMeta.label}</CategoryTitle>
              <CategoryDescription>{categoryMeta.description}</CategoryDescription>
            </HeroCopy>
            <CountCard>
              <CountValue>{products.length}</CountValue>
              <CountLabel>{products.length === 1 ? 'product' : 'products'} available</CountLabel>
            </CountCard>
          </HeroPanel>
        </Hero>

        {products.length === 0 ? (
          <CenterState>
            <StateIcon>{categoryMeta.icon}</StateIcon>
            <StateTitle>No Products Found</StateTitle>
            <StateMessage>
              We could not find any products in this category. Try browsing another room.
            </StateMessage>
          </CenterState>
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
