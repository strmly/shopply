import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  background: ${props => props.theme.colors.card.default};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  animation: ${fadeIn} 0.4s ease-out;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.radii.md};
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.button}
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.surfaceAlt};
  }
`;

const PeriodTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ChartWrapper = styled.div`
  height: 300px;
  width: 100%;
  position: relative;
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const Line = styled.path`
  fill: none;
  stroke: ${props => props.color || props.theme.colors.primary};
  stroke-width: 3;
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

const Area = styled.path`
  fill: url(#areaGradient);
  opacity: 0.2;
`;

const GridLine = styled.line`
  stroke: ${props => props.theme.colors.border.default};
  stroke-width: 1;
  stroke-dasharray: 4 4;
`;

const Dot = styled.circle`
  fill: ${props => props.color || props.theme.colors.primary};
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    r: 6;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  background: ${props => props.theme.colors.neutral[900]};
  color: white;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: ${props => props.theme.shadows.lg};
  display: ${props => props.$show ? 'block' : 'none'};
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  transform: translateX(-50%);
`;

const InsightBox = styled.div`
  background: ${props => props.theme.colors.info[100]};
  border-left: 3px solid ${props => props.theme.colors.info[500]};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  margin-top: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const generatePath = (data, metric, width, height, padding) => {
  if (!data || data.length === 0) return '';

  const maxValue = Math.max(...data.map(d => d[metric] || 0), 1);
  const minValue = 0;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d[metric] || 0) / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
};

const generateArea = (data, metric, width, height, padding) => {
  if (!data || data.length === 0) return '';

  const maxValue = Math.max(...data.map(d => d[metric] || 0), 1);
  const minValue = 0;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d[metric] || 0) / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  const firstX = padding;
  const lastX = width - padding;
  const bottomY = height - padding;

  return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
};

export const TimeSeriesChart = ({ data, sellerId }) => {
  const [metric, setMetric] = useState('revenue');
  const [period, setPeriod] = useState('7d');
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Daily Sales Trend</Title>
        </Header>
        <EmptyState>
          Your first chart will appear after your first completed order.
        </EmptyState>
      </Container>
    );
  }

  const chartData = data.data;
  const width = 800;
  const height = 300;
  const padding = 40;

  const colors = {
    revenue: '#3D81EF',
    orders: '#15A17C',
    aov: '#8B5CF6'
  };

  const handleMouseMove = (e, pointData) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 60,
      data: pointData
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, data: null });
  };

  return (
    <Container>
      <Header>
        <Title>Daily Sales Trend</Title>
        <Tabs>
          <Tab $active={metric === 'revenue'} onClick={() => setMetric('revenue')}>
            Revenue
          </Tab>
          <Tab $active={metric === 'orders'} onClick={() => setMetric('orders')}>
            Orders
          </Tab>
          <Tab $active={metric === 'aov'} onClick={() => setMetric('aov')}>
            AOV
          </Tab>
        </Tabs>
      </Header>

      <PeriodTabs>
        <Tab $active={period === '7d'} onClick={() => setPeriod('7d')}>
          7 Days
        </Tab>
        <Tab $active={period === '30d'} onClick={() => setPeriod('30d')}>
          30 Days
        </Tab>
        <Tab $active={period === '90d'} onClick={() => setPeriod('90d')}>
          90 Days
        </Tab>
      </PeriodTabs>

      <ChartWrapper>
        <ChartSVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[metric]} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colors[metric]} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <GridLine
              key={ratio}
              x1={padding}
              y1={padding + ratio * (height - padding * 2)}
              x2={width - padding}
              y2={padding + ratio * (height - padding * 2)}
            />
          ))}

          {/* Area */}
          <Area d={generateArea(chartData, metric, width, height, padding)} />

          {/* Line */}
          <Line
            d={generatePath(chartData, metric, width, height, padding)}
            color={colors[metric]}
          />

          {/* Dots */}
          {chartData.map((d, index) => {
            const x = (index / (chartData.length - 1 || 1)) * (width - padding * 2) + padding;
            const maxValue = Math.max(...chartData.map(d => d[metric] || 0), 1);
            const y = height - padding - ((d[metric] || 0) / maxValue) * (height - padding * 2);
            
            return (
              <Dot
                key={index}
                cx={x}
                cy={y}
                r={4}
                color={colors[metric]}
                onMouseMove={(e) => handleMouseMove(e, d)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </ChartSVG>

        <Tooltip $show={tooltip.show} $x={tooltip.x} $y={tooltip.y}>
          {tooltip.data && (
            <>
              <div><strong>{formatDate(tooltip.data.date)}</strong></div>
              {metric === 'revenue' && (
                <div>Revenue: {formatCurrency(tooltip.data.revenue)}</div>
              )}
              {metric === 'orders' && (
                <div>Orders: {tooltip.data.orders}</div>
              )}
              {metric === 'aov' && (
                <div>AOV: {formatCurrency(tooltip.data.aov)}</div>
              )}
            </>
          )}
        </Tooltip>
      </ChartWrapper>

      {data.insights && data.insights.length > 0 && (
        <InsightBox>
          {data.insights.map((insight, index) => (
            <div key={index}>{insight}</div>
          ))}
          {data.weekOverWeek !== null && (
            <div style={{ marginTop: '8px', fontWeight: 600 }}>
              Week-over-Week: {data.weekOverWeek >= 0 ? '+' : ''}{data.weekOverWeek.toFixed(1)}%
            </div>
          )}
        </InsightBox>
      )}
    </Container>
  );
};

