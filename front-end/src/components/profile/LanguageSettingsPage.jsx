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
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 50%, #ffffff 100%);
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

const Option = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 15px;
  border-radius: 18px;
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.28)' : props.theme.colors.border.light};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : props.theme.colors.neutral[50]};
  text-align: left;
  cursor: pointer;
`;

const OptionTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
`;

const OptionText = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 750;
`;

const Badge = styled.span`
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.16);
  font-size: 11px;
  font-weight: 900;
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

const languages = [
  { code: 'en', label: 'English', text: 'Default Shopply language' },
  { code: 'af', label: 'Afrikaans', text: 'Afrikaanse voorkeure' },
  { code: 'zu', label: 'isiZulu', text: 'Izilungiselelo zolimi' },
  { code: 'xh', label: 'isiXhosa', text: 'Useto lolwimi' },
  { code: 'st', label: 'Sesotho', text: 'Dikgetho tsa puo' },
];

export const LanguageSettingsPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [initial, setInitial] = useState('en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/${USER_ID}/preferences`);
        const data = await response.json();
        if (data.success && data.data?.language) {
          setLanguage(data.data.language);
          setInitial(data.data.language);
        }
      } catch {
        toast.error('Could not load language');
      }
    };
    load();
  }, []);

  const save = async () => {
    if (language === initial || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${USER_ID}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not save language');
      setInitial(data.data.language || language);
      toast.success('Language saved');
    } catch (err) {
      toast.error(err.message || 'Could not save language');
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
            <Title>Language</Title>
            <Subtext>Choose the language Shopply should use for your account experience.</Subtext>
          </div>
        </Hero>

        <Panel>
          {languages.map((item) => (
            <Option key={item.code} $active={language === item.code} onClick={() => setLanguage(item.code)}>
              <div>
                <OptionTitle>{item.label}</OptionTitle>
                <OptionText>{item.text}</OptionText>
              </div>
              <Badge>{language === item.code ? 'Selected' : item.code.toUpperCase()}</Badge>
            </Option>
          ))}
          <SaveButton disabled={language === initial || saving} onClick={save}>
            {saving ? 'Saving...' : language === initial ? 'Saved' : 'Save language'}
          </SaveButton>
        </Panel>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
