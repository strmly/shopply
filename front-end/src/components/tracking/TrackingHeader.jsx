import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 12px min(5vw, 48px);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86)),
    radial-gradient(circle at 14% 0%, rgba(61, 129, 239, 0.08), transparent 28%),
    radial-gradient(circle at 88% 0%, rgba(245, 158, 11, 0.07), transparent 26%);
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);
  box-shadow: ${props => props.$scrolled ? '0 16px 40px rgba(16, 24, 40, 0.1)' : '0 10px 28px rgba(16, 24, 40, 0.06)'};
  backdrop-filter: blur(18px);
  transition: ${props => props.theme.transitions.swift};
`;

const HeaderContent = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,255,255,0.72)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.18), rgba(228, 231, 236, 0.82), rgba(245, 158, 11, 0.12)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
`;

const RoundButton = styled.button`
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const TitleSection = styled.div`
  min-width: 0;
  display: grid;
  justify-items: center;
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
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const OrderId = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.82);
  border-radius: 999px;
  padding: 5px 9px;
  font-weight: 900;
`;

export const TrackingHeader = ({ orderId, onClose }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shortOrderId = orderId ? `#${orderId.slice(-8)}` : '';

  return (
    <Header $scrolled={scrolled}>
      <HeaderContent>
        <RoundButton onClick={onClose} aria-label="Go back">&lt;</RoundButton>
        <TitleSection>
          <Eyebrow>Live tracking</Eyebrow>
          <Title>Order Status</Title>
          {shortOrderId && <OrderId>{shortOrderId}</OrderId>}
        </TitleSection>
        <RoundButton onClick={() => alert('Help & Support')} aria-label="Help">?</RoundButton>
      </HeaderContent>
    </Header>
  );
};
