/**
 * WhatsApp Onboarding Component
 * Helps users connect to ShopLocal via WhatsApp
 */

import React, { useState } from 'react';
import styled from 'styled-components';

const WhatsAppOnboarding = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showQR, setShowQR] = useState(false);

  const whatsappBusinessNumber = '+27123456789'; // Replace with actual business number

  const handleStartChat = () => {
    // Generate WhatsApp deep link
    const message = encodeURIComponent('Hi! I want to start shopping on ShopLocal 🛍️');
    const whatsappUrl = `https://wa.me/${whatsappBusinessNumber.replace('+', '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleScanQR = () => {
    setShowQR(!showQR);
  };

  return (
    <Container>
      <Header>
        <WhatsAppIcon>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </WhatsAppIcon>
        <Title>Shop on WhatsApp</Title>
        <Subtitle>
          Get instant access to local deals, track orders, and shop directly through WhatsApp!
        </Subtitle>
      </Header>

      <Features>
        <Feature>
          <FeatureIcon>🔍</FeatureIcon>
          <FeatureText>Search & Browse Products</FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>🛒</FeatureIcon>
          <FeatureText>Add to Cart & Checkout</FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>📦</FeatureIcon>
          <FeatureText>Track Your Orders</FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>💬</FeatureIcon>
          <FeatureText>Chat with Sellers</FeatureText>
        </Feature>
      </Features>

      <CTASection>
        <PrimaryButton onClick={handleStartChat}>
          <WhatsAppIconSmall>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </WhatsAppIconSmall>
          Start Shopping on WhatsApp
        </PrimaryButton>

        <SecondaryButton onClick={handleScanQR}>
          {showQR ? '✕ Close QR Code' : '📱 Show QR Code'}
        </SecondaryButton>

        {showQR && (
          <QRSection>
            <QRCode>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://wa.me/${whatsappBusinessNumber.replace('+', '')}`)}`}
                alt="WhatsApp QR Code"
              />
            </QRCode>
            <QRText>Scan with your phone's camera to start chatting</QRText>
          </QRSection>
        )}
      </CTASection>

      <InfoSection>
        <InfoTitle>How it works:</InfoTitle>
        <Steps>
          <Step>
            <StepNumber>1</StepNumber>
            <StepText>Click the button above or scan the QR code</StepText>
          </Step>
          <Step>
            <StepNumber>2</StepNumber>
            <StepText>Send "Hi" to start your shopping journey</StepText>
          </Step>
          <Step>
            <StepNumber>3</StepNumber>
            <StepText>Follow the prompts to set your location</StepText>
          </Step>
          <Step>
            <StepNumber>4</StepNumber>
            <StepText>Start browsing and shopping!</StepText>
          </Step>
        </Steps>
      </InfoSection>

      <SellerCTA>
        <SellerText>Are you a seller?</SellerText>
        <SellerLink onClick={handleStartChat}>
          Manage your business on WhatsApp →
        </SellerLink>
      </SellerCTA>
    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const WhatsAppIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #25D366;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

  svg {
    width: 50px;
    height: 50px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Feature = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
`;

const CTASection = styled.div`
  margin-bottom: 2rem;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: white;
  color: #25D366;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const WhatsAppIconSmall = styled.div`
  width: 24px;
  height: 24px;
  color: #25D366;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid white;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const QRSection = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  animation: fadeIn 0.3s;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const QRCode = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

  img {
    display: block;
  }
`;

const QRText = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  background: white;
  color: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
`;

const SellerCTA = styled.div`
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const SellerText = styled.p`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
`;

const SellerLink = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export default WhatsAppOnboarding;

