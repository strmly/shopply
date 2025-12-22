import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.neutral[50]} 0%,
    ${props => props.theme.colors.neutral[100]} 50%,
    ${props => props.theme.colors.neutral[50]} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${props => props.theme.radii.md};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSkeleton = styled(SkeletonBase)`
  height: 20px;
  width: 100px;
`;

const BadgeSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 60px;
  border-radius: ${props => props.theme.radii.pill};
`;

const Content = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const LineSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: ${props => props.$width || '100%'};
`;

const MapSkeleton = styled(SkeletonBase)`
  width: 100px;
  height: 80px;
  border-radius: ${props => props.theme.radii.md};
  flex-shrink: 0;
`;

const ActionsSkeleton = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const ButtonSkeleton = styled(SkeletonBase)`
  flex: 1;
  height: 36px;
  border-radius: ${props => props.theme.radii.md};
`;

export const AddressCardSkeleton = () => {
  return (
    <Card>
      <Header>
        <TitleSkeleton />
        <BadgeSkeleton />
      </Header>
      <Content>
        <TextContent>
          <LineSkeleton $width="80%" />
          <LineSkeleton $width="60%" />
        </TextContent>
        <MapSkeleton />
      </Content>
      <ActionsSkeleton>
        <ButtonSkeleton />
        <ButtonSkeleton />
        <ButtonSkeleton />
      </ActionsSkeleton>
    </Card>
  );
};

