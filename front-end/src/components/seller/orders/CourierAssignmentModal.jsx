import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

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
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-out;
  
  @media (min-width: 768px) {
    align-items: center;
  }
`;

const Modal = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.xl} ${props => props.theme.radii.xl} 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
  box-shadow: ${props => props.theme.shadows.xl};
  
  @media (min-width: 768px) {
    border-radius: ${props => props.theme.radii.xl};
    max-height: 80vh;
  }
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 2px solid ${props => props.theme.colors.border.light};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const OptionCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => 
    props.$selected ? props.theme.colors.primary : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => 
    props.$selected ? props.theme.colors.primarySoftBg : props.theme.colors.surface
  };
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const OptionTitle = styled.div`
  ${props => props.theme.typography.heading3}
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const OptionDescription = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const CourierList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
`;

const CourierCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => 
    props.$selected ? props.theme.colors.primary : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => 
    props.$selected ? props.theme.colors.primarySoftBg : props.theme.colors.surface
  };
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const CourierAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
`;

const CourierInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CourierName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CourierDetails = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SelectButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$selected 
    ? props.theme.colors.primary 
    : props.theme.colors.surfaceAlt
  };
  color: ${props => props.$selected ? 'white' : props.theme.colors.text.primary};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EmptyMessage = styled.div`
  ${props => props.theme.typography.body2}
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 2px solid ${props => props.theme.colors.border.light};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  position: sticky;
  bottom: 0;
  background: white;
`;

const ConfirmButton = styled.button`
  flex: 1;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceAlt};
  color: ${props => props.theme.colors.text.primary};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.border.light};
  }
`;

import API_BASE_URL from '@config/api';

export const CourierAssignmentModal = ({ order, onAssign, onClose }) => {
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };
  
  useEffect(() => {
    if (mode === 'manual') {
      loadCouriers();
    }
  }, [mode]);
  
  const loadCouriers = async () => {
    try {
      setLoading(true);
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/couriers`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setCouriers(json.data);
        }
      }
    } catch (err) {
      console.error('Error loading couriers:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirm = () => {
    if (mode === 'auto') {
      onAssign(null, true);
    } else if (selectedCourierId) {
      onAssign(selectedCourierId, false);
    }
  };
  
  const canConfirm = mode === 'auto' || selectedCourierId !== null;
  
  return (
    <Overlay onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Assign Courier</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <OptionCard
            $selected={mode === 'auto'}
            onClick={() => setMode('auto')}
          >
            <OptionTitle>Auto-Assign (Recommended)</OptionTitle>
            <OptionDescription>
              Automatically assign the nearest available courier.
              <br />
              <strong>ETA: 8–12 minutes</strong>
            </OptionDescription>
          </OptionCard>
          
          <OptionCard
            $selected={mode === 'manual'}
            onClick={() => setMode('manual')}
          >
            <OptionTitle>Manual Selection</OptionTitle>
            <OptionDescription>
              Choose a specific courier from available options.
            </OptionDescription>
          </OptionCard>
          
          {mode === 'manual' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  Loading couriers...
                </div>
              ) : couriers.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>🚴</EmptyIcon>
                  <EmptyMessage>
                    No couriers nearby right now.
                    <br />
                    Try again in 2 minutes or switch to pickup.
                  </EmptyMessage>
                </EmptyState>
              ) : (
                <CourierList>
                  {couriers.map(courier => (
                    <CourierCard
                      key={courier.id}
                      $selected={selectedCourierId === courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                    >
                      <CourierAvatar>
                        {courier.name?.charAt(0) || 'C'}
                      </CourierAvatar>
                      <CourierInfo>
                        <CourierName>{courier.name}</CourierName>
                        <CourierDetails>
                          <span>⭐ {courier.rating}</span>
                          <span>•</span>
                          <span>{courier.deliveries} deliveries</span>
                          <span>•</span>
                          <span>{courier.distance} km away</span>
                          <span>•</span>
                          <span>{courier.vehicle}</span>
                        </CourierDetails>
                      </CourierInfo>
                      <SelectButton $selected={selectedCourierId === courier.id}>
                        {selectedCourierId === courier.id ? 'Selected' : 'Select'}
                      </SelectButton>
                    </CourierCard>
                  ))}
                </CourierList>
              )}
            </>
          )}
        </ModalContent>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <ConfirmButton 
            onClick={handleConfirm}
            disabled={!canConfirm || (mode === 'manual' && couriers.length === 0)}
          >
            {mode === 'auto' ? 'Confirm & Assign' : 'Assign Selected'}
          </ConfirmButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};


