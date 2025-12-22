import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$expiringSoon 
    ? `linear-gradient(135deg, ${props.theme.colors.warning[100]} 0%, ${props.theme.colors.warning[50]} 100%)`
    : `linear-gradient(135deg, ${props.theme.colors.surface} 0%, ${props.theme.colors.primarySoftBg} 100%)`};
  border: 2px solid ${props => props.$expiringSoon 
    ? props.theme.colors.warning[300] 
    : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.xl};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  animation: ${fadeIn} 0.4s ease-in;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.$expiringSoon 
    ? `0 2px 8px ${props.theme.colors.warning[200]}`
    : props.theme.shadows.sm};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.shadows.md};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${props => props.theme.radii.lg};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryHover} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px ${props => props.theme.colors.primary[200]};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${props => props.theme.radii.lg};
    padding: 2px;
    background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 16px;
`;

const Subtext = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: ${props => props.theme.colors.warning[200]};
  color: ${props => props.theme.colors.warning[700]};
  border-radius: ${props => props.theme.radii.pill};
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 18px;
  flex-shrink: 0;
`;

import API_BASE_URL from '@config/api';

export const VoucherQuickActionCard = ({ userId = 'default' }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [userId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/vouchers/summary?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSummary(data.data);
        }
      } else if (response.status === 404) {
        // Silently handle 404s - endpoint may not be available
        setSummary({ active: 0, totalAvailableValue: 0, expiringSoon: 0 });
      }
    } catch (error) {
      // Only log non-404 errors
      if (!error.message.includes('404')) {
        console.error('Error loading voucher summary:', error);
      }
      setSummary({ active: 0, totalAvailableValue: 0, expiringSoon: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getSubtext = () => {
    if (loading) return 'Loading...';
    if (!summary || summary.active === 0) return 'No active vouchers';
    
    if (summary.totalAvailableValue > 0) {
      return `R${summary.totalAvailableValue.toFixed(0)} available`;
    }
    
    return `${summary.active} active voucher${summary.active !== 1 ? 's' : ''}`;
  };

  const handleClick = () => {
    navigate('/vouchers');
  };

  const expiringSoon = summary?.expiringSoon > 0;

  return (
    <Card onClick={handleClick} $expiringSoon={expiringSoon}>
      <IconWrapper>🎁</IconWrapper>
      <Content>
        <Title>Vouchers</Title>
        <Subtext>{getSubtext()}</Subtext>
        {expiringSoon && (
          <Badge>Expiring soon</Badge>
        )}
      </Content>
      <Arrow>→</Arrow>
    </Card>
  );
};

