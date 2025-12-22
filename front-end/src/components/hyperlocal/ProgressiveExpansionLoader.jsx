import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * ProgressiveExpansionLoader Component
 * Premium Uber-style animated expansion messaging
 * Shows staged expansion as it happens in real-time
 */
const ProgressiveExpansionLoader = ({
  isSearching = false,
  currentTier = null,
  onComplete = null,
}) => {
  const [stage, setStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);

  const stages = [
    { id: 'T0', label: 'Searching 1km', radius: '1km', duration: 800 },
    { id: 'T1', label: 'Expanding to 5km', radius: '5km', duration: 1000 },
    { id: 'T2', label: 'Expanding to 10km', radius: '10km', duration: 1200 },
    { id: 'T3', label: 'Expanding to 35km', radius: '35km', duration: 1500 },
  ];

  useEffect(() => {
    if (!isSearching) {
      setStage(0);
      setCompletedStages([]);
      return;
    }

    // Animate through stages
    const timer = setTimeout(() => {
      if (stage < stages.length - 1) {
        setCompletedStages(prev => [...prev, stage]);
        setStage(prev => prev + 1);
      } else {
        // Final stage
        if (onComplete) {
          onComplete();
        }
      }
    }, stages[stage].duration);

    return () => clearTimeout(timer);
  }, [isSearching, stage]);

  if (!isSearching) return null;

  return (
    <Container>
      <LoaderContent>
        <RadarContainer>
          <RadarPing />
          <RadarPing delay={0.5} />
          <RadarIcon>📍</RadarIcon>
        </RadarContainer>

        <StagesContainer>
          {stages.map((stageData, index) => (
            <Stage
              key={stageData.id}
              active={index === stage}
              completed={completedStages.includes(index)}
            >
              <StageIcon>
                {completedStages.includes(index) ? '✓' : 
                 index === stage ? '🔍' : '○'}
              </StageIcon>
              <StageLabel active={index === stage}>
                {stageData.label}
              </StageLabel>
              {index === stage && <StageProgress />}
            </Stage>
          ))}
        </StagesContainer>

        <Message>
          Finding the best products near you...
        </Message>
      </LoaderContent>
    </Container>
  );
};

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

const progressBar = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

const Container = styled.div`
  padding: 24px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin: 16px 0;
`;

const LoaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const RadarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RadarPing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: ${pulse} 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  animation-delay: ${props => props.delay || 0}s;
`;

const RadarIcon = styled.div`
  font-size: 32px;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const StagesContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Stage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => {
    if (props.completed) return 'rgba(76, 175, 80, 0.2)';
    if (props.active) return 'rgba(255, 255, 255, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.completed) return 'rgba(76, 175, 80, 0.5)';
    if (props.active) return 'rgba(255, 255, 255, 0.5)';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
`;

const StageIcon = styled.div`
  font-size: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
`;

const StageLabel = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: white;
`;

const StageProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  animation: ${progressBar} 1s ease-out forwards;
`;

const Message = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-weight: 500;
`;

export default ProgressiveExpansionLoader;

