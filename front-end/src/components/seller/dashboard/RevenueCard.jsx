import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  background: ${props => {
    if (props.$isPositive) {
      return 'linear-gradient(135deg, #3D81EF 0%, #5C9AF2 50%, #7EC1F6 100%)';
    }
    if (props.$isNegative) {
      return 'linear-gradient(135deg, #C62850 0%, #D93E5F 50%, #E23E66 100%)';
    }
    return 'linear-gradient(135deg, #667085 0%, #7B889A 50%, #98A2B3 100%)';
  }};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.xl};
  color: white;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.lg};
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 0.4s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }

  &:active {
    transform: scale(0.97);
  }

  &:hover {
    box-shadow: ${props => props.theme.shadows.xl};
    transform: translateY(-4px);
  }
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: 500;
`;

const Amount = styled.div`
  ${props => props.theme.typography.heading1}
  font-size: 40px;
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.sm};
  animation: ${props => props.$pulse ? pulse : 'none'} 0.6s ease-in-out;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Comparison = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.body2}
  font-size: 13px;
  opacity: 0.95;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TrendIcon = styled.span`
  font-size: 16px;
  display: inline-flex;
  align-items: center;
`;

const SparklineContainer = styled.div`
  height: 40px;
  margin-top: ${props => props.theme.spacing.md};
  position: relative;
`;

const Sparkline = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const SparklinePath = styled.path`
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: drawLine 1s ease-out forwards;
  
  @keyframes drawLine {
    from {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dasharray: 1000;
      stroke-dashoffset: 0;
    }
  }
`;

const SparklineArea = styled.path`
  fill: url(#sparklineGradient);
  opacity: 0.3;
  animation: drawLine 1s ease-out forwards;
`;

const Toast = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background: rgba(255, 255, 255, 0.95);
  color: ${props => props.theme.colors.successBase};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 12px;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: ${props => props.theme.shadows.md};
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const generateSparklinePath = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  const width = 300;
  const height = 40;
  const padding = 4;

  const maxValue = Math.max(...data.map(d => d.revenue), 1);
  const minValue = Math.min(...data.map(d => d.revenue), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.revenue - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
};

const generateSparklineArea = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  const width = 300;
  const height = 40;
  const padding = 4;

  const maxValue = Math.max(...data.map(d => d.revenue), 1);
  const minValue = Math.min(...data.map(d => d.revenue), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.revenue - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const firstX = (0 / (data.length - 1 || 1)) * (width - padding * 2) + padding;
  const lastX = ((data.length - 1) / (data.length - 1 || 1)) * (width - padding * 2) + padding;

  return `M ${firstX},${height - padding} L ${points.join(' L ')} L ${lastX},${height - padding} Z`;
};

export const RevenueCard = ({ 
  revenue = 0, 
  comparison = null, 
  hourlyRevenue = [],
  onCardClick 
}) => {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);
  const [toast, setToast] = useState(null);
  const [prevRevenue, setPrevRevenue] = useState(revenue);

  useEffect(() => {
    if (revenue > prevRevenue) {
      const difference = revenue - prevRevenue;
      setPulse(true);
      setToast(`+${formatCurrency(difference)} added`);
      setTimeout(() => {
        setPulse(false);
        setTimeout(() => setToast(null), 3000);
      }, 600);
    }
    setPrevRevenue(revenue);
  }, [revenue, prevRevenue]);

  const handleClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      navigate('/seller/analytics');
    }
  };

  const isPositive = comparison?.isPositive ?? true;
  const isNegative = comparison?.isPositive === false;
  const percentage = comparison?.percentage ?? 0;

  const sparklineData = hourlyRevenue.length > 0 
    ? hourlyRevenue 
    : Array.from({ length: 24 }, (_, i) => ({ hour: i, revenue: Math.random() * 50 }));

  return (
    <Container 
      $isPositive={isPositive} 
      $isNegative={isNegative}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Today's revenue: ${formatCurrency(revenue)}. ${comparison ? `${Math.abs(percentage)}% ${isPositive ? 'increase' : 'decrease'} from yesterday.` : ''} Click to view full analytics.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {toast && <Toast>{toast}</Toast>}
      
      <Label>Today's Revenue</Label>
      <Amount $pulse={pulse}>{formatCurrency(revenue)}</Amount>
      
      {comparison && (
        <Comparison>
          <TrendIcon>
            {isPositive ? '▲' : '▼'}
          </TrendIcon>
          <span>
            {Math.abs(percentage)}% vs yesterday
          </span>
        </Comparison>
      )}

      <SparklineContainer>
        <Sparkline viewBox="0 0 300 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <SparklineArea d={generateSparklineArea(sparklineData)} />
          <SparklinePath d={generateSparklinePath(sparklineData)} />
        </Sparkline>
      </SparklineContainer>
    </Container>
  );
};
