import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${props => {
    if (props.$color === 'blue') return 'linear-gradient(135deg, #3D81EF 0%, #5C9AF2 50%, #7EC1F6 100%)';
    if (props.$color === 'green') return 'linear-gradient(135deg, #15A17C 0%, #33B893 50%, #6FD7B9 100%)';
    if (props.$color === 'purple') return 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B8FC 100%)';
    return 'linear-gradient(135deg, #667085 0%, #7B889A 50%, #98A2B3 100%)';
  }};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  color: white;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.5s ease-out ${props => props.$delay || 0}s both;
  transition: ${props => props.theme.transitions.swift};
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
    opacity: 0;
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
    
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: 500;
`;

const Value = styled.div`
  ${props => props.theme.typography.heading2}
  font-size: 28px;
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.xs};
  line-height: 1.2;
  animation: ${props => props.$pulse ? pulse : 'none'} 0.6s ease-in-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.caption}
  font-size: 12px;
  opacity: 0.95;
  font-weight: 500;
`;

const TrendIcon = styled.span`
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  animation: ${props => props.$pulse ? pulse : 'none'} 0.6s ease-in-out;
`;

const InsightBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 4px 8px;
  border-radius: ${props => props.theme.radii.md};
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const KPICards = ({ data }) => {
  const [pulseValues, setPulseValues] = useState({});
  
  useEffect(() => {
    if (data) {
      // Trigger pulse animation when values change
      const newPulses = {};
      if (data.revenue?.current) newPulses.revenue = true;
      if (data.orders?.current) newPulses.orders = true;
      if (data.averageOrderValue?.current) newPulses.aov = true;
      setPulseValues(newPulses);
      
      // Reset pulse after animation
      setTimeout(() => setPulseValues({}), 600);
    }
  }, [data?.revenue?.current, data?.orders?.current, data?.averageOrderValue?.current]);

  if (!data) {
    return null;
  }

  const { revenue, orders, averageOrderValue, insights } = data;

  return (
    <Container>
      <Card $color="blue" $delay={0.1}>
        {revenue?.trend === 'up' && revenue?.change > 10 && (
          <InsightBadge>🔥 Hot</InsightBadge>
        )}
        <Label>Total Revenue</Label>
        <Value $pulse={pulseValues.revenue}>
          {revenue?.formatted || formatCurrency(revenue?.current || 0)}
        </Value>
        {revenue?.change !== undefined && (
          <Change>
            <TrendIcon $pulse={pulseValues.revenue}>
              {revenue.change >= 0 ? '▲' : '▼'}
            </TrendIcon>
            <span>{Math.abs(revenue.change).toFixed(1)}% vs previous period</span>
          </Change>
        )}
      </Card>

      <Card $color="green" $delay={0.2}>
        {orders?.trend === 'up' && orders?.change > 15 && (
          <InsightBadge>🚀 Growing</InsightBadge>
        )}
        <Label>Total Orders</Label>
        <Value $pulse={pulseValues.orders}>{orders?.current || 0}</Value>
        {orders?.change !== undefined && (
          <Change>
            <TrendIcon $pulse={pulseValues.orders}>
              {orders.change >= 0 ? '▲' : '▼'}
            </TrendIcon>
            <span>{Math.abs(orders.change).toFixed(1)}% vs previous period</span>
          </Change>
        )}
      </Card>

      <Card $color="purple" $delay={0.3}>
        {averageOrderValue?.trend === 'up' && averageOrderValue?.change > 10 && (
          <InsightBadge>💰 Rising</InsightBadge>
        )}
        <Label>Average Order Value</Label>
        <Value $pulse={pulseValues.aov}>
          {formatCurrency(averageOrderValue?.current || 0)}
        </Value>
        {averageOrderValue?.change !== undefined && (
          <Change>
            <TrendIcon $pulse={pulseValues.aov}>
              {averageOrderValue.change >= 0 ? '▲' : '▼'}
            </TrendIcon>
            <span>{Math.abs(averageOrderValue.change).toFixed(1)}% vs previous period</span>
          </Change>
        )}
      </Card>
    </Container>
  );
};

