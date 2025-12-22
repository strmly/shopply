import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { MapPreview } from './MapPreview';

const Card = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => 
    props.isDefault 
      ? props.theme.colors.primary 
      : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: ${props => 
    props.isDefault 
      ? props.theme.shadows.md 
      : props.theme.shadows.xs
  };

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Label = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.pill};
  font-size: 11px;
  font-weight: 600;
`;

const Content = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const AddressText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const StreetAddress = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  line-height: 1.4;
`;

const CitySuburb = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const DistanceTag = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  padding: 2px 8px;
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.radii.pill};
`;

const InstructionsIndicator = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: ${props => props.theme.colors.neutral[50]};
  border: none;
  border-radius: ${props => props.theme.radii.pill};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => 
    props.variant === 'destructive' 
      ? props.theme.colors.danger[100]
      : props.theme.colors.background
  };
  color: ${props => 
    props.variant === 'destructive'
      ? props.theme.colors.danger[500]
      : props.theme.colors.text.primary
  };
  border: 1px solid ${props => 
    props.variant === 'destructive'
      ? props.theme.colors.danger[200]
      : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}
  font-size: 13px;

  &:hover {
    background: ${props => 
      props.variant === 'destructive'
        ? props.theme.colors.danger[200]
        : props.theme.colors.primarySoftBg
    };
    border-color: ${props => 
      props.variant === 'destructive'
        ? props.theme.colors.danger[300]
        : props.theme.colors.primary
    };
    color: ${props => 
      props.variant === 'destructive'
        ? props.theme.colors.danger[600]
        : props.theme.colors.primary
    };
  }
`;

const MapPreviewWrapper = styled.div`
  width: 100px;
  height: 80px;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }
`;

export const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault,
  onMapClick,
  currentLocation = null,
  distance = null
}) => {
  const isDefault = address.isDefault;
  
  const formatAddress = () => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.unit) parts.push(`Unit ${address.unit}`);
    if (address.floor) parts.push(`Floor ${address.floor}`);
    return parts.join(', ');
  };

  const formatCitySuburb = () => {
    const parts = [];
    if (address.suburb) parts.push(address.suburb);
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
    return parts.join(', ');
  };

  const getDistanceText = () => {
    if (distance && distance.distanceFormatted) {
      return `${distance.distanceFormatted} from you`;
    }
    return null;
  };

  const distanceText = getDistanceText();

  return (
    <Card isDefault={isDefault}>
      <TopRow>
        <Label>{address.label || 'Address'}</Label>
        {isDefault && <Badge>Default</Badge>}
      </TopRow>
      
      <Content>
        <AddressText>
          <StreetAddress>{formatAddress()}</StreetAddress>
          <CitySuburb>{formatCitySuburb()}</CitySuburb>
        </AddressText>
        
        {address.latitude && address.longitude && (
          <MapPreviewWrapper onClick={() => onMapClick && onMapClick(address)}>
            <MapPreview 
              lat={address.latitude} 
              lng={address.longitude}
              height="80px"
            />
          </MapPreviewWrapper>
        )}
      </Content>

      {(distanceText || address.deliveryInstructions) && (
        <MetaRow>
          {distanceText && <DistanceTag>{distanceText}</DistanceTag>}
          {address.deliveryInstructions && (
            <InstructionsIndicator onClick={() => {
              // Show delivery instructions in a modal or tooltip
              alert(`Delivery Instructions:\n${address.deliveryInstructions}`);
            }}>
              📝 Instructions
            </InstructionsIndicator>
          )}
        </MetaRow>
      )}

      <ActionsRow>
        <ActionButton onClick={() => onEdit && onEdit(address)}>
          Edit
        </ActionButton>
        {!isDefault && (
          <ActionButton onClick={() => onSetDefault && onSetDefault(address)}>
            Set as Default
          </ActionButton>
        )}
        <ActionButton 
          variant="destructive" 
          onClick={() => onDelete && onDelete(address)}
        >
          Delete
        </ActionButton>
      </ActionsRow>
    </Card>
  );
};

