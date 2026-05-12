import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: ${props => props.$scrolled ? 'rgba(255, 255, 255, 0.88)' : '#ffffff'};
  border-bottom: 1px solid ${props => props.$scrolled ? 'rgba(228, 231, 236, 0.72)' : 'transparent'};
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.$scrolled ? '0 12px 32px rgba(16, 24, 40, 0.08)' : 'none'};
  backdrop-filter: blur(18px);
`;

const HeaderContent = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px min(5vw, 48px);
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.circle};
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.1);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const TitleSection = styled.div`
  flex: 1;
  display: grid;
  gap: 4px;
`;

const Eyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const CountPill = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 900;
  white-space: nowrap;
`;

export const CartHeader = ({ itemCount, onClose }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Header $scrolled={scrolled}>
      <HeaderContent>
        <BackButton onClick={onClose} aria-label={onClose ? 'Close cart' : 'Go back'}>
          {onClose ? 'x' : '<'}
        </BackButton>

        <TitleSection>
          <Eyebrow>Ready when you are</Eyebrow>
          <Title>Your Cart</Title>
        </TitleSection>

        <CountPill>{itemCount} {itemCount === 1 ? 'item' : 'items'}</CountPill>
      </HeaderContent>
    </Header>
  );
};
