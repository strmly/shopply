import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { SkeletonCard, SkeletonText } from '../ui/Skeleton';
import SellerCard from '../furniture/SellerCard';
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
  gap: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 26px;
  margin: 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin: 0;
`;

const StoreSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${props => props.theme.spacing.sm};
`;

const ProductCard = styled(SkeletonCard)`
  padding: ${props => props.theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 13px;
`;

const ProductPrice = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
  font-size: 13px;
`;

const ProductMeta = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  border-radius: ${props => props.theme.radii.lg};
  background: ${props => props.theme.colors.surface};
  border: 1px dashed ${props => props.theme.colors.border.light};
`;

const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyTitle = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const EmptyMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const ErrorState = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.dangerSoftBg};
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.dangerBase};
  ${props => props.theme.typography.body2}
`;

const LoadingStoreCard = styled(SkeletonCard)`
  padding: ${props => props.theme.spacing.md};
`;

export const StoreFrontPage = ({ location }) => {
  const navigate = useNavigate();
  const [storeInfo, setStoreInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };

  const getStoreId = () => {
    const storeId = localStorage.getItem('sellerStoreId');
    return storeId || getSellerId();
  };

  useEffect(() => {
    const sellerId = getSellerId();
    const storeId = getStoreId();

    const loadStoreInfo = async () => {
      try {
        setLoadingStore(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`);
        if (!response.ok) {
          throw new Error('Failed to load store info');
        }

        const json = await response.json();
        if (json.success && json.data) {
          const seller = json.data;
          const storeName =
            seller.storeSetup?.name ||
            seller.legalBusinessName ||
            'My Store';

          const store = {
            id: storeId,
            name: storeName,
            logo: seller.storeSetup?.logo || null,
            description:
              seller.storeSetup?.description ||
              'This is how shoppers will see your store on Tsenga.',
            address: seller.storeSetup?.address || {
              suburb: location?.suburb || 'Sandton',
              city: location?.city || 'Johannesburg',
            },
            rating: seller.storeStats?.rating || 4.8,
            reviewCount: seller.storeStats?.reviewCount || 0,
            storeType: seller.storeSetup?.type || 'retailer',
            deliveryModes:
              seller.storeSetup?.deliveryModes || ['pickup', 'local_delivery'],
            storeQualityScore: seller.storeStats?.qualityScore || 0.9,
          };

          setStoreInfo(store);
        } else {
          throw new Error(json.message || 'Failed to load store info');
        }
      } catch (err) {
        console.error('Error loading store info:', err);
        setError(err.message || 'Failed to load store information');
      } finally {
        setLoadingStore(false);
      }
    };

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/sellers/${storeId}/products`
        );

        if (!response.ok) {
          throw new Error('Failed to load products');
        }

        const json = await response.json();

        if (json.success) {
          setProducts(json.data || []);
        } else {
          throw new Error(json.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadStoreInfo();
    loadProducts();
  }, [location]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Container>
      <TopNavigation title="View Store" />
      <Content>
        <Header>
          <Title>Store preview</Title>
          <Subtitle>
            This is how shoppers see your store and products on Tsenga.
          </Subtitle>
        </Header>

        {error && (
          <ErrorState>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Something went wrong</div>
            <div>{error}</div>
          </ErrorState>
        )}

        <StoreSection>
          {loadingStore ? (
            <LoadingStoreCard>
              <SkeletonText width="60%" height={18} />
              <SkeletonText width="80%" height={14} />
            </LoadingStoreCard>
          ) : (
            storeInfo && <SellerCard seller={storeInfo} />
          )}
        </StoreSection>

        <StoreSection>
          <Subtitle style={{ fontWeight: 600 }}>Products in your store</Subtitle>

          {loadingProducts ? (
            <ProductsGrid>
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCard key={idx}>
                  <SkeletonText width="100%" height={80} />
                  <SkeletonText width="80%" height={14} />
                  <SkeletonText width="40%" height={12} />
                </ProductCard>
              ))}
            </ProductsGrid>
          ) : products && products.length > 0 ? (
            <ProductsGrid>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  as="button"
                  type="button"
                  style={{ cursor: 'pointer' }}
                >
                  <SkeletonText
                    as="div"
                    style={{
                      borderRadius: 12,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: product.imageUrl
                        ? `url(${product.imageUrl})`
                        : undefined,
                      backgroundColor: product.imageUrl ? 'transparent' : undefined,
                    }}
                    width="100%"
                    height={80}
                  />
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>
                    {product.price !== undefined
                      ? `R${Number(product.price).toFixed(2)}`
                      : 'Price on request'}
                  </ProductPrice>
                  {product.deliveryMode && (
                    <ProductMeta>{product.deliveryMode}</ProductMeta>
                  )}
                </ProductCard>
              ))}
            </ProductsGrid>
          ) : (
            <EmptyState>
              <EmptyIcon>🏪</EmptyIcon>
              <EmptyTitle>No products yet</EmptyTitle>
              <EmptyMessage>
                Add products in your Seller Dashboard to see them appear in your store
                preview.
              </EmptyMessage>
            </EmptyState>
          )}
        </StoreSection>
      </Content>
      <BottomNavigation currentPath="/seller/store" />
    </Container>
  );
};


