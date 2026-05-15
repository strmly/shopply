import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { toast } from '../ui/Toast';

const USER_ID = 'default';

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 104px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 48%, #ffffff 100%);
  animation: ${fadeIn} 0.35s ease;
`;

const Shell = styled.main`
  width: min(820px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 28px;

  @media (max-width: 560px) {
    width: min(100% - 22px, 820px);
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 14px;
  padding: clamp(18px, 4vw, 30px);
  border-radius: 28px;
  border: 1px solid transparent;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.94)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(61, 129, 239, 0.18);
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(32px, 7vw, 52px);
  line-height: 1;
  letter-spacing: 0;
  font-weight: 900;
`;

const Subtext = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const Panel = styled.section`
  margin-top: 16px;
  display: grid;
  gap: 10px;
  padding: clamp(16px, 3vw, 24px);
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
`;

const Row = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 15px;
  border-radius: 18px;
  border: 1px solid ${props => props.$on ? 'rgba(61, 129, 239, 0.24)' : props.theme.colors.border.light};
  background: ${props => props.$on ? props.theme.colors.primarySoftBg : props.theme.colors.neutral[50]};
  text-align: left;
  cursor: pointer;
`;

const RowTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
`;

const RowText = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 750;
`;

const Switch = styled.span`
  width: 52px;
  height: 30px;
  border-radius: 999px;
  padding: 3px;
  background: ${props => props.$on ? props.theme.colors.gradient.primary : props.theme.colors.neutral[200]};
  transition: ${props => props.theme.transitions.swift};
`;

const Knob = styled.span`
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ffffff;
  transform: translateX(${props => props.$on ? '22px' : '0'});
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 4px 12px rgba(16, 24, 40, 0.18);
`;

const SaveButton = styled.button`
  min-height: 48px;
  margin-top: 8px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.disabled ? props.theme.colors.neutral[200] : props.theme.colors.gradient.primary};
  color: #ffffff;
  font-weight: 900;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${props => props.disabled ? 'none' : '0 16px 34px rgba(61, 129, 239, 0.24)'};
`;

const Notice = styled.div`
  padding: 12px 14px;
  border-radius: 16px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.16);
  font-size: 12px;
  font-weight: 850;
`;

const options = [
  {
    key: 'orderUpdates',
    title: 'Order updates',
    text: 'Delivery, pickup, payment, and tracking changes.',
  },
  {
    key: 'deals',
    title: 'Deals',
    text: 'Flash deals, vouchers, and local seller offers.',
  },
  {
    key: 'reminders',
    title: 'Reminders',
    text: 'Cart reminders, saved finds, and review prompts.',
  },
];

export const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    deals: true,
    reminders: true,
  });
  const [initial, setInitial] = useState(notifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/${USER_ID}/preferences`);
        const data = await response.json();
        if (data.success && data.data?.notifications) {
          setNotifications(data.data.notifications);
          setInitial(data.data.notifications);
        }
      } catch {
        toast.error('Could not load notification settings');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const dirty = JSON.stringify(notifications) !== JSON.stringify(initial);

  const toggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/${USER_ID}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not save notification settings');
      }

      const saved = data.data.notifications || notifications;
      setNotifications(saved);
      setInitial(saved);
      toast.success('Notification settings saved');
    } catch (err) {
      toast.error(err.message || 'Could not save notification settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <Shell>
        <Hero>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">&lt;</BackButton>
          <div>
            <Title>Notifications</Title>
            <Subtext>Choose which Shopply updates should reach you. Essential account safety messages stay on.</Subtext>
          </div>
        </Hero>

        <Panel>
          {loading ? (
            <Notice>Loading notification settings...</Notice>
          ) : (
            <>
              {options.map((option) => (
                <Row
                  key={option.key}
                  type="button"
                  $on={notifications[option.key]}
                  onClick={() => toggle(option.key)}
                >
                  <div>
                    <RowTitle>{option.title}</RowTitle>
                    <RowText>{option.text}</RowText>
                  </div>
                  <Switch $on={notifications[option.key]}>
                    <Knob $on={notifications[option.key]} />
                  </Switch>
                </Row>
              ))}
              <Notice>Saved settings update the profile Account panel immediately after refresh.</Notice>
              <SaveButton disabled={!dirty || saving} onClick={save}>
                {saving ? 'Saving...' : dirty ? 'Save preferences' : 'Saved'}
              </SaveButton>
            </>
          )}
        </Panel>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
