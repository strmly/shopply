import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { Button } from '../ui/Button';
import { SkeletonCard, SkeletonText } from '../ui/Skeleton';
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
  gap: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin: 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin: 0;
`;

const FormCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px dashed ${props => props.theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

const DayLabel = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  width: 90px;
  text-transform: capitalize;
`;

const TimeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex: 1;
`;

const TimeInput = styled.input`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  ${props => props.theme.typography.body2}
  font-size: 13px;
  width: 90px;

  &:disabled {
    background: ${props => props.theme.colors.background};
    opacity: 0.7;
  }
`;

const ClosedToggle = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.pill};
  border: none;
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  background: ${props =>
    props.$closed ? props.theme.colors.dangerSoftBg : props.theme.colors.successSoftBg};
  color: ${props =>
    props.$closed ? props.theme.colors.dangerBase : props.theme.colors.successBase};
`;

const HelperText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ActionsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ErrorState = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.dangerSoftBg};
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.dangerBase};
  ${props => props.theme.typography.body2}
`;

const SuccessText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.xs};
`;

const LoadingCard = styled(SkeletonCard)`
  padding: ${props => props.theme.spacing.lg};
`;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const StoreHoursPage = () => {
  const navigate = useNavigate();
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };

  useEffect(() => {
    const sellerId = getSellerId();

    const loadHours = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`);
        if (!response.ok) {
          throw new Error('Failed to load store settings');
        }

        const json = await response.json();
        if (json.success && json.data) {
          const setupHours = json.data.storeSetup?.hours;
          setHours(
            setupHours || {
              monday: { open: '08:00', close: '18:00', closed: false },
              tuesday: { open: '08:00', close: '18:00', closed: false },
              wednesday: { open: '08:00', close: '18:00', closed: false },
              thursday: { open: '08:00', close: '18:00', closed: false },
              friday: { open: '08:00', close: '18:00', closed: false },
              saturday: { open: '09:00', close: '17:00', closed: false },
              sunday: { open: '09:00', close: '17:00', closed: false },
            }
          );
        } else {
          throw new Error(json.message || 'Failed to load store settings');
        }
      } catch (err) {
        console.error('Error loading store hours:', err);
        setError(err.message || 'Failed to load store hours');
      } finally {
        setLoading(false);
      }
    };

    loadHours();
  }, []);

  const handleTimeChange = (day, field, value) => {
    if (!hours) return;
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const toggleClosed = (day) => {
    if (!hours) return;
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      },
    }));
  };

  const handleSave = async () => {
    if (!hours) return;
    try {
      setSaving(true);
      setError(null);

      const sellerId = getSellerId();
      const response = await fetch(`${API_BASE_URL}/sellers/onboarding/${sellerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeSetup: {
            hours,
          },
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to save store hours');
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving store hours:', err);
      setError(err.message || 'Failed to save store hours');
    } finally {
      setSaving(false);
    }
  };

  const handleUseWeekdayTemplate = () => {
    if (!hours) return;
    const template = {
      open: '08:00',
      close: '18:00',
      closed: false,
    };
    setHours(prev => ({
      ...prev,
      monday: { ...template },
      tuesday: { ...template },
      wednesday: { ...template },
      thursday: { ...template },
      friday: { ...template },
    }));
  };

  return (
    <Container>
      <TopNavigation title="Manage Hours" onBack={() => navigate(-1)} />
      <Content>
        <Header>
          <Title>Store hours</Title>
          <Subtitle>
            Control when your store appears as open in Tsenga search, checkout, and tracking.
          </Subtitle>
        </Header>

        {error && (
          <ErrorState>
            <strong>Something went wrong</strong>
            <div>{error}</div>
          </ErrorState>
        )}

        {loading || !hours ? (
          <LoadingCard>
            <SkeletonText width="50%" height={18} />
            <SkeletonText width="80%" height={14} />
          </LoadingCard>
        ) : (
          <FormCard>
            {days.map(day => (
              <DayRow key={day}>
                <DayLabel>{day}</DayLabel>
                <TimeGroup>
                  <TimeInput
                    type="time"
                    value={hours[day]?.open || ''}
                    onChange={e => handleTimeChange(day, 'open', e.target.value)}
                    disabled={hours[day]?.closed}
                  />
                  <span>–</span>
                  <TimeInput
                    type="time"
                    value={hours[day]?.close || ''}
                    onChange={e => handleTimeChange(day, 'close', e.target.value)}
                    disabled={hours[day]?.closed}
                  />
                </TimeGroup>
                <ClosedToggle
                  type="button"
                  onClick={() => toggleClosed(day)}
                  $closed={!!hours[day]?.closed}
                >
                  {hours[day]?.closed ? 'Closed' : 'Open'}
                </ClosedToggle>
              </DayRow>
            ))}

            <HelperText>
              Tip: Keep hours realistic. We use these to decide when your store can accept orders and
              for ETA messaging.
            </HelperText>

            <ActionsRow>
              <Button
                type="button"
                variant="outline"
                style={{ flex: 1 }}
                onClick={handleUseWeekdayTemplate}
              >
                Apply weekday template
              </Button>
              <Button
                type="button"
                variant="primary"
                style={{ flex: 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save hours'}
              </Button>
            </ActionsRow>

            {lastSaved && (
              <SuccessText>
                ✅ Hours updated •{' '}
                {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </SuccessText>
            )}
          </FormCard>
        )}
      </Content>
      <BottomNavigation currentPath="/seller/settings/hours" />
    </Container>
  );
};


