import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { FeedPost } from './FeedPost';

const Container = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.sm};
`;

const LocationSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
`;

const LocationIcon = styled.span`
  font-size: 20px;
`;

const LocationText = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
`;

const ChangeButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.8;
  }
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

export const NeighborhoodFeed = ({ location }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, [location]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(`${API_BASE_URL}/community/feed?location=${locationParam}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (postId, reaction = 'like') => {
    try {
      const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getCurrentUserId(),
          reaction,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId ? data.data : post
            )
          );
        }
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const suburb = location?.suburb || 'Your Neighborhood';

  return (
    <Container>
      <Header>
        <LocationSection>
          <LocationIcon>📍</LocationIcon>
          <LocationText>Your Neighborhood: {suburb}</LocationText>
        </LocationSection>
        <ChangeButton>Change</ChangeButton>
      </Header>

      {loading ? (
        <LoadingContainer>Loading feed...</LoadingContainer>
      ) : posts.length === 0 ? (
        <EmptyState>
          <p>No posts yet in your neighborhood.</p>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Be the first to share!</p>
        </EmptyState>
      ) : (
        <FeedList>
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onReact={handleReact}
            />
          ))}
        </FeedList>
      )}
    </Container>
  );
};











