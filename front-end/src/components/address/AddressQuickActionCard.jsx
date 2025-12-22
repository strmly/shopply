import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
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
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.radii.pill};
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 18px;
  flex-shrink: 0;
`;

import API_BASE_URL from '@config/api';

export const AddressQuickActionCard = ({ navigate, userId = 'default' }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/addresses/my-addresses?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAddresses(data.data || []);
        }
      } else if (response.status === 404) {
        // Silently handle 404s - endpoint may not be available
        setAddresses([]);
      }
    } catch (error) {
      // Only log non-404 errors
      if (!error.message.includes('404')) {
        console.error('Error loading addresses:', error);
      }
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const getSubtext = () => {
    if (loading) return 'Loading...';
    if (addresses.length === 0) return 'No saved addresses';
    
    const defaultAddr = addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      const labels = addresses.map(addr => addr.label).join(' • ');
      return labels;
    }
    
    return `${addresses.length} saved address${addresses.length !== 1 ? 'es' : ''}`;
  };

  const handleClick = () => {
    navigate('/addresses');
  };

  return (
    <Card onClick={handleClick}>
      <IconWrapper>📍</IconWrapper>
      <Content>
        <Title>My Addresses</Title>
        <Subtext>{getSubtext()}</Subtext>
        {addresses.some(addr => addr.isDefault) && (
          <Badge>Default</Badge>
        )}
      </Content>
      <Arrow>→</Arrow>
    </Card>
  );
};

