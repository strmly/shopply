import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.surface} 0%,
    ${props => props.theme.colors.surfaceAlt} 50%,
    ${props => props.theme.colors.surface} 100%
  );
  background-size: 2000px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${props => props.theme.radii.md};
  
  ${props => props.$width && `width: ${props.$width};`}
  ${props => props.$height && `height: ${props.$height};`}
  ${props => props.$circle && `border-radius: 50%;`}
`;

export const SkeletonCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

export const SkeletonText = styled(Skeleton)`
  height: ${props => props.$size === 'large' ? '24px' : props.$size === 'small' ? '12px' : '16px'};
  width: ${props => {
    if (props.$width) return props.$width;
    if (props.$size === 'large') return '60%';
    if (props.$size === 'small') return '40%';
    return '80%';
  }};
`;

export const SkeletonButton = styled(Skeleton)`
  height: 44px;
  width: 100%;
  border-radius: ${props => props.theme.radii.md};
`;


