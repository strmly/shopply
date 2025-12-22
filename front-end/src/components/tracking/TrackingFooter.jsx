import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../../theme/animations';

const Footer = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.sm};
`;

const FooterButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const TrackingFooter = ({ orderId }) => {
  const navigate = useNavigate();

  return (
    <Footer>
      <FooterGrid>
        <FooterButton onClick={() => alert('View Receipt feature coming soon')}>
          📄 View Receipt
        </FooterButton>
        <FooterButton onClick={() => alert('Report Issue feature coming soon')}>
          ⚠️ Report Issue
        </FooterButton>
        <FooterButton onClick={() => alert('Reorder Items feature coming soon')}>
          🔄 Reorder Items
        </FooterButton>
        <FooterButton onClick={() => alert('Help & Support')}>
          ❓ Need Help?
        </FooterButton>
      </FooterGrid>
    </Footer>
  );
};











