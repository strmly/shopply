import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../../theme/animations';

const Indicator = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  z-index: 999;
  animation: ${fadeIn} 0.3s ease-in;
`;

const ModeBadge = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.mode === 'seller' 
    ? props.theme.colors.warning?.[100] || props.theme.colors.warningBase + '20'
    : props.theme.colors.primarySoftBg};
  border: 1px solid ${props => props.mode === 'seller' 
    ? props.theme.colors.warningBase 
    : props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  color: ${props => props.mode === 'seller' 
    ? props.theme.colors.warningBase 
    : props.theme.colors.primary};
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const Icon = styled.span`
  font-size: ${props => props.theme.spacing.md};
`;

export const ModeIndicator = ({ onToggle }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('shopply_user_mode') || 'buyer';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const newMode = localStorage.getItem('shopply_user_mode') || 'buyer';
      setMode(newMode);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event
    window.addEventListener('modeChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('modeChanged', handleStorageChange);
    };
  }, []);

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      navigate('/profile');
    }
  };

  if (mode === 'buyer') {
    return null; // Don't show indicator in buyer mode
  }

  return (
    <Indicator>
      <ModeBadge mode={mode} onClick={handleClick}>
        <Icon>🏪</Icon>
        <span>Seller Mode</span>
      </ModeBadge>
    </Indicator>
  );
};











