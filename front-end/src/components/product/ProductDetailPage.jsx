import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductDetailHeader } from './ProductDetailHeader';
import { MediaGallery } from './MediaGallery';
import { ProductSummary } from './ProductSummary';
import { PricingBlock } from './PricingBlock';
import { HyperlocalAvailability } from './HyperlocalAvailability';
import { SellerModule } from './SellerModule';
import { VariantsSelector } from './VariantsSelector';
import { QuantitySelector } from './QuantitySelector';
import { AddToCartBar } from './AddToCartBar';
import { ProductDescription } from './ProductDescription';
import { ProductSpecs } from './ProductSpecs';
import { ProductReviews, LocalQA } from '../community';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';
import { RelatedProducts } from './RelatedProducts';
import { MultiStoreSelector } from './MultiStoreSelector';
import { ComplementaryEssentials } from './ComplementaryEssentials';
import { ProductDetailSkeleton } from '../ui/Skeleton';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 52%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px; /* Space for sticky bar */
`;

const Content = styled.div`
  max-width: 100%;
`;

const HeroSection = styled.section`
  max-width: 1180px;
  margin: 0 auto 24px;
  padding: 20px min(5vw, 48px) 0;
`;

const HeroShell = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  gap: 28px;
  align-items: start;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

const HeroInfo = styled.div`
  position: sticky;
  top: 86px;
  display: grid;
  gap: 18px;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    position: static;
  }
`;

const DetailSections = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 min(5vw, 48px);
  display: grid;
  gap: 18px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';
import { toast } from '../ui/Toast';
import { getCurrentUserId } from '../../utils/currentUser.js';

export const ProductDetailPage = ({ location }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get location from localStorage if not provided
  const [currentLocation, setCurrentLocation] = useState(location);
  
  useEffect(() => {
    if (!currentLocation) {
      const savedLocation = localStorage.getItem('shopply_location');
      if (savedLocation) {
        try {
          setCurrentLocation(JSON.parse(savedLocation));
        } catch (error) {
          console.error('Error parsing location:', error);
        }
      }
    }
  }, [currentLocation]);
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState([]);
  const [complementaryEssentials, setComplementaryEssentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreRelated, setLoadingMoreRelated] = useState(false);
  const [relatedPage, setRelatedPage] = useState(1);
  const [hasMoreRelated, setHasMoreRelated] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [availableStores, setAvailableStores] = useState([]);

  // Keep cartCount live by subscribing to cartUpdated events
  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    };
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  useEffect(() => {
    // Always scroll to top when product ID changes (instant scroll for better UX)
    window.scrollTo(0, 0);

    if (id) {
      loadProduct();
      loadRelatedProducts();
      loadFrequentlyBoughtTogether();
      loadComplementaryEssentials();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
        // Set default variant if available
        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedVariant(data.data.variants[0]);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (pageNum = 1, reset = true) => {
    if (!id) return;
    
    try {
      if (reset) {
        setRelatedPage(1);
      } else {
        setLoadingMoreRelated(true);
      }
      
      const response = await fetch(`${API_BASE_URL}/products/${id}/related?limit=4&page=${pageNum}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        if (reset) {
          setRelatedProducts(data.data || []);
        } else {
          setRelatedProducts(prev => [...prev, ...(data.data || [])]);
        }
        setHasMoreRelated(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
      if (reset) {
        setRelatedProducts([]);
      }
    } finally {
      setLoadingMoreRelated(false);
    }
  };

  const handleLoadMoreRelated = () => {
    const nextPage = relatedPage + 1;
    setRelatedPage(nextPage);
    loadRelatedProducts(nextPage, false);
  };

  const loadFrequentlyBoughtTogether = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/frequently-bought-together?limit=4`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setFrequentlyBoughtTogether(data.data || []);
      }
    } catch (error) {
      console.error('Error loading frequently bought together:', error);
      setFrequentlyBoughtTogether([]);
    }
  };

  const loadComplementaryEssentials = async () => {
    if (!id) return;
    
    try {
      // Use related products as complementary essentials for now
      // In production, this would be a separate endpoint with AI recommendations
      const response = await fetch(`${API_BASE_URL}/products/${id}/related?limit=6`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Filter out the current product by id, take up to 4
        const complementary = (data.data || [])
          .filter(p => String(p.id) !== String(id))
          .slice(0, 4);
        setComplementaryEssentials(complementary);
      }
    } catch (error) {
      console.error('Error loading complementary essentials:', error);
      setComplementaryEssentials([]);
    }
  };

  const loadAvailableStores = () => {
    if (!product) return;
    
    // Mock multi-store data (in production, this would come from backend)
    // For now, create variations of the same store with different prices/distances
    const stores = [
      {
        id: 1,
        name: product.storeName,
        price: product.price,
        distance: product.distance || 0.8,
        eta: '3-5 PM',
        stock: product.stock === 'in' ? 'In Stock' : 'Low Stock',
        pickupAvailable: true,
      },
      {
        id: 2,
        name: `${product.storeName} - Branch 2`,
        price: parseFloat((product.price * 1.05).toFixed(2)), // 5% more expensive
        distance: (product.distance || 0.8) + 0.6,
        eta: '4-6 PM',
        stock: 'In Stock',
        pickupAvailable: false,
      },
      {
        id: 3,
        name: 'Local Grocer',
        price: parseFloat((product.price * 1.1).toFixed(2)), // 10% more expensive
        distance: (product.distance || 0.8) + 0.9,
        eta: '5-7 PM',
        stock: 'In Stock',
        pickupAvailable: true,
      },
    ];
    
    setAvailableStores(stores);
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  };

  useEffect(() => {
    if (product) {
      loadAvailableStores();
    }
  }, [product]);

  const handleAddToCartClick = async () => {
    if (!product) return;

    const effectivePrice = product.flashDealPrice ?? product.price;
    const cartItem = {
      ...product,
      price: effectivePrice,
      selectedVariant,
      quantity,
      addedAt: new Date().toISOString(),
    };

    // Get existing cart
    const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
    
    // Check if item already exists
    const existingIndex = cart.findIndex(item =>
      String(item.id) === String(product.id) &&
      JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('shopply_cart', JSON.stringify(cart));
    
    // Update cart count (sum of all quantities)
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(cartCount);
    localStorage.setItem('shopply_cart_count', cartCount.toString());

    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.name} added to cart`);

    // Sync with backend (best-effort)
    fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: getCurrentUserId(),
        productId: product.id,
        quantity,
        variant: selectedVariant,
        storeId: product.storeId,
      }),
    }).catch(() => {});
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container>
        <ProductDetailHeader onBack={handleBack} cartCount={cartCount} />
        <ProductDetailSkeleton />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <ProductDetailHeader onBack={handleBack} cartCount={cartCount} />
        <LoadingContainer>Product not found</LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ProductDetailHeader 
        product={product}
        onBack={handleBack} 
        cartCount={cartCount}
      />
      
      <Content>
        <HeroSection>
          <HeroShell>
            <MediaGallery product={product} />

            <HeroInfo>
              <ProductSummary product={product} location={currentLocation} />

              <PricingBlock product={product} location={currentLocation} />

              <HyperlocalAvailability product={product} location={currentLocation} />

              {availableStores.length > 1 && (
                <MultiStoreSelector
                  stores={availableStores}
                  selectedStore={selectedStore}
                  onSelectStore={setSelectedStore}
                  location={currentLocation}
                />
              )}

              <SellerModule product={product} location={currentLocation} />

              {product.variants && product.variants.length > 0 && (
                <VariantsSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={setSelectedVariant}
                />
              )}

              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxQuantity={product.stockQuantity || 10}
                stock={product.stock}
                stockQuantity={product.stockQuantity}
              />
            </HeroInfo>
          </HeroShell>
        </HeroSection>

        <DetailSections>
          <ProductDescription product={product} />

          <ProductSpecs product={product} />

          <ProductReviews productId={product.id} location={currentLocation} />

          <LocalQA productId={product.id} location={currentLocation} />
        </DetailSections>
        
        {frequentlyBoughtTogether.length > 0 && (
          <FrequentlyBoughtTogether
            products={frequentlyBoughtTogether}
            mainProduct={product}
            onProductClick={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCartClick}
          />
        )}
        
        {complementaryEssentials.length > 0 && (
          <ComplementaryEssentials
            products={complementaryEssentials}
            mainProduct={product}
            location={currentLocation}
            onProductClick={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCartClick}
          />
        )}
        
        {relatedProducts.length > 0 && (
          <RelatedProducts
            products={relatedProducts}
            location={currentLocation}
            onProductClick={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCartClick}
            onLoadMore={handleLoadMoreRelated}
            hasMore={hasMoreRelated}
            loading={loadingMoreRelated}
          />
        )}
      </Content>
      
      <AddToCartBar
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onAddToCart={handleAddToCartClick}
        stock={product.stock}
        selectedStore={selectedStore}
      />
    </Container>
  );
};

