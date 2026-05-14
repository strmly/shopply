import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { Skeleton, SkeletonCard, SkeletonText } from '../../ui/Skeleton';
import { toast } from '../../ui/Toast';
import API_BASE_URL from '@config/api';

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 120px;
  background:
    radial-gradient(circle at top left, rgba(61, 129, 239, 0.14), transparent 36%),
    linear-gradient(180deg, #f7fbff 0%, #ffffff 38%, #f7f5ff 100%);
  animation: ${fadeIn} 0.28s ease-in;
`;

const Shell = styled.main`
  width: min(1220px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(18px, 3.6vw, 38px) 0 0;
  display: grid;
  gap: 16px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1220px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: clamp(18px, 3.4vw, 30px);
  border-radius: 28px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(241, 247, 255, 0.94)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.38), rgba(196, 184, 252, 0.4), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.11);
  animation: ${rise} 0.34s ease-out both;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const Badge = styled.div`
  width: fit-content;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 12px;
  font-weight: 950;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(34px, 6vw, 62px);
  line-height: 0.95;
  letter-spacing: 0;
  font-weight: 950;
`;

const Subtitle = styled.p`
  max-width: 650px;
  margin: 14px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: start;
  justify-content: flex-end;

  @media (max-width: 820px) {
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 16px 34px rgba(61, 129, 239, 0.24)' : '0 10px 24px rgba(16, 24, 40, 0.06)'};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.56;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1020px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatCard = styled.button`
  min-height: 104px;
  padding: 15px;
  border-radius: 22px;
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.36)' : 'rgba(228, 231, 236, 0.92)'};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : '#ffffff'};
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
  text-align: left;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(61, 129, 239, 0.28);
  }
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 26px;
  font-weight: 950;
  line-height: 1;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.25;
  font-weight: 850;
`;

const Toolbar = styled.section`
  padding: 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  backdrop-filter: blur(16px);
  display: grid;
  grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(150px, auto));
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const FieldLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
`;

const inputStyles = props => `
  width: 100%;
  min-height: 44px;
  padding: 0 13px;
  border: 1px solid ${props.theme.colors.border.default};
  border-radius: 16px;
  background: #ffffff;
  color: ${props.theme.colors.text.primary};
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  outline: none;
  transition: ${props.theme.transitions.swift};

  &:focus {
    border-color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props.theme.colors.primarySoftBg};
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

const Select = styled.select`
  ${inputStyles}
`;

const ProductGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
`;

const ProductCard = styled.article`
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  overflow: hidden;
  opacity: ${props => props.$hidden ? 0.62 : 1};
  animation: ${rise} 0.32s ease-out both;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 54px rgba(16, 24, 40, 0.1);
  }
`;

const ImageWrap = styled.button`
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 0;
  display: block;
  padding: 0;
  cursor: pointer;
  background: ${props => props.theme.colors.gradient.soft};
  position: relative;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: ${props => props.theme.colors.primary};
  font-weight: 950;
`;

const StatusPill = styled.span`
  position: absolute;
  left: 12px;
  top: 12px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${props => props.$tone === 'danger' ? props.theme.colors.warning[100] : props.theme.colors.primarySoftBg};
  color: ${props => props.$tone === 'danger' ? props.theme.colors.warningBase : props.theme.colors.primarySoftText};
  font-size: 11px;
  font-weight: 950;
`;

const CardBody = styled.div`
  padding: 16px;
  display: grid;
  gap: 12px;
`;

const ProductTitle = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 17px;
  line-height: 1.25;
  font-weight: 950;
  text-align: left;
  cursor: pointer;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.span`
  min-height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid rgba(61, 129, 239, 0.1);
  font-size: 11px;
  font-weight: 850;
`;

const InlineGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const MiniField = styled.label`
  display: grid;
  gap: 5px;
`;

const MiniInput = styled.input`
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 14px;
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 850;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primarySoftBg};
  }
`;

const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const IconButton = styled.button`
  min-height: 38px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid ${props => props.$danger ? 'rgba(245, 158, 11, 0.34)' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.$danger ? props.theme.colors.warningBase : props.theme.colors.primary};
  cursor: pointer;
  font-size: 12px;
  font-weight: 950;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.section`
  padding: clamp(28px, 6vw, 56px);
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 24px 54px rgba(16, 24, 40, 0.09);
  text-align: center;
`;

const EmptyTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 26px;
  font-weight: 950;
`;

const EmptyCopy = styled.p`
  max-width: 480px;
  margin: 10px auto 20px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.55;
  font-weight: 750;
`;

const ErrorBox = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: ${props => props.theme.colors.warningSoftBg};
  border: 1px solid rgba(245, 158, 11, 0.28);
  color: ${props => props.theme.colors.warningBase};
  font-size: 13px;
  font-weight: 850;
`;

const LoadMoreButton = styled(Button)`
  justify-self: center;
  min-width: 180px;
`;

const formatMoney = (value) => `R${Number(value || 0).toLocaleString('en-ZA', {
  maximumFractionDigits: 0,
})}`;

const getProductImage = (product) => product.image || product.coverImage || product.images?.[0] || null;

const getStockLabel = (product) => {
  if (product.trackInventory === false) return 'Unlimited stock';
  if (product.stock === 'out') return 'Out of stock';
  if (product.stock === 'low') return `${product.stockQuantity || 0} left`;
  return `${product.stockQuantity ?? 0} in stock`;
};

const getStockTone = (product) => (
  product.stock === 'out' || product.stock === 'low' ? 'danger' : 'default'
);

export const ProductListPage = ({ location }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStock, setFilterStock] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const sellerId = localStorage.getItem('sellerOnboardingId') || localStorage.getItem('sellerId') || '1';

  const loadStats = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products/stats`);
    const json = await response.json();
    if (response.ok && json.success) {
      setStats(json.data);
    }
  }, [sellerId]);

  const loadProducts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '18',
        sortBy,
      });

      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (filterStock !== 'all') params.append('stockStatus', filterStock);
      if (filterVisibility !== 'all') params.append('visibility', String(filterVisibility === 'visible'));

      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products?${params}`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Failed to load products (${response.status})`);
      }

      setProducts(prev => reset || pageNum === 1 ? (json.data || []) : [...prev, ...(json.data || [])]);
      setHasMore(Boolean(json.pagination?.hasMore));
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      if (pageNum === 1) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterStock, filterVisibility, searchQuery, sellerId, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts(1, true);
      loadStats().catch(() => {});
    }, 180);

    return () => clearTimeout(timeout);
  }, [loadProducts, loadStats]);

  const refresh = () => {
    loadProducts(1, true);
    loadStats().catch(() => {});
  };

  const updateProductLocally = (product) => {
    setProducts(prev => prev.map(item => String(item.id) === String(product.id) ? product : item));
  };

  const updateProduct = async (productId, updates, successMessage) => {
    try {
      setBusyId(productId);
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to update product');
      }

      updateProductLocally(json.data);
      loadStats().catch(() => {});
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisibility = async (product) => {
    try {
      setBusyId(product.id);
      const nextVisible = !product.isVisible;
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products/${product.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to update visibility');
      }

      updateProductLocally(json.data);
      loadStats().catch(() => {});
      toast.success(nextVisible ? 'Product published' : 'Product hidden');
    } catch (err) {
      toast.error(err.message || 'Failed to update visibility');
    } finally {
      setBusyId(null);
    }
  };

  const duplicateProduct = async (product) => {
    try {
      setBusyId(product.id);
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products/${product.id}/duplicate`, {
        method: 'POST',
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to duplicate product');
      }

      toast.success('Product duplicated');
      refresh();
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate product');
    } finally {
      setBusyId(null);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      setBusyId(product.id);
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products/${product.id}`, {
        method: 'DELETE',
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || json.success === false) {
        throw new Error(json.message || 'Failed to delete product');
      }

      setProducts(prev => prev.filter(item => String(item.id) !== String(product.id)));
      loadStats().catch(() => {});
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setBusyId(null);
    }
  };

  const savePrice = (product, value) => {
    const price = Number(value);
    if (!price || price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    updateProduct(product.id, { price }, 'Price updated');
  };

  const saveStock = (product, value) => {
    const stockQuantity = Math.max(0, Number(value) || 0);
    updateProduct(product.id, { stockQuantity }, 'Stock updated');
  };

  const visibleCount = stats?.visible ?? products.filter(product => product.isVisible).length;
  const hiddenCount = stats?.hidden ?? products.filter(product => !product.isVisible).length;
  const lowStockCount = stats?.lowStock ?? products.filter(product => product.stock === 'low').length;
  const outCount = stats?.outOfStock ?? products.filter(product => product.stock === 'out').length;

  const statItems = useMemo(() => ([
    { label: 'All products', value: stats?.total ?? products.length, filter: 'all', type: 'visibility' },
    { label: 'Visible', value: visibleCount, filter: 'visible', type: 'visibility' },
    { label: 'Hidden', value: hiddenCount, filter: 'hidden', type: 'visibility' },
    { label: 'Low stock', value: lowStockCount, filter: 'low', type: 'stock' },
    { label: 'Out of stock', value: outCount, filter: 'out', type: 'stock' },
  ]), [hiddenCount, lowStockCount, outCount, products.length, stats?.total, visibleCount]);

  const chooseStat = (item) => {
    if (item.type === 'visibility') {
      setFilterVisibility(item.filter);
      if (item.filter === 'all') setFilterStock('all');
    } else {
      setFilterStock(item.filter);
    }
  };

  return (
    <Page>
      <TopNavigation location={location} />

      <Shell>
        <Hero>
          <div>
            <Badge>Seller catalog</Badge>
            <Title>Products</Title>
            <Subtitle>
              Manage every Tsenga listing from one modern workspace: search, edit price, update stock, publish, duplicate, and retire products.
            </Subtitle>
          </div>
          <HeroActions>
            <Button type="button" onClick={() => navigate('/seller/dashboard')}>Dashboard</Button>
            <Button type="button" onClick={refresh}>Refresh</Button>
            <Button $primary type="button" onClick={() => navigate('/seller/products/new')}>Add product</Button>
          </HeroActions>
        </Hero>

        <StatsGrid>
          {statItems.map(item => (
            <StatCard
              key={`${item.type}-${item.filter}`}
              type="button"
              $active={(item.type === 'visibility' && filterVisibility === item.filter) || (item.type === 'stock' && filterStock === item.filter)}
              onClick={() => chooseStat(item)}
            >
              <StatValue>{item.value}</StatValue>
              <StatLabel>{item.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        <Toolbar>
          <Field>
            <FieldLabel>Search catalog</FieldLabel>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, SKU, category, tag"
            />
          </Field>
          <Field>
            <FieldLabel>Sort</FieldLabel>
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="best_sellers">Best sellers</option>
              <option value="low_stock">Low stock first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="category">Category</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Stock</FieldLabel>
            <Select value={filterStock} onChange={(event) => setFilterStock(event.target.value)}>
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <Select value={filterVisibility} onChange={(event) => setFilterVisibility(event.target.value)}>
              <option value="all">All products</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </Select>
          </Field>
        </Toolbar>

        {error && <ErrorBox>{error}</ErrorBox>}

        {loading && products.length === 0 ? (
          <ProductGrid>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} style={{ overflow: 'hidden', borderRadius: 24, display: 'flex', flexDirection: 'column' }}>
                <Skeleton $height="190px" $radius="0" />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <SkeletonText $size="small" $width="40%" />
                  <SkeletonText $size="large" $width="80%" />
                  <SkeletonText $width="55%" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <SkeletonText $size="large" $width="35%" />
                    <Skeleton $width="32px" $height="32px" $circle />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </ProductGrid>
        ) : products.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyCopy>
              Add a product or adjust your filters. Your seller catalog will appear here with quick controls for pricing, stock, visibility, and editing.
            </EmptyCopy>
            <Button $primary type="button" onClick={() => navigate('/seller/products/new')}>Add product</Button>
          </EmptyState>
        ) : (
          <>
            <ProductGrid>
              {products.map(product => {
                const image = getProductImage(product);
                const price = product.discountPrice ?? product.price;
                const disabled = busyId === product.id;

                return (
                  <ProductCard key={product.id} $hidden={!product.isVisible}>
                    <ImageWrap type="button" onClick={() => navigate(`/seller/products/${product.id}/edit`)}>
                      {image ? (
                        <ProductImage src={image} alt={product.name} />
                      ) : (
                        <Placeholder>Product image</Placeholder>
                      )}
                      <StatusPill $tone={getStockTone(product)}>{getStockLabel(product)}</StatusPill>
                    </ImageWrap>

                    <CardBody>
                      <div>
                        <ProductTitle type="button" onClick={() => navigate(`/seller/products/${product.id}/edit`)}>
                          {product.name}
                        </ProductTitle>
                        <Meta>
                          <Chip>{product.room || product.category || 'Furniture'}</Chip>
                          <Chip>{product.furnitureCategory || product.category || 'Product'}</Chip>
                          <Chip>{product.isVisible ? 'Visible' : 'Hidden'}</Chip>
                        </Meta>
                      </div>

                      <InlineGrid>
                        <MiniField>
                          <FieldLabel>Price</FieldLabel>
                          <MiniInput
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={price || 0}
                            onBlur={(event) => {
                              if (Number(event.target.value) !== Number(price || 0)) {
                                savePrice(product, event.target.value);
                              }
                            }}
                            disabled={disabled}
                          />
                        </MiniField>
                        <MiniField>
                          <FieldLabel>Stock</FieldLabel>
                          <MiniInput
                            type="number"
                            min="0"
                            defaultValue={product.stockQuantity ?? 0}
                            onBlur={(event) => {
                              if (Number(event.target.value) !== Number(product.stockQuantity ?? 0)) {
                                saveStock(product, event.target.value);
                              }
                            }}
                            disabled={disabled || product.trackInventory === false}
                          />
                        </MiniField>
                      </InlineGrid>

                      <CardActions>
                        <IconButton $primary type="button" onClick={() => navigate(`/seller/products/${product.id}/edit`)}>Edit</IconButton>
                        <IconButton type="button" onClick={() => toggleVisibility(product)} disabled={disabled}>
                          {product.isVisible ? 'Hide' : 'Publish'}
                        </IconButton>
                        <IconButton type="button" onClick={() => duplicateProduct(product)} disabled={disabled}>Duplicate</IconButton>
                        <IconButton $danger type="button" onClick={() => deleteProduct(product)} disabled={disabled}>Delete</IconButton>
                      </CardActions>
                    </CardBody>
                  </ProductCard>
                );
              })}
            </ProductGrid>

            {hasMore && (
              <LoadMoreButton $primary type="button" onClick={() => loadProducts(page + 1, false)} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load more products'}
              </LoadMoreButton>
            )}
          </>
        )}
      </Shell>

      <BottomNavigation currentPath="/seller/products" />
    </Page>
  );
};
