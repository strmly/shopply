import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * Furniture Checkout Enhancement
 * Additional checkout fields specific to furniture delivery
 */

const FurnitureCheckoutEnhancement = ({ product, store, onComplete }) => {
  const [deliveryMethod, setDeliveryMethod] = useState('local_delivery');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [needsAssembly, setNeedsAssembly] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [hasElevator, setHasElevator] = useState(null);
  const [hasStairs, setHasStairs] = useState(null);

  const handleSubmit = () => {
    const furnitureDetails = {
      deliveryMethod,
      deliverySlot,
      needsAssembly,
      assemblyFee: needsAssembly ? product.assemblyFee : 0,
      deliveryNotes,
      accessDetails: {
        hasElevator,
        hasStairs,
      },
    };
    
    onComplete(furnitureDetails);
  };

  const deliveryModes = store.deliveryModes || ['local_delivery'];
  const assemblyAvailable = store.assemblyAvailable && product.assemblyRequired;

  return (
    <Container>
      <Title>🚚 Furniture Delivery Details</Title>

      {/* Delivery Method Selection */}
      <Section>
        <SectionLabel>Choose Delivery Method</SectionLabel>
        {deliveryModes.includes('local_delivery') && (
          <RadioOption>
            <RadioInput
              type="radio"
              name="deliveryMethod"
              value="local_delivery"
              checked={deliveryMethod === 'local_delivery'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            <RadioLabel>
              <RadioTitle>🚚 Local Delivery</RadioTitle>
              <RadioDescription>
                Delivered to your door
                {store.deliveryPricing?.T0 && ` • From R${store.deliveryPricing.T0}`}
              </RadioDescription>
            </RadioLabel>
          </RadioOption>
        )}

        {deliveryModes.includes('pickup') && (
          <RadioOption>
            <RadioInput
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            <RadioLabel>
              <RadioTitle>🏪 Store Pickup</RadioTitle>
              <RadioDescription>
                Pick up from {store.address?.suburb || 'store location'}
              </RadioDescription>
            </RadioLabel>
          </RadioOption>
        )}

        {deliveryModes.includes('courier_freight') && (
          <RadioOption>
            <RadioInput
              type="radio"
              name="deliveryMethod"
              value="courier_freight"
              checked={deliveryMethod === 'courier_freight'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            <RadioLabel>
              <RadioTitle>📦 Courier/Freight</RadioTitle>
              <RadioDescription>Quote required</RadioDescription>
            </RadioLabel>
          </RadioOption>
        )}
      </Section>

      {/* Delivery Slot (if delivery) */}
      {deliveryMethod !== 'pickup' && (
        <Section>
          <SectionLabel>Preferred Delivery Slot</SectionLabel>
          <Select value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)}>
            <option value="">Select a time slot</option>
            <option value="morning">Morning (8am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 5pm)</option>
            <option value="evening">Evening (5pm - 8pm)</option>
          </Select>
        </Section>
      )}

      {/* Assembly Option */}
      {assemblyAvailable && (
        <Section>
          <CheckboxOption>
            <Checkbox
              type="checkbox"
              checked={needsAssembly}
              onChange={(e) => setNeedsAssembly(e.target.checked)}
            />
            <CheckboxLabel>
              <CheckboxTitle>🔧 Add Assembly Service</CheckboxTitle>
              <CheckboxDescription>
                Professional assembly for R{product.assemblyFee}
              </CheckboxDescription>
            </CheckboxLabel>
          </CheckboxOption>
        </Section>
      )}

      {/* Access Details (for delivery) */}
      {deliveryMethod !== 'pickup' && (
        <Section>
          <SectionLabel>Delivery Access Details</SectionLabel>
          
          <AccessQuestion>
            <QuestionText>Is there an elevator?</QuestionText>
            <ButtonGroup>
              <ToggleButton
                active={hasElevator === true}
                onClick={() => setHasElevator(true)}
              >
                Yes
              </ToggleButton>
              <ToggleButton
                active={hasElevator === false}
                onClick={() => setHasElevator(false)}
              >
                No
              </ToggleButton>
            </ButtonGroup>
          </AccessQuestion>

          <AccessQuestion>
            <QuestionText>Are there stairs?</QuestionText>
            <ButtonGroup>
              <ToggleButton
                active={hasStairs === true}
                onClick={() => setHasStairs(true)}
              >
                Yes
              </ToggleButton>
              <ToggleButton
                active={hasStairs === false}
                onClick={() => setHasStairs(false)}
              >
                No
              </ToggleButton>
            </ButtonGroup>
          </AccessQuestion>

          <TextArea
            placeholder="Additional delivery notes (e.g., gate code, floor number, best access route...)"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          />
        </Section>
      )}

      {/* Pickup Instructions */}
      {deliveryMethod === 'pickup' && store.pickupInstructions && (
        <Section>
          <InfoBox>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>{store.pickupInstructions}</InfoText>
          </InfoBox>
        </Section>
      )}

      <ConfirmButton onClick={handleSubmit}>
        Continue to Payment
      </ConfirmButton>
    </Container>
  );
};

// Styled Components

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #1a1a1a;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2196f3;
    background: #f9f9f9;
  }
`;

const RadioInput = styled.input`
  margin-top: 3px;
  cursor: pointer;
`;

const RadioLabel = styled.div`
  flex: 1;
`;

const RadioTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const RadioDescription = styled.div`
  font-size: 13px;
  color: #666;
`;

const CheckboxOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2196f3;
    background: #f9f9f9;
  }
`;

const Checkbox = styled.input`
  margin-top: 3px;
  cursor: pointer;
`;

const CheckboxLabel = styled.div`
  flex: 1;
`;

const CheckboxTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const CheckboxDescription = styled.div`
  font-size: 13px;
  color: #666;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const AccessQuestion = styled.div`
  margin-bottom: 16px;
`;

const QuestionText = styled.p`
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 10px;
  background: ${props => props.active ? '#2196f3' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#2196f3' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2196f3;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }

  &::placeholder {
    color: #999;
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
  border: 1px solid #2196f3;
`;

const InfoIcon = styled.span`
  font-size: 20px;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1976d2;
  line-height: 1.5;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #43a047;
  }
`;

export default FurnitureCheckoutEnhancement;

