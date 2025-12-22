import styled, { keyframes, css } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const fillAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const ProgressContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Line = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 3px;
  background: ${props => props.theme.colors.border.light};
  z-index: 1;
`;

const FilledLine = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  height: 3px;
  background: ${props => props.theme.colors.primary};
  z-index: 2;
  transition: width 0.5s ease;
  width: ${props => props.$progress}%;
  ${props => props.$animating ? css`animation: ${fillAnimation} 1s ease-out;` : css`animation: none;`}
`;

const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex: 1;
  position: relative;
  z-index: 3;
`;

const StageCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => {
    if (props.$completed) return props.theme.colors.successBase;
    if (props.$active) return props.theme.colors.primary;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.$completed || props.$active) return props.theme.colors.text.inverse;
    return props.theme.colors.text.tertiary;
  }};
  border: 3px solid ${props => {
    if (props.$completed) return props.theme.colors.successBase;
    if (props.$active) return props.theme.colors.primary;
    return props.theme.colors.border.light;
  }};
  box-shadow: ${props => props.$active ? `0 0 0 4px ${props.theme.colors.primarySoftBg}` : 'none'};
`;

const StageLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.$completed || props.$active) return props.theme.colors.text.primary;
    return props.theme.colors.text.tertiary;
  }};
  font-weight: ${props => props.$active || props.$completed ? 700 : 400};
  font-size: 11px;
  text-align: center;
  max-width: 80px;
`;

const getStages = () => [
  { id: 'order_received', label: 'Order Received', icon: '✓' },
  { id: 'store_preparing', label: 'Store Preparing', icon: '📦' },
  { id: 'courier_assigned', label: 'Courier Assigned', icon: '🛵' },
  { id: 'on_the_way', label: 'On the Way', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', icon: '✓' },
];

const getStageIndex = (currentStage) => {
  const stages = getStages();
  return stages.findIndex(s => s.id === currentStage);
};

const getProgress = (currentStage) => {
  const stages = getStages();
  const currentIndex = getStageIndex(currentStage);
  
  if (currentIndex === -1) return 0;
  if (currentIndex === stages.length - 1) return 100;
  
  return (currentIndex / (stages.length - 1)) * 100;
};

export const ProgressBar = ({ currentStage, status }) => {
  const stages = getStages();
  const currentIndex = getStageIndex(currentStage);
  const progress = getProgress(currentStage);

  return (
    <Container>
      <ProgressContainer>
        <Line />
        <FilledLine $progress={progress} $animating={progress > 0} />
        
        {stages.map((stage, index) => {
          const completed = index < currentIndex || (index === currentIndex && status === 'delivered');
          const active = index === currentIndex && status !== 'delivered';
          
          return (
            <Stage key={stage.id}>
              <StageCircle $completed={completed} $active={active}>
                {completed ? '✓' : stage.icon}
              </StageCircle>
              <StageLabel $completed={completed} $active={active}>
                {stage.label}
              </StageLabel>
            </Stage>
          );
        })}
      </ProgressContainer>
    </Container>
  );
};











