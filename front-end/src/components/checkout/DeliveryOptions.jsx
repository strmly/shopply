import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.selected 
    ? props.theme.colors.primarySoftBg 
    : 'transparent'};
  border: 2px solid ${props => props.selected 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const OptionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
`;

const Radio = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const OptionText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const ETAText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const SpeedOptions = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const SpeedOption = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.selected 
    ? props.theme.colors.primarySoftBg 
    : 'transparent'};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const Microcopy = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  margin-top: ${props => props.theme.spacing.xs};
  font-style: italic;
`;

export const DeliveryOptions = ({ 
  deliveryMethod, 
  deliverySpeed,
  onDeliveryMethodChange, 
  onDeliverySpeedChange,
  cart,
  location 
}) => {
  const eta = cart?.storeGroups?.[0]?.eta || 'Today, 4-6 PM';

  return (
    <Card>
      <Title>🚚 Delivery Options</Title>
      
      <OptionGroup>
        <Option 
          selected={deliveryMethod === 'delivery'}
          onClick={() => onDeliveryMethodChange('delivery')}
        >
          <OptionLeft>
            <Radio
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={deliveryMethod === 'delivery'}
              onChange={() => onDeliveryMethodChange('delivery')}
            />
            <div>
              <OptionText>Deliver to Me</OptionText>
              <ETAText>ETA: {eta}</ETAText>
            </div>
          </OptionLeft>
        </Option>

        <Option 
          selected={deliveryMethod === 'pickup'}
          onClick={() => onDeliveryMethodChange('pickup')}
        >
          <OptionLeft>
            <Radio
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={() => onDeliveryMethodChange('pickup')}
            />
            <div>
              <OptionText>Pickup at Store</OptionText>
              <ETAText>Ready by 3 PM</ETAText>
            </div>
          </OptionLeft>
        </Option>

        <Option 
          selected={deliveryMethod === 'group'}
          onClick={() => onDeliveryMethodChange('group')}
        >
          <OptionLeft>
            <Radio
              type="radio"
              name="deliveryMethod"
              value="group"
              checked={deliveryMethod === 'group'}
              onChange={() => onDeliveryMethodChange('group')}
            />
            <div>
              <OptionText>Group Pickup</OptionText>
              <ETAText>Save R15 delivery fee</ETAText>
            </div>
          </OptionLeft>
        </Option>
      </OptionGroup>

      {deliveryMethod === 'delivery' && (
        <SpeedOptions>
          <SpeedOption 
            selected={deliverySpeed === 'standard'}
            onClick={() => onDeliverySpeedChange('standard')}
          >
            <OptionLeft>
              <Radio
                type="radio"
                name="deliverySpeed"
                value="standard"
                checked={deliverySpeed === 'standard'}
                onChange={() => onDeliverySpeedChange('standard')}
              />
              <OptionText>Standard Delivery (Today)</OptionText>
            </OptionLeft>
          </SpeedOption>

          <SpeedOption 
            selected={deliverySpeed === 'express'}
            onClick={() => onDeliverySpeedChange('express')}
          >
            <OptionLeft>
              <Radio
                type="radio"
                name="deliverySpeed"
                value="express"
                checked={deliverySpeed === 'express'}
                onChange={() => onDeliverySpeedChange('express')}
              />
              <OptionText>Express Delivery (30–60 min) + R20</OptionText>
            </OptionLeft>
          </SpeedOption>
        </SpeedOptions>
      )}

      <Microcopy>
        Fastest option for your location.
      </Microcopy>
    </Card>
  );
};











