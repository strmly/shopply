import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Header = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  z-index: 1000;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.scrolled ? props.theme.shadows.sm : 'none'};
  backdrop-filter: blur(10px);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: ${props => props.theme.colors.surface};
  border: none;
  border-radius: ${props => props.theme.radii.circle};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 20px;
  box-shadow: ${props => props.theme.shadows.xs};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 700;
  font-size: 20px;
  flex: 1;
  text-align: center;
`;

export const CheckoutHeader = ({ onClose }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <Header scrolled={scrolled}>
      <HeaderContent>
        <BackButton onClick={handleBack}>←</BackButton>
        <Title>Checkout</Title>
        <div style={{ width: '40px' }} /> {/* Spacer for centering */}
      </HeaderContent>
    </Header>
  );
};











