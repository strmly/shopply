import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { AddressQuickActionCard } from '../address';
import { PaymentMethodQuickActionCard } from '../payment';

const Container = styled.div`
  background: #ffffff;
  border-radius: 26px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: 0 16px 36px rgba(16, 24, 40, 0.06);
  animation: ${fadeIn} 0.3s ease-in;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 22px;
  margin: 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const Label = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 14px;
`;

export const PaymentAddresses = ({ navigate }) => {
  return (
    <Container>
      <Title>Payment & Addresses</Title>
      <AddressQuickActionCard navigate={navigate} />
      <PaymentMethodQuickActionCard navigate={navigate} />
    </Container>
  );
};
