import { useState, useEffect } from 'react';
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
    const savedLocation = localStorage.getItem('shopply_location');
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

  const loadCart = async () => {
    try {
      setLoading(true);
      
      // First, sync localStorage cart to backend
      const localCart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      if (localCart.length > 0) {
        // Sync each item to backend
        for (const item of localCart) {
          try {
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
            });
          } catch (error) {
            console.error('Error syncing item:', error);
          }
        }
      }
      
      // Then load cart from backend
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(`${API_BASE_URL}/cart?userId=default&location=${locationParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        // Update localStorage cart count
        localStorage.setItem('shopply_cart_count', (data.data.itemCount || 0).toString());
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to localStorage cart if backend fails
      const localCart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      if (localCart.length > 0) {
        // Create a mock cart structure from localStorage
        setCart({
          items: localCart.map(item => ({
            id: item.id || Date.now(),
            productId: item.id,
            product: item,
            quantity: item.quantity || 1,
            variant: item.selectedVariant || null,
            storeId: item.storeId,
            storeName: item.storeName,
          })),
          itemCount: localCart.reduce((sum, item) => sum + (item.quantity || 1), 0),
          totals: {
            itemsTotal: localCart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
            deliveryFee: 0,
            smallOrderFee: 0,
            serviceFee: 0,
            discount: 0,
            subtotal: 0,
            total: 0,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      // First update localStorage immediately for better UX
      const localCart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      
      // Find the item in the cart state
      let cartItem = null;
      const itemIdNum = typeof itemId === 'string' ? parseInt(itemId) : itemId;
      
      if (cart?.items) {
        cartItem = cart.items.find(item => item.id === itemIdNum || item.id === itemId);
      }
      
      if (!cartItem && cart?.storeGroups) {
        // Search through store groups
        for (const group of cart.storeGroups) {
          cartItem = group.items.find(item => item.id === itemIdNum || item.id === itemId);
          if (cartItem) break;
        }
      }

      if (!cartItem) {
        console.error('Item not found in cart', { itemId, itemIdNum, cartItems: cart?.items, storeGroups: cart?.storeGroups });
        // Try to update localStorage anyway and reload
        const updatedLocalCart = localCart.map(item => {
          if (item.id === itemIdNum || item.id === itemId) {
            return { ...item, quantity };
          }
          return item;
        });
        localStorage.setItem('shopply_cart', JSON.stringify(updatedLocalCart));
        const cartCount = updatedLocalCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        localStorage.setItem('shopply_cart_count', cartCount.toString());
        window.dispatchEvent(new Event('cartUpdated'));
        loadCart();
        return;
      }

      // Update localStorage
      const updatedLocalCart = localCart.map(item => {
        if (item.id === cartItem.productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(cartItem.variant)) {
          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem('shopply_cart', JSON.stringify(updatedLocalCart));
      
      // Update cart count
      const cartCount = updatedLocalCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('shopply_cart_count', cartCount.toString());
      
      // Dispatch event to update other components
      window.dispatchEvent(new Event('cartUpdated'));

      // Optimistically update UI immediately
      if (cart) {
        const updatedCart = { ...cart };
        if (updatedCart.items) {
          updatedCart.items = updatedCart.items.map(item => {
            if (item.id === itemId || item.id === parseInt(itemId)) {
              return { ...item, quantity };
            }
            return item;
          });
        }
        if (updatedCart.storeGroups) {
          updatedCart.storeGroups = updatedCart.storeGroups.map(group => ({
            ...group,
            items: group.items.map(item => {
              if (item.id === itemId || item.id === parseInt(itemId)) {
                return { ...item, quantity };
              }
              return item;
            }),
          }));
        }
        // Recalculate item count
        if (updatedCart.storeGroups) {
          updatedCart.itemCount = updatedCart.storeGroups.reduce((sum, group) => 
            sum + group.items.reduce((s, item) => s + (item.quantity || 1), 0), 0);
        } else if (updatedCart.items) {
          updatedCart.itemCount = updatedCart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
        setCart(updatedCart);
      }

      // Then sync with backend
      const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', quantity: parseInt(quantity) }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        // Reload cart to get correct state from backend
        loadCart();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        // Update localStorage cart count from backend response
        localStorage.setItem('shopply_cart_count', (data.data.itemCount || 0).toString());
      } else {
        // If backend fails, reload cart to sync
        loadCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Reload cart to sync state
      loadCart();
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}?userId=default`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        // Update localStorage cart count
        const cartCount = data.data.itemCount || 0;
        localStorage.setItem('shopply_cart_count', cartCount.toString());
        
        // Also update localStorage cart
        const localCart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
        const updatedCart = localCart.filter(item => item.id !== itemId);
        localStorage.setItem('shopply_cart', JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error('Error removing item:', error);
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
        <LoadingContainer>Loading cart...</LoadingContainer>
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

