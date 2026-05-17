import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { CheckoutHeader } from './CheckoutHeader';
import { OrderSummaryCard } from './OrderSummaryCard';
import { DeliveryAddressConfirmation } from './DeliveryAddressConfirmation';
import { DeliveryOptions } from './DeliveryOptions';
import { ContactInformation } from './ContactInformation';
import { OrderInstructions } from './OrderInstructions';
import { DiscountCodeInput } from './DiscountCodeInput';
import { FeeBreakdown } from './FeeBreakdown';
import { ReviewConfirmSection } from './ReviewConfirmSection';
import { PlaceOrderButton } from './PlaceOrderButton';
import { OrderConfirmation } from './OrderConfirmation';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 48%, #f8fafc 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 150px;
`;

const Content = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px min(5vw, 48px) 0;
`;

const Hero = styled.section`
  margin-bottom: 18px;
  padding: clamp(20px, 4vw, 34px);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(61, 129, 239, 0.14), rgba(255,255,255,0.98) 42%, rgba(245, 158, 11, 0.12)),
    #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  box-shadow:
    0 24px 68px rgba(16, 24, 40, 0.1),
    inset 0 1px 0 rgba(255,255,255,0.92);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(30px, 5vw, 52px);
  line-height: 0.98;
  font-weight: 900;
`;

const HeroCopy = styled.p`
  max-width: 640px;
  margin: 12px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.7;
  font-weight: 650;
`;

const TrustRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

const TrustPill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228, 231, 236, 0.9);
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 390px);
  gap: 22px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  min-width: 0;
`;

const SideColumn = styled.aside`
  position: sticky;
  top: 92px;
  min-width: 0;

  @media (max-width: 980px) {
    position: static;
  }
`;

const Notice = styled.div`
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background: ${props => props.$danger ? 'rgba(198, 40, 80, 0.08)' : props.theme.colors.primarySoftBg};
  border: 1px solid ${props => props.$danger ? 'rgba(198, 40, 80, 0.2)' : 'rgba(61, 129, 239, 0.18)'};
  color: ${props => props.$danger ? props.theme.colors.dangerBase : props.theme.colors.primarySoftText};
  font-size: 13px;
  font-weight: 800;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const EmptyTitle = styled.h2`
  margin: 0 0 8px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 26px;
  font-weight: 900;
`;

const EmptyCopy = styled.p`
  margin: 0 0 22px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 650;
`;

const ShopButton = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 16px 30px rgba(61, 129, 239, 0.22);
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
import { getCurrentUserId } from '../../utils/currentUser.js';

export const CheckoutPage = ({ location, onClose }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const cartSyncRef = useRef(null);
  const localCartUploadedRef = useRef(false);
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [deliverySpeed, setDeliverySpeed] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('seller_whatsapp');
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
  });
  const [orderInstructions, setOrderInstructions] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [voucherId, setVoucherId] = useState(null);
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    loadCart();
    loadDeliveryAddress();
    loadContactInfo();
    
    // Get voucherId from navigation state
    if (routerLocation.state?.voucherId) {
      setVoucherId(routerLocation.state.voucherId);
    }
  }, []);

  useEffect(() => {
    validateForm();
  }, [deliveryAddress, deliveryMethod, contactInfo.phone]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}&location=${locationParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        setDeliveryMethod(data.data.deliveryMethod || 'delivery');
        if ((data.data.itemCount || 0) === 0 && !localCartUploadedRef.current) {
          const localCart = readLocalCart();
          if (localCart.length > 0) {
            localCartUploadedRef.current = true;
            await uploadLocalCartOnce(localCart);
            return loadCart();
          }
        }

        setPaymentMethod('seller_whatsapp');
        setPromoCode(data.data.promoCode || '');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const readLocalCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      return Array.isArray(cart) ? cart.filter(item => item?.id) : [];
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
            userId: getCurrentUserId(),
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

  const loadDeliveryAddress = () => {
    const savedLocation = localStorage.getItem('shopply_location');
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        setDeliveryAddress({
          suburb: locationData.suburb,
          city: locationData.city,
          address: `${locationData.suburb}, ${locationData.city}`,
          lat: locationData.lat,
          lng: locationData.lng,
        });
      } catch (error) {
        console.error('Error parsing location:', error);
      }
    }
  };

  const loadContactInfo = () => {
    // Load saved contact info if available
    const savedPhone = localStorage.getItem('shopply_phone');
    const savedEmail = localStorage.getItem('shopply_email');
    if (savedPhone || savedEmail) {
      setContactInfo({
        phone: savedPhone || '',
        email: savedEmail || '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryAddress && deliveryMethod === 'delivery') {
      newErrors.deliveryAddress = 'Delivery address is required';
    }

    if (!contactInfo.phone || contactInfo.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    const hasItems = cart && (
      (cart.items && cart.items.length > 0) ||
      (cart.storeGroups && cart.storeGroups.length > 0) ||
      cart.itemCount > 0
    );
    setIsValid(Object.keys(newErrors).length === 0 && hasItems);
  };

  const handlePlaceOrder = async () => {
    if (!isValid) {
      return;
    }

    try {
      setPlacingOrder(true);
      setSubmitError('');
      // Create order
      const orderResponse = await fetch(`${API_BASE_URL}/checkout/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getCurrentUserId(),
          location: location,
          deliveryAddress: deliveryAddress,
          deliveryMethod: deliveryMethod,
          deliverySpeed: deliverySpeed,
          paymentMethod: 'seller_whatsapp',
          contactInfo: contactInfo,
          orderInstructions: orderInstructions || null,
          voucherId: voucherId || null,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      if (orderData.success) {
        const order = orderData.data;

        if (contactInfo.phone) {
          localStorage.setItem('shopply_phone', contactInfo.phone);
        }
        if (contactInfo.email) {
          localStorage.setItem('shopply_email', contactInfo.email);
        }

        localStorage.setItem('shopply_cart_count', '0');
        window.dispatchEvent(new Event('cartUpdated'));

        const firstHandoff = order.whatsappHandoff?.find(item => item.href) || order.whatsappHandoff?.[0];
        if (firstHandoff?.href) {
          window.open(firstHandoff.href, '_blank', 'noopener,noreferrer');
        } else {
          setSubmitError('Order created, but the seller WhatsApp number is unavailable. Please contact the seller from the product page.');
        }

        setOrderId(order.id);
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setSubmitError(error.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <CheckoutHeader onClose={onClose} />
        <Content>
          <Hero>
            <div>
              <Eyebrow>Secure checkout</Eyebrow>
              <Title>Preparing your order</Title>
              <HeroCopy>Checking cart stock, delivery windows, and seller availability.</HeroCopy>
            </div>
            <TrustRow>
              <TrustPill>Local sellers</TrustPill>
              <TrustPill>Protected checkout</TrustPill>
            </TrustRow>
          </Hero>
          <LoadingContainer>Loading checkout...</LoadingContainer>
        </Content>
      </Container>
    );
  }

  if (!cart || ((!cart.items || cart.items.length === 0) && (!cart.storeGroups || cart.storeGroups.length === 0))) {
    return (
      <Container>
        <CheckoutHeader onClose={onClose} />
        <Content>
          <EmptyState>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyCopy>Add a few beautiful pieces, then come back to checkout.</EmptyCopy>
            <ShopButton onClick={() => navigate('/search')}>Start shopping</ShopButton>
          </EmptyState>
        </Content>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <OrderConfirmation
        orderId={orderId}
        onContinueShopping={() => navigate('/')}
      />
    );
  }

  const baseTotals = cart.totals || {};
  const effectiveDeliveryFee = deliveryMethod === 'delivery'
    ? (baseTotals.deliveryFee || 0) + (deliverySpeed === 'express' ? 20 : 0)
    : 0;
  const effectiveTotals = {
    ...baseTotals,
    deliveryFee: effectiveDeliveryFee,
    subtotal: Number(((baseTotals.itemsTotal || 0) + effectiveDeliveryFee + (baseTotals.smallOrderFee || 0) + (baseTotals.serviceFee || 0)).toFixed(2)),
    total: Number(Math.max(0, (baseTotals.itemsTotal || 0) + effectiveDeliveryFee + (baseTotals.smallOrderFee || 0) + (baseTotals.serviceFee || 0) - (baseTotals.discount || 0)).toFixed(2)),
  };

  return (
    <Container>
      <CheckoutHeader onClose={onClose} />
      
      <Content>
        <Hero>
          <div>
            <Eyebrow>Shopply checkout</Eyebrow>
            <Title>Confirm the good stuff.</Title>
            <HeroCopy>
              Review delivery and contact details before your order is sent to each seller on WhatsApp.
            </HeroCopy>
          </div>
          <TrustRow>
            <TrustPill>{cart.itemCount || 0} item{cart.itemCount === 1 ? '' : 's'}</TrustPill>
            <TrustPill>{cart.storeGroups?.length || 1} seller{(cart.storeGroups?.length || 1) === 1 ? '' : 's'}</TrustPill>
            <TrustPill>{cart.storeGroups?.[0]?.eta || 'Today'}</TrustPill>
          </TrustRow>
        </Hero>

        {submitError && <Notice $danger>{submitError}</Notice>}
        {placingOrder && <Notice>Placing your order and confirming seller handoff...</Notice>}

        <CheckoutGrid>
          <MainColumn>
            <DeliveryAddressConfirmation
              address={deliveryAddress}
              onChange={() => navigate('/addresses')}
              error={errors.deliveryAddress}
            />

            <DeliveryOptions
              deliveryMethod={deliveryMethod}
              deliverySpeed={deliverySpeed}
              onDeliveryMethodChange={setDeliveryMethod}
              onDeliverySpeedChange={setDeliverySpeed}
              cart={cart}
              location={location}
            />

            <ContactInformation
              contactInfo={contactInfo}
              onContactInfoChange={setContactInfo}
              error={errors.phone}
            />

            <OrderInstructions
              instructions={orderInstructions}
              onInstructionsChange={setOrderInstructions}
            />
          </MainColumn>

          <SideColumn>
            <OrderSummaryCard cart={cart} />
            <DiscountCodeInput
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              cart={cart}
            />
            <FeeBreakdown totals={effectiveTotals} />
            <ReviewConfirmSection
              deliveryAddress={deliveryAddress}
              deliveryMethod={deliveryMethod}
              deliverySpeed={deliverySpeed}
              paymentMethod={paymentMethod}
              contactInfo={contactInfo}
              storeCount={cart.storeGroups?.length || 1}
              eta={cart.storeGroups?.[0]?.eta || 'Today, 4-6 PM'}
            />
          </SideColumn>
        </CheckoutGrid>
      </Content>
      
      <PlaceOrderButton
        total={effectiveTotals.total || 0}
        eta={cart.storeGroups?.[0]?.eta || 'Today, 4-6 PM'}
        isValid={isValid && !placingOrder}
        errors={errors}
        onPlaceOrder={placingOrder ? undefined : handlePlaceOrder}
      />
    </Container>
  );
};











