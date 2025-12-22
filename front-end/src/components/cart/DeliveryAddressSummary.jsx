import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  margin: ${props => props.theme.spacing.md} 0;
  border-radius: ${props => props.theme.radii.lg};
  animation: ${fadeIn} 0.3s ease-in;
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const AddressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
`;

const AddressIcon = styled.span`
  font-size: 24px;
  flex-shrink: 0;
`;

const AddressText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const AddressLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const AddressValue = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
`;

const ChangeButton = styled.button`
  background: transparent;
  border: 2px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-1px);
  }
`;

export const DeliveryAddressSummary = ({ address, onChange }) => {
  if (!address) {
    return (
      <Container>
        <AddressRow>
          <AddressInfo>
            <AddressIcon>📍</AddressIcon>
            <AddressText>
              <AddressLabel>No delivery address set</AddressLabel>
              <AddressValue>Add address to continue</AddressValue>
            </AddressText>
          </AddressInfo>
          <ChangeButton onClick={onChange}>Add Address</ChangeButton>
        </AddressRow>
      </Container>
    );
  }

  return (
    <Container>
      <AddressRow>
        <AddressInfo>
          <AddressIcon>📍</AddressIcon>
          <AddressText>
            <AddressLabel>Delivering to:</AddressLabel>
            <AddressValue>{address.address || `${address.suburb}, ${address.city}`}</AddressValue>
          </AddressText>
        </AddressInfo>
        <ChangeButton onClick={onChange}>Change</ChangeButton>
      </AddressRow>
    </Container>
  );
};











