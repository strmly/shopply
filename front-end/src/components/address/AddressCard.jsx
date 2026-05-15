import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.article`
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.24), rgba(228,231,236,0.9), rgba(21,161,124,0.16)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 22px);
  animation: ${fadeIn} 0.3s ease;
  box-shadow: ${props => props.$isDefault
    ? '0 24px 54px rgba(61, 129, 239, 0.14)'
    : '0 20px 46px rgba(16, 24, 40, 0.08)'};

  &::after {
    content: '';
    position: absolute;
    right: -70px;
    top: -80px;
    width: 180px;
    height: 180px;
    border-radius: 999px;
    background: ${props => props.$isDefault ? 'rgba(61, 129, 239, 0.1)' : 'rgba(21, 161, 124, 0.08)'};
    pointer-events: none;
  }
`;

const TopRow = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;

  @media (max-width: 620px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const Mark = styled.div`
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 20px;
  font-weight: 900;
`;

const Label = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(18px, 4vw, 24px);
  line-height: 1.05;
  font-weight: 900;
`;

const AddressLine = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  line-height: 1.42;
  font-weight: 800;
  margin-top: 8px;
`;

const LocationLine = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.42;
  font-weight: 700;
  margin-top: 4px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 6px 11px;
  border-radius: 999px;
  background: ${props => props.$default ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$default ? '#ffffff' : props.theme.colors.primarySoftText};
  border: 1px solid ${props => props.$default ? 'transparent' : 'rgba(228,231,236,0.95)'};
  font-size: 12px;
  font-weight: 900;
  box-shadow: ${props => props.$default ? '0 14px 26px rgba(61, 129, 239, 0.2)' : '0 10px 20px rgba(16,24,40,0.04)'};

  @media (max-width: 620px) {
    grid-column: 1 / -1;
    width: fit-content;
  }
`;

const MetaRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(228,231,236,0.95);
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const Instructions = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(61, 129, 239, 0.07);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 13px;
  font-weight: 800;
  line-height: 1.4;
`;

const ActionsRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(228, 231, 236, 0.9);
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 118px;
  min-height: 42px;
  border: 1px solid ${props => props.$danger ? 'rgba(198, 40, 80, 0.22)' : props.$primary ? 'transparent' : 'rgba(228,231,236,0.95)'};
  border-radius: 999px;
  background: ${props => {
    if (props.$danger) return 'rgba(198, 40, 80, 0.08)';
    if (props.$primary) return props.theme.colors.gradient.primary;
    return '#ffffff';
  }};
  color: ${props => {
    if (props.$danger) return props.theme.colors.dangerBase || '#C62850';
    if (props.$primary) return '#ffffff';
    return props.theme.colors.primarySoftText;
  }};
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 14px 26px rgba(61, 129, 239, 0.2)' : '0 10px 20px rgba(16,24,40,0.04)'};
`;

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  distance = null,
}) => {
  const isDefault = Boolean(address.isDefault);
  const label = address.label || 'Address';
  const addressParts = [address.street, address.unit ? `Unit ${address.unit}` : null, address.floor ? `Floor ${address.floor}` : null].filter(Boolean);
  const locationParts = [address.suburb, address.city, address.postalCode].filter(Boolean);
  const distanceText = distance?.distanceFormatted ? `${distance.distanceFormatted} from you` : null;

  return (
    <Card $isDefault={isDefault}>
      <TopRow>
        <Mark>{label.slice(0, 1).toUpperCase()}</Mark>
        <div>
          <Label>{label}</Label>
          <AddressLine>{addressParts.join(', ') || 'Street address'}</AddressLine>
          <LocationLine>{locationParts.join(', ') || 'Location details'}</LocationLine>
        </div>
        <Badge $default={isDefault}>{isDefault ? 'Default' : 'Saved'}</Badge>
      </TopRow>

      {(distanceText || address.createdAt) && (
        <MetaRow>
          {distanceText && <Pill>{distanceText}</Pill>}
          {address.createdAt && <Pill>Saved {new Date(address.createdAt).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}</Pill>}
        </MetaRow>
      )}

      {address.deliveryInstructions && (
        <Instructions>{address.deliveryInstructions}</Instructions>
      )}

      <ActionsRow>
        <ActionButton onClick={() => onEdit?.(address)}>Edit</ActionButton>
        {!isDefault && (
          <ActionButton $primary onClick={() => onSetDefault?.(address)}>Make default</ActionButton>
        )}
        <ActionButton $danger onClick={() => onDelete?.(address)}>Delete</ActionButton>
      </ActionsRow>
    </Card>
  );
};
