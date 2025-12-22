import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const RecommendationCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CardTitle = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
`;

const CardDescription = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const CuratorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.xs};
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  margin-left: -8px;
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid ${props => props.theme.colors.background};
  margin-left: -8px;
  
  &:first-child {
    margin-left: 0;
  }
`;

const CuratorText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  margin-left: ${props => props.theme.spacing.xs};
`;

const ViewButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

import API_BASE_URL from '@config/api';

export const CommunityRecommendations = ({ location }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [location]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(
        `${API_BASE_URL}/community/recommendations?location=${locationParam}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>🌟 Recommended by Neighbors</Title>
        <Subtitle>Curated picks from your local community</Subtitle>
      </Header>

      <RecommendationsList>
        {recommendations.map((rec, index) => (
          <RecommendationCard key={rec.id || index}>
            <CardHeader>
              <div style={{ flex: 1 }}>
                <CardTitle>{rec.title}</CardTitle>
                <CardDescription>{rec.description}</CardDescription>
                {rec.curatorCount > 0 && (
                  <CuratorInfo>
                    <AvatarGroup>
                      {Array.from({ length: Math.min(rec.curatorCount, 5) }).map((_, i) => (
                        <Avatar key={i}>👤</Avatar>
                      ))}
                    </AvatarGroup>
                    <CuratorText>
                      Curated by {rec.curatorCount} {rec.curatorCount === 1 ? 'local' : 'locals'}
                    </CuratorText>
                  </CuratorInfo>
                )}
              </div>
            </CardHeader>
            <ViewButton onClick={() => {
              if (rec.bundleType) {
                navigate(`/community/bundle/${rec.bundleType}`);
              }
            }}>
              View Bundle
            </ViewButton>
          </RecommendationCard>
        ))}
      </RecommendationsList>
    </Container>
  );
};











