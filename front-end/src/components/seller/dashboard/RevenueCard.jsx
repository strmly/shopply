import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
`;

const Card = styled.button`
  width: 100%;
  min-height: 294px;
  padding: clamp(18px, 3vw, 26px);
  border: 1px solid rgba(61, 129, 239, 0.16);
  border-radius: 26px;
  background:
    linear-gradient(135deg, rgba(13, 28, 51, 0.98), rgba(20, 48, 86, 0.96) 44%, rgba(61, 129, 239, 0.9) 100%);
  color: #ffffff;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 28px 70px rgba(13, 28, 51, 0.2);
  overflow: hidden;
  position: relative;
  transition: ${props => props.theme.transitions.swift};

  &::after {
    content: '';
    position: absolute;
    inset: auto -18% -42% 34%;
    height: 220px;
    border-radius: 999px;
    background: rgba(196, 184, 252, 0.24);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 34px 80px rgba(13, 28, 51, 0.26);
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const Label = styled.div`
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  font-weight: 850;
`;

const Amount = styled.div`
  margin-top: 8px;
  font-size: clamp(38px, 7vw, 62px);
  line-height: 0.95;
  font-weight: 950;
  letter-spacing: 0;
  animation: ${props => props.$pulse ? pulse : 'none'} 0.6s ease-in-out;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
`;

const SparklineWrap = styled.div`
  height: 92px;
  margin-top: 8px;
`;

const Sparkline = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const Area = styled.path`
  fill: url(#revenueArea);
`;

const Line = styled.path`
  fill: none;
  stroke: rgba(255,255,255,0.92);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 850;
`;

const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
}).format(amount || 0);

const getPoints = (data) => {
  const values = data?.length ? data.map(d => Number(d.revenue) || 0) : [0, 8, 18, 11, 30, 24, 42, 38, 52];
  const width = 420;
  const height = 92;
  const padding = 6;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return [x, y];
  });
};

const toLine = (points) => `M ${points.map(point => point.join(',')).join(' L ')}`;
const toArea = (points) => {
  const first = points[0] || [0, 0];
  const last = points[points.length - 1] || [420, 0];
  return `M ${first[0]},92 L ${points.map(point => point.join(',')).join(' L ')} L ${last[0]},92 Z`;
};

export const RevenueCard = ({
  revenue = 0,
  comparison = null,
  hourlyRevenue = [],
  onCardClick,
}) => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [previousRevenue, setPreviousRevenue] = useState(revenue);

  useEffect(() => {
    if (revenue !== previousRevenue) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 600);
      setPreviousRevenue(revenue);
      return () => clearTimeout(timeout);
    }
  }, [previousRevenue, revenue]);

  const points = getPoints(hourlyRevenue);
  const isPositive = comparison?.isPositive ?? true;
  const percentage = Math.abs(comparison?.percentage ?? 0);

  const handleClick = () => {
    if (onCardClick) onCardClick();
    else navigate('/seller/analytics');
  };

  return (
    <Card
      type="button"
      onClick={handleClick}
      aria-label={`Today's revenue ${formatCurrency(revenue)}. Open analytics.`}
    >
      <Content>
        <Header>
          <div>
            <Label>Today's revenue</Label>
            <Amount $pulse={animate}>{formatCurrency(revenue)}</Amount>
          </div>
          <Pill>{isPositive ? 'Up' : 'Down'} {percentage}%</Pill>
        </Header>

        <SparklineWrap>
          <Sparkline viewBox="0 0 420 92" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <Area d={toArea(points)} />
            <Line d={toLine(points)} />
          </Sparkline>
        </SparklineWrap>

        <Footer>
          <span>Live seller analytics</span>
          <span>Open report</span>
        </Footer>
      </Content>
    </Card>
  );
};
