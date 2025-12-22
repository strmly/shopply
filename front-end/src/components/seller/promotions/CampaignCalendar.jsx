import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { Button } from '../../ui/Button';

import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 28px;
  margin: 0;
`;

const Filters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => 
    props.$active ? props.theme.colors.primary : 
    props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  background: ${props => 
    props.$active ? props.theme.colors.primarySoftBg : 
    'transparent'};
  color: ${props => 
    props.$active ? props.theme.colors.primary : 
    props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.lg};
`;

const DayHeader = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
`;

const DayCell = styled.div`
  aspect-ratio: 1;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.sm};
  padding: ${props => props.theme.spacing.xs};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => 
    props.$isToday ? props.theme.colors.primarySoftBg : 
    props.theme.colors.background};
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }
`;

const DayNumber = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => 
    props.$isToday ? props.theme.colors.primary : 
    props.$isCurrentMonth ? props.theme.colors.text.primary : 
    props.theme.colors.text.tertiary};
  font-weight: ${props => props.$isToday ? 700 : 400};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Dots = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const SidePanel = styled.div`
  position: fixed;
  right: ${props => props.$isOpen ? 0 : '-400px'};
  top: 0;
  bottom: 0;
  width: 400px;
  background: ${props => props.theme.colors.background};
  box-shadow: ${props => props.theme.shadows.xl};
  transition: right 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.xl};
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PanelTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PromotionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PromotionItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.surface};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body1}
`;

export function CampaignCalendar({ location }) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [storeId] = useState(() => localStorage.getItem('sellerStoreId') || '1');

  useEffect(() => {
    fetchPromotions();
  }, [currentDate]);

  const fetchPromotions = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const response = await fetch(
        `${API_BASE_URL}/sellers/${storeId}/promotions/calendar?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (data.success) {
        setPromotions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getPromotionsForDate = (date) => {
    if (!date) return [];
    
    return promotions.filter(promo => {
      const promoStart = new Date(promo.startDate);
      const promoEnd = promo.endDate ? new Date(promo.endDate) : new Date('2099-12-31');
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate >= promoStart && checkDate <= promoEnd;
    });
  };

  const getPromotionColor = (type) => {
    const colors = {
      percentage: '#3D81EF',
      amount: '#3D81EF',
      flash: '#C62850',
      bundle: '#15A17C',
      buy_x_get_y: '#F59E0B',
      free_delivery: '#947DF7',
    };
    return colors[type] || '#667085';
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const today = new Date();
  const days = getDaysInMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedPromotions = selectedDate ? getPromotionsForDate(selectedDate) : [];
  const filteredPromotions = filter === 'all' 
    ? selectedPromotions 
    : selectedPromotions.filter(p => p.type === filter);

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
          <Title>Campaign Calendar</Title>
          <Button variant="primary" onClick={() => navigate('/seller/promotions')}>
            + Create Promotion
          </Button>
        </Header>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button onClick={() => navigateMonth(-1)} style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              padding: '8px'
            }}>
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => navigateMonth(1)} style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              padding: '8px'
            }}>
              ›
            </button>
          </div>
        </div>

        <Filters>
          <FilterChip $active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterChip>
          <FilterChip $active={filter === 'percentage'} onClick={() => setFilter('percentage')}>
            Discounts
          </FilterChip>
          <FilterChip $active={filter === 'flash'} onClick={() => setFilter('flash')}>
            Flash Deals
          </FilterChip>
          <FilterChip $active={filter === 'bundle'} onClick={() => setFilter('bundle')}>
            Bundles
          </FilterChip>
          <FilterChip $active={filter === 'free_delivery'} onClick={() => setFilter('free_delivery')}>
            Free Delivery
          </FilterChip>
        </Filters>

        <CalendarGrid>
          {dayNames.map(day => (
            <DayHeader key={day}>{day}</DayHeader>
          ))}
          {days.map((date, index) => {
            if (!date) {
              return <DayCell key={`empty-${index}`} />;
            }
            
            const isToday = date.toDateString() === today.toDateString();
            const dayPromotions = getPromotionsForDate(date);
            const uniqueTypes = [...new Set(dayPromotions.map(p => p.type))];
            
            return (
              <DayCell
                key={date.toISOString()}
                $isToday={isToday}
                $isCurrentMonth={true}
                onClick={() => handleDateClick(date)}
              >
                <DayNumber $isToday={isToday} $isCurrentMonth={true}>
                  {date.getDate()}
                </DayNumber>
                {uniqueTypes.length > 0 && (
                  <Dots>
                    {uniqueTypes.slice(0, 3).map(type => (
                      <Dot key={type} $color={getPromotionColor(type)} />
                    ))}
                  </Dots>
                )}
              </DayCell>
            );
          })}
        </CalendarGrid>

        {promotions.length === 0 && (
          <EmptyState>
            No promotions this month yet.
            <br />
            Increase your sales with deals or bundles!
            <br />
            <Button 
              variant="primary" 
              onClick={() => navigate('/seller/promotions')}
              style={{ marginTop: '16px' }}
            >
              Create Promotion
            </Button>
          </EmptyState>
        )}
      </Content>

      <SidePanel $isOpen={selectedDate !== null}>
        {selectedDate && (
          <>
            <PanelHeader>
              <PanelTitle>{formatDate(selectedDate)}</PanelTitle>
              <CloseButton onClick={() => setSelectedDate(null)}>×</CloseButton>
            </PanelHeader>

            {filteredPromotions.length === 0 ? (
              <EmptyState>No promotions on this date</EmptyState>
            ) : (
              <PromotionList>
                {filteredPromotions.map(promo => (
                  <PromotionItem key={promo.id}>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                      {promo.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#667085', marginBottom: '8px' }}>
                      {promo.type} • {promo.status}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/seller/promotions/${promo.id}/edit`)}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Handle duplicate
                          navigate(`/seller/promotions/${promo.id}/duplicate`);
                        }}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Duplicate
                      </Button>
                    </div>
                  </PromotionItem>
                ))}
              </PromotionList>
            )}
          </>
        )}
      </SidePanel>
      
      <BottomNavigation currentPath="/seller/promotions/calendar" />
    </Container>
  );
}


