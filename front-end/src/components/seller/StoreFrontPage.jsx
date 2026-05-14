import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { ProductCard } from '../home/ProductCard';
import { SkeletonCard, SkeletonText } from '../ui/Skeleton';
import API_BASE_URL from '@config/api';

const Page = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 46%, #f8fafc 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Shell = styled.main`
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px min(5vw, 48px) 0;
  display: grid;
  gap: 22px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: clamp(22px, 4vw, 38px);
  background:
    linear-gradient(135deg, rgba(61, 129, 239, 0.13), rgba(255,255,255,0.96) 42%, rgba(245, 158, 11, 0.12)),
    #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  box-shadow:
    0 24px 68px rgba(16, 24, 40, 0.11),
    inset 0 1px 0 rgba(255,255,255,0.92);
`;

const HeroGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: end;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

const Identity = styled.div`
  display: grid;
  gap: 14px;
`;

const LogoRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const Logo = styled.div`
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 28px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.24);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(30px, 5vw, 54px);
  line-height: 0.98;
  font-weight: 900;
`;

const Copy = styled.p`
  max-width: 680px;
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.7;
  font-weight: 600;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(228, 231, 236, 0.9);
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$whatsapp || props.$primary ? 'transparent' : 'rgba(228, 231, 236, 0.9)'};
  background: ${props => {
    if (props.$whatsapp) return '#128c7e';
    if (props.$primary) return props.theme.colors.gradient.primary;
    return '#ffffff';
  }};
  color: ${props => props.$whatsapp || props.$primary ? '#ffffff' : props.theme.colors.text.primary};
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  box-shadow: ${props => {
    if (props.$whatsapp) return '0 16px 30px rgba(18, 140, 126, 0.24)';
    if (props.$primary) return '0 16px 30px rgba(61,129,239,0.22)';
    return '0 12px 24px rgba(16,24,40,0.07)';
  }};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
    background: ${props => props.$whatsapp ? '#075e54' : undefined};
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatCard = styled.div`
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  box-shadow: 0 16px 34px rgba(16, 24, 40, 0.07);
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 22px;
  font-weight: 900;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
  margin-top: 4px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 900;
`;

const SectionCopy = styled.p`
  margin: 5px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 700;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1040px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 430px) {
    gap: 12px;
  }
`;

const EmptyState = styled.div`
  padding: 34px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px dashed rgba(148, 163, 184, 0.5);
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  font-weight: 800;
`;

const ErrorState = styled(EmptyState)`
  color: ${props => props.theme.colors.dangerBase};
  border-color: rgba(198, 40, 80, 0.32);
`;

const formatAddress = (address, fallbackLocation) => {
  const suburb = address?.suburb || fallbackLocation?.suburb || 'Sandton';
  const city = address?.city || fallbackLocation?.city || 'Johannesburg';
  return [suburb, city].filter(Boolean).join(', ');
};

const normalizeWhatsAppNumber = (value = '') => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `27${digits.slice(1)}`;
  if (digits.length === 9) digits = `27${digits}`;
  return digits;
};

const buildWhatsAppUrl = (store) => {
  const number = normalizeWhatsAppNumber(store?.whatsappNumber || store?.phone);
  if (!number) return '';
  const message = `Hi ${store.name}, I found your store on Tsenga and would like to ask about your products.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const StoreFrontPage = ({ location }) => {
  const navigate = useNavigate();
  const params = useParams();
  const isPublicStore = Boolean(params.storeId);
  const storeId = params.storeId || localStorage.getItem('sellerStoreId') || localStorage.getItem('sellerOnboardingId') || '1';

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadStorefront = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/stores/${storeId}`);
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || 'Failed to load store');
        }

        if (!active) return;
        setStore(json.data.store);
        setProducts(json.data.products || []);
        setStats(json.data.stats || null);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load store');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStorefront();
    return () => {
      active = false;
    };
  }, [storeId]);

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(store), [store]);
  const address = formatAddress(store?.address, location);
  const initials = (store?.name || 'Tsenga Store').trim().slice(0, 1).toUpperCase();

  return (
    <Page>
      <TopNavigation location={location} title={isPublicStore ? 'View Store' : 'Store preview'} />
      <Shell>
        {loading ? (
          <>
            <SkeletonCard style={{ minHeight: 260, borderRadius: 28 }}>
              <SkeletonText $size="large" $width="44%" />
              <SkeletonText $size="large" $width="70%" />
              <SkeletonText $width="52%" />
            </SkeletonCard>
            <ProductGrid>
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} style={{ minHeight: 260, borderRadius: 24 }} />
              ))}
            </ProductGrid>
          </>
        ) : error ? (
          <ErrorState>{error}</ErrorState>
        ) : (
          <>
            <Hero>
              <HeroGrid>
                <Identity>
                  <LogoRow>
                    <Logo>
                      {store.logo ? <img src={store.logo} alt="" /> : initials}
                    </Logo>
                    <div>
                      <Eyebrow>{store.verificationStatus === 'verified_partner' ? 'Verified partner' : 'Verified store'}</Eyebrow>
                      <Title>{store.name}</Title>
                    </div>
                  </LogoRow>
                  <Copy>{store.description}</Copy>
                  <MetaRow>
                    <Pill>{address}</Pill>
                    <Pill>{store.storeType || 'retailer'}</Pill>
                    <Pill>{store.pickupAvailable ? 'Pickup available' : 'Delivery available'}</Pill>
                    <Pill>Replies in {store.responseMinutes || 30} min</Pill>
                  </MetaRow>
                </Identity>

                <Actions>
                  <Button type="button" onClick={() => navigate('/search')}>Search more</Button>
                  <Button
                    as="a"
                    href={whatsappUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    $whatsapp
                    disabled={!whatsappUrl}
                  >
                    WhatsApp store
                  </Button>
                </Actions>
              </HeroGrid>
            </Hero>

            <StatGrid>
              <StatCard>
                <StatValue>{stats?.productCount || products.length}</StatValue>
                <StatLabel>Listed products</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats?.inStockCount || 0}</StatValue>
                <StatLabel>Ready now</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{Number(stats?.averageRating || store.rating || 0).toFixed(1)}</StatValue>
                <StatLabel>Store rating</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats?.reviewCount || store.reviewCount || 0}</StatValue>
                <StatLabel>Reviews</StatLabel>
              </StatCard>
            </StatGrid>

            <section>
              <SectionHead>
                <div>
                  <SectionTitle>Products from {store.name}</SectionTitle>
                  <SectionCopy>Browse the store catalog, add pieces to cart, or open a product for full details.</SectionCopy>
                </div>
              </SectionHead>
            </section>

            {products.length > 0 ? (
              <ProductGrid>
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </ProductGrid>
            ) : (
              <EmptyState>
                This store has no visible products yet.
              </EmptyState>
            )}
          </>
        )}
      </Shell>
      <BottomNavigation currentPath={isPublicStore ? '/search' : '/seller/store'} />
    </Page>
  );
};
