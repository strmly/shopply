import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { toast } from '../ui/Toast';
import API_BASE_URL from '@config/api';

/* ─── Animations ─────────────────────────────────────────── */
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
`;

/* ─── Page Shell ──────────────────────────────────────────── */
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 54%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

/* ─── Hero ────────────────────────────────────────────────── */
const Hero = styled.section`
  max-width: 1180px;
  margin: 24px auto 28px;
  padding: 0 min(5vw, 48px);
`;

const HeroPanel = styled.div`
  position: relative;
  overflow: hidden;
  padding: 30px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(254,247,227,0.9) 100%) padding-box,
    linear-gradient(140deg, rgba(245,158,11,0.24), rgba(61,129,239,0.16), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16,24,40,0.1);
  display: grid;
  grid-template-columns: auto minmax(0,1fr) auto;
  gap: 22px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const HeroIcon = styled.div`
  width: 82px;
  height: 82px;
  border-radius: 26px;
  background: ${p => p.theme.colors.warning[100]};
  border: 1px solid rgba(245,158,11,0.2);
  color: ${p => p.theme.colors.warning[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(16,24,40,0.12);
`;

const Eyebrow = styled.div`
  width: fit-content;
  ${p => p.theme.typography.caption}
  color: ${p => p.theme.colors.warning[600]};
  background: ${p => p.theme.colors.warning[100]};
  border: 1px solid rgba(245,158,11,0.18);
  border-radius: 999px;
  padding: 7px 11px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const HeroTitle = styled.h1`
  color: ${p => p.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 0.98;
  font-weight: 900;
`;

const HeroSub = styled.p`
  ${p => p.theme.typography.body1}
  color: ${p => p.theme.colors.text.secondary};
  margin: 12px 0 0;
  font-weight: 500;
  max-width: 560px;
`;

const CountCard = styled.div`
  min-width: 150px;
  padding: 16px;
  border-radius: 22px;
  background: ${p => p.theme.colors.gradient.soft};
  border: 1px solid ${p => p.theme.colors.border.default};
  text-align: center;
`;

const CountValue = styled.div`
  color: ${p => p.theme.colors.text.primary};
  font-size: 30px;
  line-height: 1;
  font-weight: 900;
`;

const CountLabel = styled.div`
  ${p => p.theme.typography.caption}
  color: ${p => p.theme.colors.text.secondary};
  font-weight: 800;
  margin-top: 5px;
`;

/* ─── Grid ────────────────────────────────────────────────── */
const Grid = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 min(5vw, 48px) 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

/* ─── Deal Card ───────────────────────────────────────────── */
const Card = styled.div`
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(245,158,11,0.2), rgba(61,129,239,0.14), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(16,24,40,0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 26px 54px rgba(16,24,40,0.13);
  }
`;

const ImageWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: ${p => p.theme.colors.gradient.soft};
  overflow: hidden;
`;

const ProductImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${Card}:hover & {
    transform: scale(1.04);
  }
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 900;
  color: ${p => p.theme.colors.primarySoftText};
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${p => p.theme.colors.dangerBase};
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  border-radius: 999px;
  padding: 5px 10px;
  letter-spacing: -0.3px;
`;

const UrgentDot = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$urgent ? p.theme.colors.dangerBase : p.theme.colors.warning[500]};
  box-shadow: 0 0 0 3px ${p => p.$urgent ? 'rgba(220,38,38,0.25)' : 'rgba(245,158,11,0.25)'};
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

const Body = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const ProductName = styled.div`
  ${p => p.theme.typography.body2}
  color: ${p => p.theme.colors.text.primary};
  font-weight: 900;
  font-size: 15px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
`;

const FlashPrice = styled.span`
  font-size: 22px;
  font-weight: 900;
  color: ${p => p.theme.colors.text.primary};
  line-height: 1;
`;

const OrigPrice = styled.span`
  ${p => p.theme.typography.body2}
  color: ${p => p.theme.colors.text.tertiary};
  text-decoration: line-through;
  font-weight: 600;
`;

const SaveBadge = styled.span`
  ${p => p.theme.typography.caption}
  background: ${p => p.theme.colors.danger[100]};
  color: ${p => p.theme.colors.dangerBase};
  border-radius: 999px;
  padding: 4px 8px;
  font-weight: 900;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Countdown = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  ${p => p.theme.typography.caption}
  font-weight: 900;
  color: ${p => p.$urgent ? p.theme.colors.dangerBase : p.theme.colors.warning[600]};
  background: ${p => p.$urgent ? p.theme.colors.danger[100] : p.theme.colors.warning[100]};
  border-radius: 999px;
  padding: 5px 9px;
  white-space: nowrap;
`;

const StockCount = styled.div`
  ${p => p.theme.typography.caption}
  color: ${p => p.theme.colors.text.secondary};
  font-weight: 800;
  white-space: nowrap;
`;

const AddBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: ${p => p.theme.colors.text.primary};
  color: ${p => p.theme.colors.text.inverse};
  border: none;
  border-radius: 14px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease;
  margin-top: auto;

  &:hover {
    background: ${p => p.theme.colors.gradient.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${p => p.theme.colors.neutral[300]};
    cursor: not-allowed;
    transform: none;
  }
`;

/* ─── Empty / Loading States ──────────────────────────────── */
const CenterState = styled.div`
  max-width: 480px;
  margin: 48px auto;
  padding: 36px 24px;
  text-align: center;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(245,158,11,0.2), rgba(61,129,239,0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16,24,40,0.08);
`;

const StateIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 22px;
  background: ${p => p.theme.colors.warning[100]};
  color: ${p => p.theme.colors.warning[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
`;

const StateTitle = styled.h2`
  color: ${p => p.theme.colors.text.primary};
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 900;
`;

const StateMessage = styled.p`
  ${p => p.theme.typography.body1}
  color: ${p => p.theme.colors.text.secondary};
  margin: 0;
`;

/* ─── Countdown Hook ──────────────────────────────────────── */
function useCountdown(endDate) {
  const calc = () => {
    const diff = endDate ? new Date(endDate) - Date.now() : 0;
    if (diff <= 0) return { h: 0, m: 0, s: 0, total: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      total: diff,
    };
  };

  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!endDate) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return time;
}

/* ─── Single Deal Card ────────────────────────────────────── */
function DealCard({ product, onProductClick, onAddToCart }) {
  const [imgErr, setImgErr] = useState(false);
  const [adding, setAdding] = useState(false);

  const flashPrice = product.flashDealPrice ?? product.price;
  const origPrice  = product.price ?? product.originalPrice;
  const discount   = product.flashDeal?.discountValue;
  const remaining  = product.flashDeal?.remaining;
  const endDate    = product.flashDeal?.endDate;

  const { h, m, s, total } = useCountdown(endDate);
  const isUrgent = total > 0 && total < 2 * 3600 * 1000;
  const expired  = total <= 0;

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = expired ? 'Expired' : `${pad(h)}:${pad(m)}:${pad(s)}`;
  const savings = origPrice - flashPrice;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (adding || expired) return;
    setAdding(true);
    await onAddToCart(product);
    setAdding(false);
  };

  return (
    <Card onClick={() => onProductClick(product)}>
      <ImageWrap>
        {product.image && !imgErr
          ? <ProductImg src={product.image} alt={product.name} onError={() => setImgErr(true)} loading="lazy" />
          : <ImgPlaceholder>S</ImgPlaceholder>
        }
        {discount && <DiscountBadge>-{discount}%</DiscountBadge>}
        {endDate && <UrgentDot $urgent={isUrgent} />}
      </ImageWrap>

      <Body>
        <ProductName>{product.name}</ProductName>

        <PriceRow>
          <FlashPrice>R{flashPrice.toFixed(2)}</FlashPrice>
          {origPrice > flashPrice && (
            <>
              <OrigPrice>R{origPrice.toFixed(2)}</OrigPrice>
              <SaveBadge>Save R{savings.toFixed(0)}</SaveBadge>
            </>
          )}
        </PriceRow>

        <MetaRow>
          {endDate && (
            <Countdown $urgent={isUrgent}>
              ⏱ {expired ? 'Expired' : `Ends ${timeStr}`}
            </Countdown>
          )}
          {remaining != null && (
            <StockCount>{remaining} left</StockCount>
          )}
        </MetaRow>

        <AddBtn
          onClick={handleAdd}
          disabled={adding || expired}
        >
          {expired ? 'Deal ended' : adding ? 'Adding…' : 'Add to cart'}
        </AddBtn>
      </Body>
    </Card>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export const FlashDealsPage = ({ location }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await fetch(`${API_BASE_URL}/products/flash-deals?limit=60`);
        const data = await res.json();
        if (data.success) setProducts(data.data || []);
      } catch (err) {
        console.error('Error loading flash deals:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProductClick = (product) => navigate(`/product/${product.id}`);

  const handleAddToCart = async (product) => {
    if (!product?.id) return;

    // Use flash deal price, not original price
    const flashPrice = product.flashDealPrice ?? product.price;
    const cartItem = {
      ...product,
      price: flashPrice,
      originalPrice: product.price,
      quantity: 1,
      selectedVariant: null,
      addedAt: new Date().toISOString(),
    };

    const cart = JSON.parse(localStorage.getItem('tsenga_cart') || '[]');
    const idx  = cart.findIndex(i => i.id === product.id && JSON.stringify(i.selectedVariant) === 'null');

    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('tsenga_cart', JSON.stringify(cart));
    localStorage.setItem('tsenga_cart_count', cart.reduce((s, i) => s + (i.quantity || 1), 0).toString());
    window.dispatchEvent(new Event('cartUpdated'));

    // Sync to backend
    fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'default',
        productId: product.id,
        quantity: 1,
        variant: null,
        storeId: product.storeId,
      }),
    }).catch(() => {});

    toast.success(`${product.name} added to cart`);
  };

  const nav = (
    <TopNavigation
      location={location}
      onLocationClick={() => {}}
      onSearch={() => navigate('/search')}
      onNotificationClick={() => navigate('/')}
      onSearchClick={() => navigate('/search')}
    />
  );

  if (loading) {
    return (
      <Container>
        {nav}
        <CenterState>
          <StateIcon>⏱</StateIcon>
          <StateTitle>Loading deals</StateTitle>
          <StateMessage>Finding limited offers from local stores.</StateMessage>
        </CenterState>
        <BottomNavigation currentPath="/deals" />
      </Container>
    );
  }

  const activeDeals = products.filter(p => {
    if (!p.flashDeal?.endDate) return true;
    return new Date(p.flashDeal.endDate) > Date.now();
  });

  return (
    <Container>
      {nav}

      <Hero>
        <HeroPanel>
          <HeroIcon>⚡</HeroIcon>
          <div>
            <Eyebrow>Limited time only</Eyebrow>
            <HeroTitle>Flash Deals</HeroTitle>
            <HeroSub>Discounted furniture from local stores — ticking clocks, real savings.</HeroSub>
          </div>
          <CountCard>
            <CountValue>{activeDeals.length}</CountValue>
            <CountLabel>{activeDeals.length === 1 ? 'deal' : 'deals'} live now</CountLabel>
          </CountCard>
        </HeroPanel>
      </Hero>

      {activeDeals.length === 0 ? (
        <CenterState>
          <StateIcon>⏱</StateIcon>
          <StateTitle>No active deals</StateTitle>
          <StateMessage>Check back soon for limited-time offers from local stores.</StateMessage>
        </CenterState>
      ) : (
        <Grid>
          {activeDeals.map((product, i) => (
            <DealCard
              key={product.id ?? i}
              product={product}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          ))}
        </Grid>
      )}

      <BottomNavigation currentPath="/deals" />
    </Container>
  );
};
