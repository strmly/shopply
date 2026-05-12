import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { CheckoutHeader } from './CheckoutHeader';
import { OrderSummaryCard } from './OrderSummaryCard';
import { DeliveryAddressConfirmation } from './DeliveryAddressConfirmation';
import { DeliveryOptions } from './DeliveryOptions';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { ContactInformation } from './ContactInformation';
import { OrderInstructions } from './OrderInstructions';
import { DiscountCodeInput } from './DiscountCodeInput';
import { FeeBreakdown } from './FeeBreakdown';
import { ReviewConfirmSection } from './ReviewConfirmSection';
import { PlaceOrderButton } from './PlaceOrderButton';
import { OrderConfirmation } from './OrderConfirmation';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 120px; /* Space for sticky button */
`;

const Content = styled.div`
  max-width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
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

export const CheckoutPage = ({ location, onClose }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [deliverySpeed, setDeliverySpeed] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState(null);
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
  }, [deliveryAddress, deliveryMethod, paymentMethod, contactInfo.phone]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const userId = 'default';
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}&location=${locationParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        setDeliveryMethod(data.data.deliveryMethod || 'delivery');
        setPaymentMethod(data.data.paymentMethod);
        setPromoCode(data.data.promoCode || '');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryAddress = () => {
    const savedLocation = localStorage.getItem('tsenga_location');
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
    const savedPhone = localStorage.getItem('tsenga_phone');
    const savedEmail = localStorage.getItem('tsenga_email');
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

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
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
      // Create order
      const orderResponse = await fetch(`${API_BASE_URL}/checkout/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default',
          location: location,
          deliveryAddress: deliveryAddress,
          deliveryMethod: deliveryMethod,
          deliverySpeed: deliverySpeed,
          paymentMethod: paymentMethod,
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

        // Process payment
        try {
          const paymentResponse = await fetch(`${API_BASE_URL}/checkout/order/${order.id}/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentDetails: {
                method: paymentMethod,
              },
            }),
          });

          if (!paymentResponse.ok) {
            throw new Error('Payment processing failed');
          }

          const paymentData = await paymentResponse.json();
          if (paymentData.success) {
            // Save contact info
            if (contactInfo.phone) {
              localStorage.setItem('tsenga_phone', contactInfo.phone);
            }
            if (contactInfo.email) {
              localStorage.setItem('tsenga_email', contactInfo.email);
            }

            // Clear cart count
            localStorage.setItem('tsenga_cart_count', '0');
            window.dispatchEvent(new Event('cartUpdated'));

            setOrderId(order.id);
            setOrderPlaced(true);
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          alert('Order created but payment failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Container>
        <CheckoutHeader onClose={onClose} />
        <LoadingContainer>Loading checkout...</LoadingContainer>
      </Container>
    );
  }

  if (!cart || ((!cart.items || cart.items.length === 0) && (!cart.storeGroups || cart.storeGroups.length === 0))) {
    return (
      <Container>
        <CheckoutHeader onClose={onClose} />
        <Content>
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ marginBottom: '24px', color: '#666' }}>Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Start Shopping
            </button>
          </div>
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

  return (
    <Container>
      <CheckoutHeader onClose={onClose} />
      
      <Content>
        <OrderSummaryCard cart={cart} />
        
        <DeliveryAddressConfirmation
          address={deliveryAddress}
          onChange={() => navigate('/')} // Navigate to address selection
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
        
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          error={errors.paymentMethod}
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
        
        <DiscountCodeInput
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          cart={cart}
        />
        
        <FeeBreakdown totals={cart.totals} />
        
        <ReviewConfirmSection
          deliveryAddress={deliveryAddress}
          deliveryMethod={deliveryMethod}
          deliverySpeed={deliverySpeed}
          paymentMethod={paymentMethod}
          contactInfo={contactInfo}
          storeCount={cart.storeGroups?.length || 1}
          eta={cart.storeGroups?.[0]?.eta || 'Today, 4-6 PM'}
        />
      </Content>
      
      <PlaceOrderButton
        total={cart.totals?.total || 0}
        eta={cart.storeGroups?.[0]?.eta || 'Today, 4-6 PM'}
        isValid={isValid}
        errors={errors}
        onPlaceOrder={handlePlaceOrder}
      />
    </Container>
  );
};











