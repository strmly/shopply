import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { CartHeader } from './CartHeader';
import { DeliveryAddressSummary } from './DeliveryAddressSummary';
import { DeliveryETASummary } from './DeliveryETASummary';
import { StoreGrouping } from './StoreGrouping';
import { CartItemCard } from './CartItemCard';
import { OptimizationAlerts } from './OptimizationAlerts';
import { CartSummary } from './CartSummary';
import { PromoCodeInput } from './PromoCodeInput';
import { PaymentDeliverySelectors } from './PaymentDeliverySelectors';
import { CheckoutBar } from './CheckoutBar';
import { EmptyCartState } from './EmptyCartState';
import { BottomNavigation } from '../home/BottomNavigation';
import { VoucherSelector } from '../vouchers/VoucherSelector';
import { CartItemSkeleton } from '../ui/Skeleton';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 54%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 190px; /* Space for sticky checkout bar and bottom nav */
`;

const Content = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px min(5vw, 48px) 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 390px);
  gap: 24px;
  align-items: start;

  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const CartMain = styled.div`
  min-width: 0;
  display: grid;
  gap: 18px;
`;

const CartAside = styled.aside`
  position: sticky;
  top: 88px;
  display: grid;
  gap: 16px;

  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    position: static;
  }
`;

const DirectItems = styled.div`
  display: grid;
  gap: 14px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';

export const CartPage = ({ location, onClose }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const cartSyncRef = useRef(null);

  useEffect(() => {
    loadCart();
    loadDeliveryAddress();
    
    // Check if voucher was pre-selected from navigation state
    if (routerLocation.state?.selectedVoucherId) {
      setSelectedVoucherId(routerLocation.state.selectedVoucherId);
    }
    
    // Reload cart when window gains focus (in case cart was updated in another tab)
    const handleFocus = () => {
      loadCart();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [routerLocation.state]);

  const loadDeliveryAddress = () => {
    const savedLocation = localStorage.getItem('tsenga_location');
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        setDeliveryAddress({
          suburb: locationData.suburb,
          city: locationData.city,
          address: `${locationData.suburb}, ${locationData.city}`,
        });
      } catch (error) {
        console.error('Error parsing location:', error);
      }
    }
  };

  // After any backend cart mutation, rebuild localStorage from the server response
  // so the badge count and any future syncs stay accurate.
  const syncLocalFromCart = (cartData) => {
    const allItems = [
      ...(cartData.items || []),
      ...(cartData.storeGroups?.flatMap(g => g.items) || []),
    ];
    // Deduplicate by productId (storeGroups and items can overlap)
    const seen = new Set();
    const localCart = allItems
      .filter(item => {
        if (seen.has(item.productId)) return false;
        seen.add(item.productId);
        return true;
      })
      .map(item => ({
        id: item.productId,
        ...item.product,
        quantity: item.quantity,
        selectedVariant: item.variant || null,
        storeId: item.storeId,
        storeName: item.storeName,
      }));
    localStorage.setItem('tsenga_cart', JSON.stringify(localCart));
    localStorage.setItem('tsenga_cart_count', (cartData.itemCount || 0).toString());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const readLocalCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('tsenga_cart') || '[]');
      if (!Array.isArray(cart)) return [];

      const merged = new Map();
      cart.forEach(item => {
        if (!item?.id) return;
        const key = `${item.id}:${JSON.stringify(item.selectedVariant || null)}`;
        const existing = merged.get(key);
        if (existing) {
          existing.quantity += item.quantity || 1;
        } else {
          merged.set(key, { ...item, quantity: item.quantity || 1 });
        }
      });

      return Array.from(merged.values());
    } catch {
      return [];
    }
  };

  const uploadLocalCartOnce = (localCart) => {
    if (cartSyncRef.current) return cartSyncRef.current;

    cartSyncRef.current = (async () => {
      await fetch(`${API_BASE_URL}/cart?userId=default`, { method: 'DELETE' }).catch(() => {});

      for (const item of localCart) {
        await fetch(`${API_BASE_URL}/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'default',
            productId: item.id,
            quantity: item.quantity || 1,
            variant: item.selectedVariant || null,
            storeId: item.storeId,
          }),
        }).catch(() => {});
      }
    })().finally(() => {
      cartSyncRef.current = null;
    });

    return cartSyncRef.current;
  };

  const loadCart = async () => {
    try {
      setLoading(true);

      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const cartUrl = `${API_BASE_URL}/cart?userId=default&location=${locationParam}`;
      let response = await fetch(cartUrl);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      let data = await response.json();
      if (data.success) {
        const localCart = readLocalCart();

        if ((data.data.itemCount || 0) === 0 && localCart.length > 0) {
          await uploadLocalCartOnce(localCart);
          response = await fetch(cartUrl);
          data = await response.json();
        }

        setCart(data.data);
        syncLocalFromCart(data.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      const localCart = readLocalCart();
      if (localCart.length > 0) {
        const itemsTotal = localCart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        setCart({
          items: localCart.map(item => ({
            id: item.id,
            productId: item.id,
            product: item,
            quantity: item.quantity || 1,
            variant: item.selectedVariant || null,
            storeId: item.storeId,
            storeName: item.storeName,
          })),
          itemCount: localCart.reduce((sum, item) => sum + (item.quantity || 1), 0),
          totals: {
            itemsTotal,
            deliveryFee: 0,
            smallOrderFee: 0,
            serviceFee: 0,
            discount: 0,
            subtotal: itemsTotal,
            total: itemsTotal,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    // Optimistic UI update
    const applyQty = items => items.map(item =>
      (item.id === itemId || item.id === parseInt(itemId)) ? { ...item, quantity } : item
    );
    setCart(prev => prev ? {
      ...prev,
      items: prev.items ? applyQty(prev.items) : prev.items,
      storeGroups: prev.storeGroups
        ? prev.storeGroups.map(g => ({ ...g, items: applyQty(g.items) }))
        : prev.storeGroups,
    } : prev);

    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', quantity: parseInt(quantity) }),
      });

      if (!response.ok) { loadCart(); return; }

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        syncLocalFromCart(data.data);
      } else {
        loadCart();
      }
    } catch {
      loadCart();
    }
  };

  const handleRemoveItem = async (itemId) => {
    // Optimistic UI update
    const filterOut = items => items.filter(item =>
      item.id !== itemId && item.id !== parseInt(itemId)
    );
    setCart(prev => prev ? {
      ...prev,
      items: prev.items ? filterOut(prev.items) : prev.items,
      storeGroups: prev.storeGroups
        ? prev.storeGroups.map(g => ({ ...g, items: filterOut(g.items) })).filter(g => g.items.length > 0)
        : prev.storeGroups,
    } : prev);

    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}?userId=default`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        syncLocalFromCart(data.data);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      loadCart();
    }
  };

  const handleApplyPromo = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', code }),
      });
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error applying promo:', error);
      return { success: false, message: 'Failed to apply promo code' };
    }
  };

  const handleRemovePromo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/promo?userId=default`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error removing promo:', error);
    }
  };

  const handleSetDeliveryMethod = async (method) => {
    setDeliveryMethod(method);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/delivery-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', method }),
      });
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error setting delivery method:', error);
    }
  };

  const handleSetPaymentMethod = async (method) => {
    setPaymentMethod(method);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', method }),
      });
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error setting payment method:', error);
    }
  };

  const handleVoucherSelect = async (voucherId, discount) => {
    setSelectedVoucherId(voucherId);
    // Reload cart to get updated totals
    await loadCart();
  };

  const handleVoucherRemove = async () => {
    setSelectedVoucherId(null);
    // Reload cart to get updated totals
    await loadCart();
  };

  const handleCheckout = () => {
    navigate('/checkout', {
      state: { voucherId: selectedVoucherId }
    });
  };

  if (loading) {
    return (
      <Container>
        <CartHeader itemCount={0} onClose={onClose} />
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[0, 1, 2].map(i => <CartItemSkeleton key={i} />)}
        </div>
      </Container>
    );
  }

  const cartIsEmpty = !cart || ((!cart.items || cart.items.length === 0) && (!cart.storeGroups || cart.storeGroups.length === 0) && !cart.itemCount);
  if (cartIsEmpty) {
    return (
      <Container>
        <CartHeader itemCount={0} onClose={onClose} />
        <EmptyCartState onStartShopping={() => navigate('/')} />
        <BottomNavigation currentPath="/cart" />
      </Container>
    );
  }

  return (
    <Container>
      <CartHeader itemCount={cart.itemCount || cart.items.length} onClose={onClose} />
      
      <Content>
        <CartMain>
          <DeliveryAddressSummary
            address={deliveryAddress}
            onChange={() => console.log('Change address')}
          />

          <DeliveryETASummary
            cart={cart}
            deliveryMethod={deliveryMethod}
          />

          {cart.storeGroups && cart.storeGroups.length > 0 && cart.storeGroups.map((storeGroup, index) => (
            <StoreGrouping
              key={storeGroup.storeId || index}
              storeGroup={storeGroup}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              location={location}
            />
          ))}

          {(!cart.storeGroups || cart.storeGroups.length === 0) && cart.items && cart.items.length > 0 && (
            <DirectItems>
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </DirectItems>
          )}

          {cart.suggestions && cart.suggestions.length > 0 && (
            <OptimizationAlerts
              suggestions={cart.suggestions}
              onAction={(action, data) => console.log('Action:', action, data)}
            />
          )}
        </CartMain>

        <CartAside>
          <CartSummary totals={cart.totals} />

          <PromoCodeInput
            promoCode={cart.promoCode}
            onApply={handleApplyPromo}
            onRemove={handleRemovePromo}
          />

          <VoucherSelector
            selectedVoucherId={selectedVoucherId}
            onVoucherSelect={handleVoucherSelect}
            onVoucherRemove={handleVoucherRemove}
            cartTotal={cart.totals?.subtotal || 0}
          />

          <PaymentDeliverySelectors
            deliveryMethod={deliveryMethod}
            paymentMethod={paymentMethod}
            onDeliveryMethodChange={handleSetDeliveryMethod}
            onPaymentMethodChange={handleSetPaymentMethod}
          />
        </CartAside>
      </Content>
      
      <CheckoutBar
        total={cart.totals?.total || 0}
        eta={cart.storeGroups?.[0]?.eta || 'Today, 4-6 PM'}
        deliveryAddress={deliveryAddress}
        paymentMethod={paymentMethod}
        onCheckout={handleCheckout}
      />
      
      <BottomNavigation currentPath="/cart" />
    </Container>
  );
};

