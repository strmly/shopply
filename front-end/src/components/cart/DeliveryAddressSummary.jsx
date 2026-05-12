import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 24px;
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: 0 14px 32px rgba(16, 24, 40, 0.06);
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
  gap: 14px;
  min-width: 0;
  flex: 1;
`;

const AddressIcon = styled.span`
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  font-weight: 900;
  flex-shrink: 0;
`;

const AddressText = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
`;

const AddressLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
`;

const AddressValue = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChangeButton = styled.button`
  background: ${props => props.theme.colors.gradient.primary};
  border: none;
  color: ${props => props.theme.colors.text.inverse};
  border-radius: 999px;
  padding: 11px 15px;
  ${props => props.theme.typography.caption}
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;
  box-shadow: 0 14px 28px rgba(16, 24, 40, 0.14);

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    transform: translateY(-1px);
  }
`;

export const DeliveryAddressSummary = ({ address, onChange }) => {
  if (!address) {
    return (
      <Container>
        <AddressRow>
          <AddressInfo>
            <AddressIcon>A</AddressIcon>
            <AddressText>
              <AddressLabel>No delivery address set</AddressLabel>
              <AddressValue>Add address to continue</AddressValue>
            </AddressText>
          </AddressInfo>
          <ChangeButton onClick={onChange}>Add address</ChangeButton>
        </AddressRow>
      </Container>
    );
  }

  return (
    <Container>
      <AddressRow>
        <AddressInfo>
          <AddressIcon>A</AddressIcon>
          <AddressText>
            <AddressLabel>Delivering to</AddressLabel>
            <AddressValue>{address.address || `${address.suburb}, ${address.city}`}</AddressValue>
          </AddressText>
        </AddressInfo>
        <ChangeButton onClick={onChange}>Change</ChangeButton>
      </AddressRow>
    </Container>
  );
};
