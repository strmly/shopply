import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Button } from '../ui';

const Container = styled.div`
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  overflow: hidden;
  justify-content: space-between;
`;

const Header = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  width: 100%;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0;
  line-height: 1.2;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  padding: ${props => props.theme.spacing.sm} 0;
`;

const Explanation = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
`;

const BulletPoint = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
`;

const BulletIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const BulletText = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const Illustration = styled.div`
  width: 150px;
  height: 150px;
  background: ${props => props.theme.colors.gradient.info};
  border-radius: ${props => props.theme.radii.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.md};
  position: relative;
  flex-shrink: 0;

  &::before {
    content: '📍';
    font-size: 60px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
  max-width: 400px;
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-shrink: 0;
`;

const TooltipButton = styled.button`
  ${props => props.theme.typography.caption}
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  text-decoration: underline;
  transition: ${props => props.theme.transitions.swift};
  align-self: center;
  margin-top: ${props => props.theme.spacing.xs};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Tooltip = styled.div`
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
`;

export const PermissionRequestScreen = ({ onEnableLocation, onEnterManually }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleEnterManually = () => {
    if (onEnterManually) {
      onEnterManually();
    }
  };

  return (
    <Container>
      <Header>
        <Title>See what's available near you</Title>
      </Header>

      <Body>
        <Illustration />
        
        <Explanation>
          <BulletPoint>
            <BulletIcon>🏪</BulletIcon>
            <BulletText>Find shops closest to you</BulletText>
          </BulletPoint>
          <BulletPoint>
            <BulletIcon>🚚</BulletIcon>
            <BulletText>Get accurate delivery times</BulletText>
          </BulletPoint>
          <BulletPoint>
            <BulletIcon>📦</BulletIcon>
            <BulletText>See items in stock nearby</BulletText>
          </BulletPoint>
        </Explanation>

        <ButtonGroup>
          <Button variant="primary" $fullWidth onClick={onEnableLocation}>
            Enable Location
          </Button>
          <Button variant="outline" $fullWidth onClick={handleEnterManually}>
            Enter address manually
          </Button>
          <TooltipButton onClick={() => setShowTooltip(!showTooltip)}>
            Why we need this
          </TooltipButton>
          {showTooltip && (
            <Tooltip>
              We use your location to show you products that are actually in stock at nearby stores, 
              give you accurate delivery times, and ensure you see local prices. 
              Your location is only used to improve your shopping experience.
            </Tooltip>
          )}
        </ButtonGroup>
      </Body>
    </Container>
  );
};

