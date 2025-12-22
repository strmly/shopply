import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: ${props => props.theme.colors.card.default};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border.default};
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
`;

const ChartTitle = styled.h4`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DonutChart = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
`;

const DonutSVG = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const DonutSegment = styled.circle`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: ${props => props.strokeWidth || 20};
  stroke-dasharray: ${props => props.dashArray};
  stroke-dashoffset: ${props => props.dashOffset};
  transition: ${props => props.theme.transitions.swift};
  cursor: pointer;

  &:hover {
    stroke-width: ${props => (props.strokeWidth || 20) + 2};
  }
`;

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const DonutCenterValue = styled.div`
  ${props => props.theme.typography.heading2}
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const DonutCenterLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.md};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: ${props => props.theme.radii.xs};
  background: ${props => props.color};
  flex-shrink: 0;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const BarLabel = styled.div`
  ${props => props.theme.typography.body2}
  min-width: 80px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 24px;
  background: ${props => props.theme.colors.surfaceAlt};
  border-radius: ${props => props.theme.radii.sm};
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.color};
  border-radius: ${props => props.theme.radii.sm};
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: ${props => props.theme.spacing.xs};
  color: white;
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 11px;
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

const colors = {
  age: ['#3D81EF', '#5C9AF2', '#7EC1F6', '#AFCFFB'],
  gender: ['#8B5CF6', '#C4B8FC'],
  distance: ['#15A17C', '#33B893', '#6FD7B9', '#A6E8D4']
};

const calculateDonutPath = (percentage, radius = 80, strokeWidth = 20) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return { circumference, offset };
};

const generateDonutSegments = (data, colorPalette) => {
  const radius = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;
  
  return data.map((item, index) => {
    const dashArray = circumference;
    const dashOffset = currentOffset;
    currentOffset += (item.percentage / 100) * circumference;
    
    return {
      ...item,
      color: colorPalette[index % colorPalette.length],
      dashArray,
      dashOffset: circumference - dashOffset - (item.percentage / 100) * circumference
    };
  });
};

export const CustomerDemographics = ({ data, sellerId }) => {
  if (!data || data.totalCustomers === 0) {
    return (
      <Container>
        <Header>
          <Title>Customer Demographics</Title>
        </Header>
        <EmptyState>
          Demographic insights will appear once you reach 20+ customers.
        </EmptyState>
      </Container>
    );
  }

  const { ageGroups, genders, distanceRanges, insights } = data;

  const ageSegments = generateDonutSegments(ageGroups, colors.age);
  const genderSegments = generateDonutSegments(genders, colors.gender);

  return (
    <Container>
      <Header>
        <Title>Customer Demographics</Title>
      </Header>

      <ChartsGrid>
        {/* Age Group Donut Chart */}
        <ChartCard>
          <ChartTitle>Age Groups</ChartTitle>
          <DonutChart>
            <DonutSVG viewBox="0 0 200 200">
              {ageSegments.map((segment, index) => {
                const { dashArray, dashOffset } = calculateDonutPath(segment.percentage);
                return (
                  <DonutSegment
                    key={segment.label}
                    cx="100"
                    cy="100"
                    r="80"
                    color={segment.color}
                    strokeWidth={20}
                    dashArray={dashArray}
                    dashOffset={dashOffset}
                  />
                );
              })}
            </DonutSVG>
            <DonutCenter>
              <DonutCenterValue>{data.totalCustomers}</DonutCenterValue>
              <DonutCenterLabel>Customers</DonutCenterLabel>
            </DonutCenter>
          </DonutChart>
          <Legend>
            {ageGroups.map((group, index) => (
              <LegendItem key={group.label}>
                <LegendColor color={colors.age[index % colors.age.length]} />
                <span>{group.label}: {group.value} ({group.percentage.toFixed(1)}%)</span>
              </LegendItem>
            ))}
          </Legend>
        </ChartCard>

        {/* Gender Bar Chart */}
        <ChartCard>
          <ChartTitle>Gender Distribution</ChartTitle>
          <BarChart>
            {genders.map((gender, index) => (
              <BarItem key={gender.label}>
                <BarLabel>{gender.label}</BarLabel>
                <BarContainer>
                  <BarFill
                    percentage={gender.percentage}
                    color={colors.gender[index % colors.gender.length]}
                  >
                    {gender.percentage.toFixed(0)}%
                  </BarFill>
                </BarContainer>
              </BarItem>
            ))}
          </BarChart>
        </ChartCard>

        {/* Distance Range Chart */}
        <ChartCard>
          <ChartTitle>Distance Range</ChartTitle>
          <BarChart>
            {distanceRanges.map((range, index) => (
              <BarItem key={range.label}>
                <BarLabel>{range.label}</BarLabel>
                <BarContainer>
                  <BarFill
                    percentage={range.percentage}
                    color={colors.distance[index % colors.distance.length]}
                  >
                    {range.percentage.toFixed(0)}%
                  </BarFill>
                </BarContainer>
              </BarItem>
            ))}
          </BarChart>
        </ChartCard>
      </ChartsGrid>

      {insights && insights.length > 0 && (
        <InsightBox>
          {insights.map((insight, index) => (
            <div key={index}>{insight}</div>
          ))}
        </InsightBox>
      )}
    </Container>
  );
};


