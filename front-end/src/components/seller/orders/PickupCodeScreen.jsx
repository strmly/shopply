import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$fullscreen ? 'black' : 'rgba(0, 0, 0, 0.5)'};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  background: white;
  border-radius: ${props => props.$fullscreen ? '0' : props.theme.radii.xl};
  width: ${props => props.$fullscreen ? '100%' : '90%'};
  max-width: ${props => props.$fullscreen ? '100%' : '400px'};
  max-height: ${props => props.$fullscreen ? '100%' : '90vh'};
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
  box-shadow: ${props => props.$fullscreen ? 'none' : props.theme.shadows.xl};
  display: flex;
  flex-direction: column;
  min-height: ${props => props.$fullscreen ? '100vh' : 'auto'};
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 2px solid ${props => props.theme.colors.border.light};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
`;

const ModalTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.radii.md};
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceAlt};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ModalContent = styled.div`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
  justify-content: center;
`;

const CodeLabel = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
`;

const CodeDisplay = styled.div`
  ${props => props.theme.typography.heading1}
  font-size: ${props => props.$fullscreen ? '72px' : '48px'};
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  letter-spacing: 8px;
  font-family: 'Courier New', monospace;
  text-align: center;
`;

const QRCodeContainer = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  border: 2px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CustomerInfo = styled.div`
  text-align: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

const CustomerName = styled.div`
  ${props => props.theme.typography.heading3}
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const OrderNumber = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  padding: 0 ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
`;

const FullscreenButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceAlt};
  color: ${props => props.theme.colors.text.primary};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.border.light};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const MarkPickedUpButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.md};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const PickupCodeScreen = ({ order, onMarkPickedUp, onClose }) => {
  const [fullscreen, setFullscreen] = useState(false);
  
  const pickupCode = order.pickupCode || '0000';
  const qrValue = JSON.stringify({
    orderId: order.id,
    pickupCode: pickupCode,
    customerName: order.buyerName
  });
  
  return (
    <Overlay 
      $fullscreen={fullscreen}
      onClick={(e) => {
        if (e.target === e.currentTarget && fullscreen) {
          setFullscreen(false);
        }
      }}
    >
      <Modal $fullscreen={fullscreen}>
        {!fullscreen && (
          <ModalHeader>
            <ModalTitle>Pickup Code</ModalTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>
        )}
        
        <ModalContent $fullscreen={fullscreen}>
          <CodeLabel>Pickup Code</CodeLabel>
          <CodeDisplay $fullscreen={fullscreen}>{pickupCode}</CodeDisplay>
          
          <QRCodeContainer>
            {QRCode ? (
              <QRCode 
                value={qrValue}
                size={fullscreen ? 300 : 200}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div style={{
                width: fullscreen ? 300 : 200,
                height: fullscreen ? 300 : 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                borderRadius: '8px',
                color: '#666',
                fontSize: '12px',
                textAlign: 'center',
                padding: '16px'
              }}>
                QR Code
                <br />
                <span style={{ fontSize: '10px' }}>
                  Install qrcode.react
                </span>
              </div>
            )}
          </QRCodeContainer>
          
          <CustomerInfo>
            <CustomerName>{order.buyerName || 'Customer'}</CustomerName>
            <OrderNumber>Order #{order.id.slice(-6)}</OrderNumber>
          </CustomerInfo>
        </ModalContent>
        
        <ActionButtons>
          <FullscreenButton onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? 'Exit Fullscreen' : 'Show Fullscreen'}
          </FullscreenButton>
          <MarkPickedUpButton onClick={onMarkPickedUp}>
            Mark as Picked Up
          </MarkPickedUpButton>
        </ActionButtons>
      </Modal>
    </Overlay>
  );
};

