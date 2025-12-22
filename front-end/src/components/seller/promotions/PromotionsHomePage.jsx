import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { Button } from '../../ui/Button';
import { SkeletonCard, SkeletonText, SkeletonButton } from '../../ui/Skeleton';
import { toast } from '../../ui/Toast';

import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing.md};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 28px;
  margin: 0;
`;

const CreateButton = styled(Button)`
  min-width: auto;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const PromotionTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const cardHover = keyframes`
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-4px) scale(1.02);
  }
`;

const PromotionTypeCard = styled.div`
  background: ${props => props.$bgColor || props.theme.colors.surface};
  border: 2px solid ${props => props.$borderColor || props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${props => props.theme.spacing.md};
  min-height: 200px;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    animation: ${cardHover} 0.3s ease-out forwards;
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.$borderColor || props.theme.colors.primary};
  }

  &:active {
    transform: translateY(-2px) scale(1);
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.circle};
  background: ${props => props.$iconBg || props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: ${props => props.$iconColor || props.theme.colors.primary};
  transition: ${props => props.theme.transitions.swift};
  
  ${PromotionTypeCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const CardTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const CardDescription = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const Chevron = styled.span`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
  transition: ${props => props.theme.transitions.swift};
  
  ${PromotionTypeCard}:hover & {
    color: ${props => props.theme.colors.primary};
    transform: translateX(4px);
  }
`;

const ActivePromotionsSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 22px;
`;

const ViewCalendarButton = styled(Button)`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: 14px;
`;

const PromotionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PromotionItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
    transform: translateX(4px);
  }
`;

const PromotionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PromotionName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const PromotionMeta = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 11px;
  white-space: nowrap;
  
  ${props => {
    if (props.$status === 'active') {
      return `
        background: ${props.theme.colors.success[100]};
        color: ${props.theme.colors.success[600]};
      `;
    }
    if (props.$status === 'scheduled') {
      return `
        background: ${props.theme.colors.warning[100]};
        color: ${props.theme.colors.warning[600]};
      `;
    }
    if (props.$status === 'paused') {
      return `
        background: ${props.theme.colors.neutral[100]};
        color: ${props.theme.colors.neutral[600]};
      `;
    }
    if (props.$status === 'expired') {
      return `
        background: ${props.theme.colors.neutral[50]};
        color: ${props.theme.colors.neutral[400]};
      `;
    }
    return `
      background: ${props.theme.colors.neutral[100]};
      color: ${props.theme.colors.neutral[600]};
    `;
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;
  font-size: 12px;

  &:hover {
    background: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body1}
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  border: 2px dashed ${props => props.theme.colors.border.light};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EmptyStateTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyStateText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.danger[100]};
  border: 1px solid ${props => props.theme.colors.danger[300]};
  border-radius: ${props => props.theme.radii.lg};
  color: ${props => props.theme.colors.danger[600]};
`;

const RetryButton = styled(Button)`
  margin-top: ${props => props.theme.spacing.md};
`;

const promotionTypes = [
  {
    id: 'discount',
    title: '% Discount',
    description: 'Offer percentage or fixed amount off products',
    icon: '💰',
    color: '#3D81EF',
    bgColor: '#E6F2FF',
    route: '/seller/promotions/discount/create',
  },
  {
    id: 'flash',
    title: 'Flash Deal',
    description: 'Limited-time deals with countdown timer',
    icon: '⚡',
    color: '#C62850',
    bgColor: '#FDE4EE',
    route: '/seller/promotions/flash/create',
  },
  {
    id: 'bundle',
    title: 'Bundle Pricing',
    description: 'Group products together at a special price',
    icon: '📦',
    color: '#15A17C',
    bgColor: '#DBF8EE',
    route: '/seller/promotions/bundle/create',
  },
  {
    id: 'buy_x_get_y',
    title: 'Buy X Get Y',
    description: 'Buy multiple items, get discount on extras',
    icon: '🎁',
    color: '#F59E0B',
    bgColor: '#FEF7E3',
    route: '/seller/promotions/buy-x-get-y/create',
  },
  {
    id: 'free_delivery',
    title: 'Free Delivery Threshold',
    description: 'Offer free delivery above order amount',
    icon: '🚚',
    color: '#947DF7',
    bgColor: '#F3F0FE',
    route: '/seller/promotions/free-delivery/create',
  },
];

export function PromotionsHomePage({ location }) {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [storeId] = useState(() => {
    return localStorage.getItem('sellerStoreId') || '1';
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${API_BASE_URL}/sellers/${storeId}/promotions?activeOnly=false`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to load promotions: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPromotions(data.data || []);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to load promotions');
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      if (error.name !== 'AbortError') {
        setError(error.message || 'Failed to load promotions. Please try again.');
      } else {
        setError('Request timed out. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchPromotions();
  };

  const handlePromotionAction = async (promotionId, action) => {
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'pause':
          endpoint = `/sellers/${storeId}/promotions/${promotionId}/pause`;
          break;
        case 'resume':
          endpoint = `/sellers/${storeId}/promotions/${promotionId}/resume`;
          break;
        case 'end':
          endpoint = `/sellers/${storeId}/promotions/${promotionId}/end`;
          break;
        case 'edit':
          navigate(`/seller/promotions/${promotionId}/edit`);
          return;
        case 'duplicate':
          endpoint = `/sellers/${storeId}/promotions/${promotionId}/duplicate`;
          break;
        default:
          return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Promotion ${action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : action === 'end' ? 'ended' : 'duplicated'} successfully`);
        fetchPromotions(); // Refresh list
      } else {
        toast.error(data.message || `Failed to ${action} promotion`);
      }
    } catch (error) {
      console.error(`Error ${action} promotion:`, error);
      toast.error(`Failed to ${action} promotion. Please try again.`);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      scheduled: 'Scheduled',
      paused: 'Paused',
      expired: 'Expired',
      sold_out: 'Sold Out',
      inactive: 'Inactive',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container>
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => navigate('/')}
        onSearchClick={() => navigate('/search')}
      />
      
      <Content>
        <Header>
          <Title>Promotions</Title>
          <CreateButton 
            variant="primary"
            onClick={() => navigate('/seller/promotions/create')}
          >
            + Create Promotion
          </CreateButton>
        </Header>

        <PromotionTypesGrid>
          {promotionTypes.map((type) => (
            <PromotionTypeCard
              key={type.id}
              $bgColor={type.bgColor}
              $borderColor={type.color}
              onClick={() => navigate(type.route)}
            >
              <IconWrapper $iconBg={type.bgColor} $iconColor={type.color}>
                {type.icon}
              </IconWrapper>
              <CardTitle>{type.title}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
              <Chevron>›</Chevron>
            </PromotionTypeCard>
          ))}
        </PromotionTypesGrid>

        <ActivePromotionsSection>
          <SectionHeader>
            <SectionTitle>Active Promotions</SectionTitle>
            <ViewCalendarButton 
              variant="outline"
              onClick={() => navigate('/seller/promotions/calendar')}
            >
              📅 View Calendar
            </ViewCalendarButton>
          </SectionHeader>
          
          {loading ? (
            <PromotionsList>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i}>
                  <SkeletonText $size="large" />
                  <SkeletonText $size="small" />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <SkeletonButton $width="60px" />
                    <SkeletonButton $width="60px" />
                  </div>
                </SkeletonCard>
              ))}
            </PromotionsList>
          ) : error ? (
            <ErrorState>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Failed to load promotions</div>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</div>
              <RetryButton variant="primary" onClick={handleRetry}>
                Retry
              </RetryButton>
            </ErrorState>
          ) : promotions.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>🎯</EmptyStateIcon>
              <EmptyStateTitle>No promotions yet</EmptyStateTitle>
              <EmptyStateText>
                Create your first promotion to boost sales and attract more customers!
              </EmptyStateText>
              <Button 
                variant="primary" 
                onClick={() => navigate('/seller/promotions/create')}
              >
                Create Your First Promotion
              </Button>
            </EmptyState>
          ) : (
            <PromotionsList>
              {promotions.slice(0, 10).map((promo) => (
                <PromotionItem key={promo.id}>
                  <PromotionInfo>
                    <PromotionName>
                      {promo.title}
                      <StatusBadge $status={promo.status}>
                        {getStatusLabel(promo.status)}
                      </StatusBadge>
                    </PromotionName>
                    <PromotionMeta>
                      <span style={{ textTransform: 'capitalize' }}>{promo.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{promo.productIds?.length || 0} product{promo.productIds?.length !== 1 ? 's' : ''}</span>
                      {promo.startDate && (
                        <>
                          <span>•</span>
                          <span>Starts {formatDate(promo.startDate)} {formatTime(promo.startDate)}</span>
                        </>
                      )}
                      {promo.endDate && (
                        <>
                          <span>•</span>
                          <span>Ends {formatDate(promo.endDate)} {formatTime(promo.endDate)}</span>
                        </>
                      )}
                    </PromotionMeta>
                  </PromotionInfo>
                  <ActionButtons>
                    <ActionButton onClick={() => handlePromotionAction(promo.id, 'edit')}>
                      Edit
                    </ActionButton>
                    {promo.status === 'active' && (
                      <ActionButton onClick={() => handlePromotionAction(promo.id, 'pause')}>
                        Pause
                      </ActionButton>
                    )}
                    {promo.status === 'paused' && (
                      <ActionButton onClick={() => handlePromotionAction(promo.id, 'resume')}>
                        Resume
                      </ActionButton>
                    )}
                    {promo.status !== 'expired' && (
                      <ActionButton onClick={() => handlePromotionAction(promo.id, 'end')}>
                        End
                      </ActionButton>
                    )}
                    <ActionButton onClick={() => handlePromotionAction(promo.id, 'duplicate')}>
                      Duplicate
                    </ActionButton>
                  </ActionButtons>
                </PromotionItem>
              ))}
            </PromotionsList>
          )}
        </ActivePromotionsSection>
      </Content>
      
      <BottomNavigation currentPath="/seller/promotions" />
    </Container>
  );
}
