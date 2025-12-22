import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div`
  padding: 0 ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Strip = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.xs};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const Thumbnail = styled.div`
  width: ${props => props.theme.spacing.xxl * 2};
  height: ${props => props.theme.spacing.xxl * 2};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.gradient.primary};
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.spacing.xxl};
`;

const LiveBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  left: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  ${props => props.theme.typography.caption}
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const HostName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const Description = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

const ViewerCount = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MOCK_LIVESTREAM = {
  host: 'Chef Tumi',
  description: 'Cooking braai essentials live',
  viewers: 234,
};

export const LivestreamStrip = ({ onClick }) => {
  return (
    <Container>
      <Strip onClick={onClick}>
        <Thumbnail>
          <LiveBadge>LIVE</LiveBadge>
          📺
        </Thumbnail>
        <Content>
          <HostName>{MOCK_LIVESTREAM.host}</HostName>
          <Description>{MOCK_LIVESTREAM.description}</Description>
          <ViewerCount>
            <span>👁️</span>
            <span>{MOCK_LIVESTREAM.viewers} watching</span>
          </ViewerCount>
        </Content>
      </Strip>
    </Container>
  );
};











