import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

const Page = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(241, 247, 255, 0.96) 0%, #ffffff 38%, rgba(243, 240, 254, 0.62) 100%);
  animation: ${fadeIn} 0.25s ease-in;
  padding-bottom: 112px;
`;

const Shell = styled.main`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(18px, 4vw, 42px) 0 48px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1180px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
  gap: clamp(18px, 4vw, 38px);
  align-items: stretch;
  margin-bottom: 22px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
  min-height: 390px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(20px, 4vw, 42px) 0;

  @media (max-width: 860px) {
    min-height: auto;
  }
`;

const Eyebrow = styled.div`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(61, 129, 239, 0.1);
  border: 1px solid rgba(61, 129, 239, 0.18);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 18px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  box-shadow: 0 0 0 5px rgba(61, 129, 239, 0.12);
`;

const Title = styled.h1`
  margin: 0;
  max-width: 760px;
  font-size: clamp(38px, 7vw, 74px);
  line-height: 0.97;
  font-weight: 950;
  color: #0d1c33;
`;

const Accent = styled.span`
  display: block;
  color: ${props => props.theme.colors.primary};
`;

const Lead = styled.p`
  max-width: 620px;
  margin: 20px 0 0;
  font-size: clamp(15px, 2vw, 19px);
  line-height: 1.58;
  color: ${props => props.theme.colors.text.secondary};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 28px;
  max-width: 720px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(228, 231, 236, 0.9);
  box-shadow: 0 14px 34px rgba(16, 24, 40, 0.06);
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 950;
  color: #0d1c33;
`;

const StatLabel = styled.div`
  margin-top: 3px;
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.secondary};
`;

const FeaturePanel = styled.aside`
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  padding: 18px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.42), rgba(196, 184, 252, 0.4), rgba(126, 193, 246, 0.3)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.13);

  @media (max-width: 520px) {
    border-radius: 24px;
    padding: 14px;
  }
`;

const FeaturedImage = styled.div`
  min-height: 250px;
  border-radius: 22px;
  overflow: hidden;
  background: ${props => props.theme.colors.gradient.soft};
  position: relative;

  img {
    width: 100%;
    height: 100%;
    min-height: 250px;
    object-fit: cover;
    display: block;
  }
`;

const ImageFallback = styled.div`
  min-height: 250px;
  display: grid;
  place-items: center;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 52px;
  font-weight: 950;
`;

const FeaturedBadge = styled.div`
  position: absolute;
  left: 14px;
  top: 14px;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: ${props => props.theme.colors.primary};
  font-size: 11px;
  font-weight: 950;
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.16);
`;

const FeaturedBody = styled.div`
  padding: 16px 4px 2px;
`;

const FeaturedTitle = styled.h2`
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.05;
  font-weight: 950;
  color: #0d1c33;
`;

const FeaturedMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const Pill = styled.span`
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: ${props => props.$primary ? props.theme.colors.gradient.soft : '#f8fafc'};
  border: 1px solid rgba(228, 231, 236, 0.9);
  color: ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
`;

const Toolbar = styled.section`
  position: sticky;
  top: 64px;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  margin-bottom: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(228, 231, 236, 0.86);
  box-shadow: 0 16px 42px rgba(16, 24, 40, 0.08);
  backdrop-filter: blur(18px);

  @media (max-width: 760px) {
    position: static;
    grid-template-columns: 1fr;
  }
`;

const RoomScroller = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const RoomButton = styled.button`
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.32)' : 'rgba(228, 231, 236, 0.9)'};
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: ${props => props.$active ? '0 14px 28px rgba(61, 129, 239, 0.24)' : 'none'};
`;

const SortSelect = styled.select`
  height: 40px;
  min-width: 170px;
  padding: 0 13px;
  border-radius: 999px;
  border: 1px solid rgba(228, 231, 236, 0.95);
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
  outline: none;

  @media (max-width: 760px) {
    width: 100%;
  }
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const BundleCard = styled.article`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.9);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 24px 52px rgba(16, 24, 40, 0.12);
  }
`;

const CardMedia = styled.button`
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1.18;
  border: none;
  padding: 0;
  background: ${props => props.theme.colors.gradient.soft};
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.32s ease;
  }

  ${BundleCard}:hover & img {
    transform: scale(1.04);
  }
`;

const CardBadge = styled.span`
  position: absolute;
  left: 12px;
  top: 12px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.93);
  color: ${props => props.theme.colors.primary};
  font-size: 11px;
  font-weight: 950;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.16);
`;

const CardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const CardKicker = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 8px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  line-height: 1.16;
  font-weight: 950;
  color: #0d1c33;
`;

const CardDescription = styled.p`
  margin: 9px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.5;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const IncludedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 14px 0;
`;

const IncludedItem = styled.span`
  padding: 6px 9px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 11px;
  font-weight: 900;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-top: auto;
  padding-top: 10px;
`;

const Price = styled.div`
  font-size: 22px;
  line-height: 1;
  font-weight: 950;
  color: #0d1c33;
`;

const OriginalPrice = styled.div`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
`;

const AddButton = styled.button`
  min-height: 42px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(61, 129, 239, 0.24);
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
  }
`;

const LoadMoreWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const LoadMoreButton = styled(AddButton)`
  min-height: 48px;
  padding: 0 22px;
`;

const StatePanel = styled.div`
  min-height: 300px;
  display: grid;
  place-items: center;
  text-align: center;
  border-radius: 26px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.9);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.06);
  padding: 30px;
`;

const StateTitle = styled.h2`
  margin: 0 0 8px;
  color: #0d1c33;
  font-size: 24px;
  font-weight: 950;
`;

const StateCopy = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 700;
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 104px;
  transform: translateX(-50%);
  z-index: 1200;
  max-width: min(420px, calc(100vw - 28px));
  padding: 12px 16px;
  border-radius: 999px;
  background: #0d1c33;
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(16, 24, 40, 0.24);
  font-size: 13px;
  font-weight: 900;
`;

const formatCurrency = (value) => `R${Number(value || 0).toLocaleString('en-ZA')}`;

const getLocationQuery = (location) => {
  if (!location) return '';
  const params = new URLSearchParams();
  if (location.lat) params.set('lat', location.lat);
  if (location.lng) params.set('lng', location.lng);
  if (location.suburb) params.set('suburb', location.suburb);
  return params.toString();
};

export const BundlesPage = ({ location }) => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false });
  const [room, setRoom] = useState('all');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const suburb = location?.suburb || 'your area';

  const roomOptions = useMemo(() => ([
    { id: 'all', label: 'All rooms', count: summary?.total || 0 },
    ...(summary?.rooms || []),
  ]), [summary]);

  const heroBundle = featured[0] || bundles[0];

  useEffect(() => {
    loadBundles(1, true);
  }, [room, sort, location?.lat, location?.lng, location?.suburb]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadBundles = async (page = 1, replace = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError('');

      const params = new URLSearchParams({
        limit: '9',
        page: String(page),
        sort,
      });
      if (room !== 'all') params.set('room', room);
      const locationQuery = getLocationQuery(location);
      if (locationQuery) {
        new URLSearchParams(locationQuery).forEach((value, key) => params.set(key, value));
      }

      const response = await fetch(`${API_BASE_URL}/products/bundles?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load bundles');
      }

      setBundles(prev => replace ? (data.data || []) : [...prev, ...(data.data || [])]);
      setFeatured(data.featured || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || { page, hasMore: false });
    } catch (err) {
      setError(err.message || 'Unable to load bundles');
      if (replace) setBundles([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleAddToCart = async (bundle) => {
    if (!bundle?.id) return;

    const cartItem = {
      ...bundle,
      quantity: 1,
      selectedVariant: null,
      addedAt: new Date().toISOString(),
    };

    try {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const existingIndex = cart.findIndex(item => item.id === bundle.id);

      if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('shopply_cart', JSON.stringify(cart));
      localStorage.setItem('shopply_cart_count', String(cart.reduce((sum, item) => sum + (item.quantity || 1), 0)));

      await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getCurrentUserId(),
          productId: bundle.id,
          quantity: 1,
          variant: null,
          storeId: bundle.storeId,
        }),
      }).catch(() => {});

      window.dispatchEvent(new Event('cartUpdated'));
      setToast(`${bundle.name} added to cart`);
    } catch {
      setToast('Could not add bundle to cart');
    }
  };

  const renderCard = (bundle) => (
    <BundleCard key={bundle.id}>
      <CardMedia type="button" onClick={() => navigate(`/product/${bundle.id}`)}>
        {bundle.image ? <img src={bundle.image} alt="" /> : <ImageFallback>B</ImageFallback>}
        <CardBadge>Save {bundle.savingsPercent || bundle.discount || 0}%</CardBadge>
      </CardMedia>
      <CardBody>
        <CardKicker>
          <span>{bundle.roomLabel || 'Curated room'}</span>
          <span>{bundle.deliveryPromise || 'Local delivery'}</span>
        </CardKicker>
        <CardTitle>{bundle.name}</CardTitle>
        <CardDescription>{bundle.description}</CardDescription>
        <IncludedList>
          {(bundle.includedItems || []).slice(0, 3).map(item => (
            <IncludedItem key={item}>{item}</IncludedItem>
          ))}
        </IncludedList>
        <PriceRow>
          <div>
            <Price>{formatCurrency(bundle.price)}</Price>
            {bundle.originalPrice && <OriginalPrice>{formatCurrency(bundle.originalPrice)}</OriginalPrice>}
          </div>
          <AddButton type="button" onClick={() => handleAddToCart(bundle)}>
            Add bundle
          </AddButton>
        </PriceRow>
      </CardBody>
    </BundleCard>
  );

  return (
    <Page>
      <TopNavigation
        location={location}
        title="Bundles"
        onSearchClick={() => navigate('/search')}
      />

      <Shell>
        <Hero>
          <HeroCopy>
            <Eyebrow><Dot /> Server-backed bundle catalog</Eyebrow>
            <Title>
              Bundles near you
              <Accent>for rooms that feel finished.</Accent>
            </Title>
            <Lead>
              Curated furniture sets from nearby sellers in {suburb}. Filter by room, compare real savings,
              and add the whole look to cart in one tap.
            </Lead>
            <StatGrid>
              <StatCard>
                <StatValue>{summary?.total || bundles.length}</StatValue>
                <StatLabel>available bundles</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{formatCurrency(summary?.highestSavings || 0)}</StatValue>
                <StatLabel>highest saving</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{summary?.averageSavingsPercent || 0}%</StatValue>
                <StatLabel>average saving</StatLabel>
              </StatCard>
            </StatGrid>
          </HeroCopy>

          <FeaturePanel>
            <FeaturedImage>
              {heroBundle?.image ? <img src={heroBundle.image} alt="" /> : <ImageFallback>B</ImageFallback>}
              <FeaturedBadge>Featured bundle</FeaturedBadge>
            </FeaturedImage>
            <FeaturedBody>
              <FeaturedTitle>{heroBundle?.name || 'Curated room bundles'}</FeaturedTitle>
              <FeaturedMeta>
                <Pill $primary>{heroBundle ? formatCurrency(heroBundle.price) : 'Live pricing'}</Pill>
                <Pill>{heroBundle?.roomLabel || 'All rooms'}</Pill>
                <Pill>Server availability</Pill>
              </FeaturedMeta>
            </FeaturedBody>
          </FeaturePanel>
        </Hero>

        <Toolbar>
          <RoomScroller>
            {roomOptions.map(option => (
              <RoomButton
                key={option.id}
                type="button"
                $active={room === option.id}
                onClick={() => setRoom(option.id)}
              >
                {option.label} {option.count ? `(${option.count})` : ''}
              </RoomButton>
            ))}
          </RoomScroller>
          <SortSelect value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured first</option>
            <option value="savings">Biggest savings</option>
            <option value="price-low">Lowest price</option>
            <option value="rating">Top rated</option>
          </SortSelect>
        </Toolbar>

        {loading ? (
          <StatePanel>
            <div>
              <StateTitle>Loading bundles</StateTitle>
              <StateCopy>Pulling live bundle pricing and availability from the server.</StateCopy>
            </div>
          </StatePanel>
        ) : error ? (
          <StatePanel>
            <div>
              <StateTitle>Bundles could not load</StateTitle>
              <StateCopy>{error}</StateCopy>
            </div>
          </StatePanel>
        ) : bundles.length === 0 ? (
          <StatePanel>
            <div>
              <StateTitle>No bundles found</StateTitle>
              <StateCopy>Try another room or check back for new curated sets near {suburb}.</StateCopy>
            </div>
          </StatePanel>
        ) : (
          <>
            <Grid>{bundles.map(renderCard)}</Grid>
            {pagination?.hasMore && (
              <LoadMoreWrap>
                <LoadMoreButton
                  type="button"
                  disabled={loadingMore}
                  onClick={() => loadBundles((pagination.page || 1) + 1, false)}
                >
                  {loadingMore ? 'Loading more...' : 'Load more bundles'}
                </LoadMoreButton>
              </LoadMoreWrap>
            )}
          </>
        )}
      </Shell>

      {toast && <Toast>{toast}</Toast>}
      <BottomNavigation currentPath="/bundles" />
    </Page>
  );
};
