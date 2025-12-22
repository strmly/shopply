import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
  ${props => props.isTrending && `
    border-color: ${props.theme.colors.primary};
    box-shadow: ${props.theme.shadows.sm};
  `}
`;

const PostHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Badge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.successSoftBg};
  color: ${props => props.theme.colors.successBase};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 9px;
`;

const Distance = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

const PostType = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const PostContent = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 14px;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
`;

const MediaItem = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: ${props => props.theme.colors.surface};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.liked 
    ? props.theme.colors.primary 
    : props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  font-size: 13px;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const TrendingBadge = styled.div`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 10px;
  margin-bottom: ${props => props.theme.spacing.xs};
  display: inline-block;
`;

const getPostTypeLabel = (type) => {
  const labels = {
    'text': 'Post',
    'photo': 'Photo',
    'recommendation': 'Recommendation',
    'question': 'Question',
    'find': 'Find',
  };
  return labels[type] || 'Post';
};

export const FeedPost = ({ post, onReact }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    if (onReact) {
      onReact(post.id, 'like');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Card isTrending={post.isTrending}>
      {post.isTrending && (
        <TrendingBadge>🔥 Trending post in your area</TrendingBadge>
      )}
      
      <PostHeader>
        <Avatar>{post.userAvatar || '👤'}</Avatar>
        <UserInfo>
          <UserName>
            {post.userName}
            {post.userLocation?.distance && (
              <Badge>{post.userLocation.distance} km away</Badge>
            )}
          </UserName>
          <Distance>
            {post.userLocation?.suburb || 'Nearby'} • {new Date(post.createdAt).toLocaleDateString()}
          </Distance>
        </UserInfo>
      </PostHeader>

      <PostType>{getPostTypeLabel(post.type)}</PostType>

      {post.title && (
        <PostContent style={{ fontWeight: 700, marginBottom: '4px' }}>
          {post.title}
        </PostContent>
      )}

      <PostContent>{post.content}</PostContent>

      {post.media && post.media.length > 0 && (
        <MediaGrid>
          {post.media.slice(0, 4).map((media, index) => (
            <MediaItem key={index} src={media} alt={`Media ${index + 1}`} />
          ))}
        </MediaGrid>
      )}

      {post.linkedProducts && post.linkedProducts.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {post.linkedProducts.map((productId) => (
            <button
              key={productId}
              onClick={() => handleProductClick(productId)}
              style={{
                padding: '8px 12px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '8px',
                marginBottom: '8px',
              }}
            >
              Shop Now →
            </button>
          ))}
        </div>
      )}

      <Actions>
        <ActionButton liked={liked} onClick={handleLike}>
          {liked ? '❤️' : '🤍'} {post.likeCount || 0}
        </ActionButton>
        <ActionButton>
          💬 {post.commentCount || 0}
        </ActionButton>
        <ActionButton>
          🔗 Share
        </ActionButton>
      </Actions>
    </Card>
  );
};











