import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error 
    ? props.theme.colors.dangerBase 
    : props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Icon = styled.span`
  font-size: 20px;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  flex: 1;
`;

const AddressText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  line-height: 1.5;
`;

const Microcopy = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.xs};
  font-style: italic;
`;

const ChangeButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.8;
  }
`;

const ErrorText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.xs};
`;

export const DeliveryAddressConfirmation = ({ address, onChange, error }) => {
  if (error) {
    return (
      <Card error>
        <Header>
          <Icon>📍</Icon>
          <Title>Delivering to:</Title>
        </Header>
        <ErrorText>{error}</ErrorText>
        <ChangeButton onClick={onChange}>
          Add Address →
        </ChangeButton>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card error>
        <Header>
          <Icon>📍</Icon>
          <Title>Delivering to:</Title>
        </Header>
        <ErrorText>Delivery address is required</ErrorText>
        <ChangeButton onClick={onChange}>
          Add Address →
        </ChangeButton>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <Icon>📍</Icon>
        <Title>Delivering to:</Title>
      </Header>
      <AddressText>{address.address || `${address.suburb}, ${address.city}`}</AddressText>
      <Microcopy>
        Most stores near this address deliver in under 1 hour.
      </Microcopy>
      <ChangeButton onClick={onChange}>
        Change Address →
      </ChangeButton>
    </Card>
  );
};











