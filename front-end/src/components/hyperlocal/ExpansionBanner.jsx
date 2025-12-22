import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * ExpansionBanner Component
 * Shows radius expansion messages (Uber-style)
 */
const ExpansionBanner = ({ 
  expanded = false, 
  effectiveRadius, 
  effectiveLabel,
  expansionSteps = [],
  isSearching = false,
  query = '',
}) => {
  if (isSearching) {
    return (
      <Banner searching>
        <LoadingDot />
        <LoadingDot delay={0.2} />
        <LoadingDot delay={0.4} />
        <Message>Searching nearby...</Message>
      </Banner>
    );
  }

  if (!expanded) {
    return (
      <Banner>
        <Icon>📍</Icon>
        <Message>
          Showing results <Strong>{effectiveLabel || `within ${effectiveRadius}km`}</Strong>
        </Message>
      </Banner>
    );
  }

  return (
    <Banner expanded>
      <Icon>🔍</Icon>
      <Content>
        <Message>
          {query ? (
            <>Expanded to <Strong>{effectiveLabel}</Strong> to find <Strong>"{query}"</Strong></>
          ) : (
            <>Expanded to <Strong>{effectiveLabel}</Strong> for better matches</>
          )}
        </Message>
        {expansionSteps.length > 1 && (
          <Steps>
            {expansionSteps.map((step, index) => (
              <Step key={step.tier}>
                <StepLabel>{step.label}</StepLabel>
                <StepCount>{step.resultsFound} found</StepCount>
                {index < expansionSteps.length - 1 && <StepArrow>→</StepArrow>}
              </Step>
            ))}
          </Steps>
        )}
      </Content>
    </Banner>
  );
};

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const Banner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => {
    if (props.searching) return 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)';
    if (props.expanded) return 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)';
    return 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)';
  }};
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid ${props => {
    if (props.searching) return '#FFD54F';
    if (props.expanded) return '#90CAF9';
    return '#E0E0E0';
  }};
`;

const Icon = styled.div`
  font-size: 18px;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
`;

const Message = styled.div`
  font-size: 13px;
  color: ${props => props.theme?.colors?.text || '#333'};
  line-height: 1.5;
`;

const Strong = styled.span`
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary || '#007AFF'};
`;

const Steps = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: white;
  border-radius: 8px;
  white-space: nowrap;
`;

const StepLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const StepCount = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary || '#007AFF'};
`;

const StepArrow = styled.div`
  font-size: 10px;
  color: ${props => props.theme?.colors?.textSecondary || '#999'};
  margin: 0 4px;
`;

const LoadingDot = styled.div`
  width: 8px;
  height: 8px;
  background: ${props => props.theme?.colors?.primary || '#007AFF'};
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
`;

export default ExpansionBanner;

