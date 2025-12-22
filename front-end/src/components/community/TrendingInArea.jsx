import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 0;
`;

const TrendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const TrendingItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ItemLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TrendIcon = styled.span`
  font-size: 20px;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
`;

const ItemReason = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const TrendBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => {
    if (props.$trend === 'up') return props.theme.colors.successSoftBg;
    if (props.$trend === 'restocked') return props.theme.colors.primarySoftBg;
    return props.theme.colors.warningSoftBg;
  }};
  color: ${props => {
    if (props.$trend === 'up') return props.theme.colors.successBase;
    if (props.$trend === 'restocked') return props.theme.colors.primary;
    return props.theme.colors.warningBase;
  }};
  padding: 4px 8px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 10px;
  white-space: nowrap;
  text-transform: uppercase;
`;

const LoadingText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing.md};
  text-align: center;
`;

import API_BASE_URL from '@config/api';

export const TrendingInArea = ({ location }) => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, [location]);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(
        `${API_BASE_URL}/community/trending?location=${locationParam}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        // Ensure all items have required fields
        const validTrending = data.data.filter(item => 
          item.productId && item.productName
        );
        setTrending(validTrending);
      } else {
        setTrending([]);
      }
    } catch (error) {
      // Fail silently in UI; show no trending items instead of logging to console
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const getTrendIcon = (trend) => {
    const icons = {
      'up': '📈',
      'restocked': '🔄',
      'fast': '⚡',
    };
    return icons[trend] || '🔥';
  };

  const suburb = location?.suburb || 'Your Area';

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>🔥 Trending in {suburb}</Title>
        </Header>
        <LoadingText>Loading trending items...</LoadingText>
      </Container>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>🔥 Trending in {suburb}</Title>
      </Header>

      <TrendingList>
        {trending.map((item, index) => {
          if (!item.productId || !item.productName) return null;
          
          return (
            <TrendingItem 
              key={item.productId || `trending-${index}`}
              onClick={() => handleItemClick(item.productId)}
            >
              <ItemLeft>
                <TrendIcon>{getTrendIcon(item.trend)}</TrendIcon>
                <ItemInfo>
                  <ItemName>{item.productName}</ItemName>
                  <ItemReason>{item.reason || 'Trending in your area'}</ItemReason>
                </ItemInfo>
              </ItemLeft>
              <TrendBadge $trend={item.trend}>
                {item.trendPercent ? `+${item.trendPercent}%` : item.trend === 'up' ? 'UP' : 'NEW'}
              </TrendBadge>
            </TrendingItem>
          );
        })}
      </TrendingList>
    </Container>
  );
};











