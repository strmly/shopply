import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ImageSkeleton = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.background};
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const TextSkeleton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Line = styled.div`
  height: 12px;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.sm};
  animation: pulse 1.5s ease-in-out infinite;
  width: ${props => props.$width || '100%'};
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const StarSkeleton = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const Star = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.theme.colors.background};
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const ReviewCardSkeleton = () => {
  return (
    <Card>
      <Content>
        <ImageSkeleton />
        <TextSkeleton>
          <Line $width="70%" />
          <Line $width="50%" />
          <Line $width="40%" />
        </TextSkeleton>
        <StarSkeleton>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} />
          ))}
        </StarSkeleton>
      </Content>
    </Card>
  );
};

