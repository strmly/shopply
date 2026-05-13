import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { SkeletonCard, SkeletonText } from '../ui/Skeleton';
import { toast } from '../ui/Toast';
import API_BASE_URL from '@config/api';

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 130px;
  background:
    radial-gradient(circle at top left, rgba(61, 129, 239, 0.14), transparent 36%),
    linear-gradient(180deg, #f7fbff 0%, #ffffff 38%, #f7f5ff 100%);
  animation: ${fadeIn} 0.28s ease-in;
`;

const Shell = styled.main`
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(18px, 3.6vw, 38px) 0 0;
  display: grid;
  gap: 16px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1120px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 16px;
  padding: clamp(18px, 3.4vw, 30px);
  border-radius: 28px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(241, 247, 255, 0.94)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.38), rgba(196, 184, 252, 0.4), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.11);
  animation: ${rise} 0.34s ease-out both;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const Badge = styled.div`
  width: fit-content;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 12px;
  font-weight: 950;
  margin-bottom: 16px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.$open ? props.theme.colors.successBase : props.theme.colors.warningBase};
  box-shadow: 0 0 0 5px ${props => props.$open ? 'rgba(21, 161, 124, 0.12)' : 'rgba(245, 158, 11, 0.14)'};
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(34px, 6vw, 62px);
  line-height: 0.95;
  letter-spacing: 0;
  font-weight: 950;
`;

const Subtitle = styled.p`
  max-width: 650px;
  margin: 14px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 16px 34px rgba(61, 129, 239, 0.24)' : '0 10px 24px rgba(16, 24, 40, 0.06)'};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
  }
`;

const StatusCard = styled.aside`
  display: grid;
  gap: 10px;
  align-content: center;
`;

const MiniMetric = styled.div`
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(61, 129, 239, 0.14);
  box-shadow: 0 16px 34px rgba(16, 24, 40, 0.07);
`;

const MiniLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 850;
`;

const MiniValue = styled.div`
  margin-top: 6px;
  color: #0d1c33;
  font-size: 28px;
  font-weight: 950;
  line-height: 1;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  padding: 18px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${rise} 0.34s ease-out both;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 620px) {
    flex-direction: column;
  }
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 950;
`;

const PanelCopy = styled.p`
  margin: 4px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  font-weight: 750;
`;

const TemplateRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DayList = styled.div`
  display: grid;
  gap: 10px;
`;

const DayCard = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid ${props => props.$closed ? 'rgba(245, 158, 11, 0.26)' : 'rgba(61, 129, 239, 0.14)'};
  background: ${props => props.$closed ? 'linear-gradient(135deg, #fff7e6 0%, #f1f7ff 100%)' : props.theme.colors.gradient.soft};

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const DayName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 950;
  text-transform: capitalize;
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr);
  gap: 8px;
  align-items: center;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const TimeInput = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 850;
  outline: none;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primarySoftBg};
  }

  &:disabled {
    opacity: 0.55;
  }
`;

const Toggle = styled.button`
  min-height: 42px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(61, 129, 239, 0.18)'};
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.primary};
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
`;

const Stack = styled.div`
  display: grid;
  gap: 16px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  min-width: 0;
`;

const Label = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 900;
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 800;
  outline: none;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primarySoftBg};
  }
`;

const ErrorBox = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: ${props => props.theme.colors.warningSoftBg};
  border: 1px solid rgba(245, 158, 11, 0.28);
  color: ${props => props.theme.colors.warningBase};
  font-size: 13px;
  font-weight: 850;
`;

const SavedText = styled.div`
  color: ${props => props.theme.colors.successBase};
  font-size: 12px;
  font-weight: 850;
`;

const StickyBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 78px;
  z-index: 120;
  width: min(680px, calc(100% - 28px));
  transform: translateX(-50%);
  padding: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 20px 44px rgba(16, 24, 40, 0.14);
  backdrop-filter: blur(16px);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const DirtyText = styled.div`
  padding-left: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 850;
`;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_HOURS = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '17:00', closed: false },
  sunday: { open: '09:00', close: '17:00', closed: false },
};

const defaultPolicies = {
  pickupAvailable: true,
  orderPrepTimeMinutes: 45,
  deliveryEstimateMinutes: 90,
  returnPolicy: '',
};

const isOpenNow = (hours) => {
  if (!hours) return true;
  const now = new Date();
  const day = DAYS[(now.getDay() + 6) % 7];
  const config = hours[day];
  if (!config || config.closed) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const [openH = 0, openM = 0] = String(config.open || '00:00').split(':').map(Number);
  const [closeH = 23, closeM = 59] = String(config.close || '23:59').split(':').map(Number);
  return current >= openH * 60 + openM && current <= closeH * 60 + closeM;
};

const formatTime = (time) => {
  if (!time) return 'Closed';
  const [hour, minute] = time.split(':').map(Number);
  return new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit' }).format(new Date(2024, 0, 1, hour, minute));
};

export const StoreHoursPage = ({ location }) => {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('Your store');
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [policies, setPolicies] = useState(defaultPolicies);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const sellerId = localStorage.getItem('sellerOnboardingId') || localStorage.getItem('sellerId') || '1';
  const openNow = useMemo(() => isOpenNow(hours), [hours]);
  const openDays = useMemo(() => DAYS.filter(day => !hours[day]?.closed).length, [hours]);
  const nextOpenDay = useMemo(() => DAYS.find(day => !hours[day]?.closed), [hours]);

  const loadHours = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/hours`);
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load store hours');
      }
      setStoreName(json.data.storeName || 'Your store');
      setHours({ ...DEFAULT_HOURS, ...(json.data.hours || {}) });
      setPolicies({ ...defaultPolicies, ...(json.data.policies || {}) });
      setDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to load store hours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHours();
  }, [sellerId]);

  const updateDay = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || DEFAULT_HOURS[day]),
        [field]: value,
      },
    }));
    setDirty(true);
  };

  const toggleDay = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || DEFAULT_HOURS[day]),
        closed: !prev[day]?.closed,
      },
    }));
    setDirty(true);
  };

  const setPolicy = (field, value) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const applyTemplate = (type) => {
    if (type === 'weekday') {
      setHours(prev => ({
        ...prev,
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
      }));
    }
    if (type === 'weekend') {
      setHours(prev => ({
        ...prev,
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '15:00', closed: false },
      }));
    }
    if (type === 'always') {
      setHours(DAYS.reduce((result, day) => ({
        ...result,
        [day]: { open: '00:00', close: '23:59', closed: false },
      }), {}));
    }
    if (type === 'reset') {
      setHours(DEFAULT_HOURS);
      setPolicies(defaultPolicies);
    }
    setDirty(true);
  };

  const validate = () => {
    for (const day of DAYS) {
      const config = hours[day];
      if (!config?.closed && config.open >= config.close) {
        return `${day} close time must be after open time`;
      }
    }
    if (Number(policies.orderPrepTimeMinutes) < 0 || Number(policies.deliveryEstimateMinutes) < 0) {
      return 'Prep and delivery estimates cannot be negative';
    }
    return null;
  };

  const saveHours = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, policies }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to save store hours');
      }
      setHours({ ...DEFAULT_HOURS, ...(json.data.hours || {}) });
      setPolicies({ ...defaultPolicies, ...(json.data.policies || {}) });
      setLastSaved(new Date());
      setDirty(false);
      toast.success('Store hours saved');
    } catch (err) {
      setError(err.message || 'Failed to save store hours');
      toast.error(err.message || 'Failed to save store hours');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <TopNavigation location={location} />
      <Shell>
        <Hero>
          <div>
            <Badge>
              <Dot $open={openNow} />
              {openNow ? 'Open now' : 'Closed now'}
            </Badge>
            <Title>Manage Hours</Title>
            <Subtitle>
              Set when {storeName} can accept orders, pickup windows, and buyer ETA messaging across Tsenga.
            </Subtitle>
            <HeroActions>
              <Button type="button" onClick={() => navigate('/seller/dashboard')}>Dashboard</Button>
              <Button type="button" onClick={() => navigate('/seller/store')}>Storefront</Button>
              <Button $primary type="button" onClick={saveHours} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save hours'}
              </Button>
            </HeroActions>
          </div>
          <StatusCard>
            <MiniMetric>
              <MiniLabel>Open days</MiniLabel>
              <MiniValue>{openDays}/7</MiniValue>
            </MiniMetric>
            <MiniMetric>
              <MiniLabel>Next open window</MiniLabel>
              <MiniValue>{nextOpenDay ? `${formatTime(hours[nextOpenDay]?.open)}` : 'Closed'}</MiniValue>
            </MiniMetric>
          </StatusCard>
        </Hero>

        {error && <ErrorBox>{error}</ErrorBox>}

        {loading ? (
          <Panel>
            <SkeletonText $size="large" $width="40%" />
            <SkeletonCard style={{ minHeight: 360, marginTop: 16, borderRadius: 20 }} />
          </Panel>
        ) : (
          <Layout>
            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Weekly Schedule</PanelTitle>
                  <PanelCopy>Use accurate hours so buyers see reliable availability and delivery expectations.</PanelCopy>
                </div>
                <TemplateRow>
                  <Button type="button" onClick={() => applyTemplate('weekday')}>Weekdays</Button>
                  <Button type="button" onClick={() => applyTemplate('weekend')}>Weekend</Button>
                  <Button type="button" onClick={() => applyTemplate('always')}>24/7</Button>
                </TemplateRow>
              </PanelHeader>

              <DayList>
                {DAYS.map(day => {
                  const config = hours[day] || DEFAULT_HOURS[day];
                  return (
                    <DayCard key={day} $closed={config.closed}>
                      <DayName>{day}</DayName>
                      <TimeGrid>
                        <TimeInput
                          type="time"
                          value={config.open || ''}
                          disabled={config.closed}
                          onChange={(event) => updateDay(day, 'open', event.target.value)}
                        />
                        <span>to</span>
                        <TimeInput
                          type="time"
                          value={config.close || ''}
                          disabled={config.closed}
                          onChange={(event) => updateDay(day, 'close', event.target.value)}
                        />
                      </TimeGrid>
                      <Toggle type="button" $active={!config.closed} onClick={() => toggleDay(day)}>
                        {config.closed ? 'Closed' : 'Open'}
                      </Toggle>
                    </DayCard>
                  );
                })}
              </DayList>
            </Panel>

            <Stack>
              <Panel>
                <PanelHeader>
                  <div>
                    <PanelTitle>Fulfillment Rules</PanelTitle>
                    <PanelCopy>These settings help checkout and order tracking estimate timing.</PanelCopy>
                  </div>
                </PanelHeader>
                <Stack>
                  <Toggle
                    type="button"
                    $active={policies.pickupAvailable}
                    onClick={() => setPolicy('pickupAvailable', !policies.pickupAvailable)}
                  >
                    {policies.pickupAvailable ? 'Pickup enabled' : 'Pickup disabled'}
                  </Toggle>
                  <Field>
                    <Label>Order prep time minutes</Label>
                    <Input
                      type="number"
                      min="0"
                      value={policies.orderPrepTimeMinutes}
                      onChange={(event) => setPolicy('orderPrepTimeMinutes', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <Label>Delivery estimate minutes</Label>
                    <Input
                      type="number"
                      min="0"
                      value={policies.deliveryEstimateMinutes}
                      onChange={(event) => setPolicy('deliveryEstimateMinutes', event.target.value)}
                    />
                  </Field>
                </Stack>
              </Panel>

              <Panel>
                <PanelHeader>
                  <div>
                    <PanelTitle>Quick Actions</PanelTitle>
                    <PanelCopy>Reset or save your store availability in one tap.</PanelCopy>
                  </div>
                </PanelHeader>
                <Stack>
                  <Button type="button" onClick={() => applyTemplate('reset')}>Reset to Tsenga default</Button>
                  <Button $primary type="button" onClick={saveHours} disabled={saving}>
                    {saving ? 'Saving...' : 'Save schedule'}
                  </Button>
                  {lastSaved && (
                    <SavedText>
                      Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </SavedText>
                  )}
                </Stack>
              </Panel>
            </Stack>
          </Layout>
        )}
      </Shell>

      {dirty && (
        <StickyBar>
          <DirtyText>Unsaved schedule changes</DirtyText>
          <Button $primary type="button" onClick={saveHours} disabled={saving}>
            {saving ? 'Saving...' : 'Save hours'}
          </Button>
        </StickyBar>
      )}

      <BottomNavigation currentPath="/seller/settings/hours" />
    </Page>
  );
};
