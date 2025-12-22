import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { LoadingContainer } from '../ui';

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  max-width: 400px;
  height: 300px;
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.surface} 0%,
    ${props => props.theme.colors.neutral[100]} 50%,
    ${props => props.theme.colors.surface} 100%
  );
  background-size: 2000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${props => props.theme.radii.lg};
  position: relative;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const MapPin = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  animation: ${pulse} 1.5s ease-in-out infinite;
  
  &::before {
    content: '📍';
    font-size: 40px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
`;

const RippleRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${ripple} 2s ease-out infinite;
  opacity: 0.6;
`;

const ProgressCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 3px solid ${props => props.theme.colors.primarySoftBg};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
  
  @keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const Text = styled.p`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtext = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

export const LocationDetectingScreen = () => {
  return (
    <Container>
      <MapPlaceholder>
        <ProgressCircle />
        <RippleRing />
        <RippleRing style={{ animationDelay: '0.5s' }} />
        <RippleRing style={{ animationDelay: '1s' }} />
        <MapPin />
      </MapPlaceholder>
      
      <LoadingContainer>
        <Text>Finding local stores near you…</Text>
        <Subtext>This takes just a moment.</Subtext>
      </LoadingContainer>
    </Container>
  );
};

