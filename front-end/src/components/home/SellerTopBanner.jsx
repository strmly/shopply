import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useUser } from '../../context/UserContext';

const slide = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const Banner = styled.div`
  position: relative;
  background: linear-gradient(90deg, #ff2d55 0%, #ff6b35 50%, #ff2d55 100%);
  overflow: hidden;
  height: 36px;
  display: flex;
  align-items: center;

  @media (max-width: 520px) {
    height: 34px;
  }
`;

const Track = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  animation: ${slide} 28s linear infinite;
  will-change: transform;
`;

const Segment = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 clamp(18px, 8vw, 40px);
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

const BannerText = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.01em;

  @media (max-width: 520px) {
    font-size: 11px;
  }
`;

const BannerCta = styled.button`
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  border: none;
  background: #ffffff;
  color: #ff2d55;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  &:hover { opacity: 0.88; }
`;

const CloseBtn = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
  flex-shrink: 0;

  &:hover { background: rgba(255, 255, 255, 0.32); }
`;

const MESSAGES = [
  { text: 'Start selling on Shopply — list in 5 minutes, reach buyers near you.', cta: 'Start now' },
  { text: '500+ local sellers. Free to list. Instant payouts.' },
  { text: 'Turn your space into income — furniture sells fast on Shopply.', cta: 'Become a seller' },
  { text: 'Join local sellers making R2.4M+ per month on Shopply.' },
];

const STORAGE_KEY = 'shopply_seller_banner_dismissed';

export const SellerTopBanner = () => {
  const navigate = useNavigate();
  const { role } = useUser();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === '1'
  );

  if (dismissed || role === 'seller' || role === 'admin') return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  const repeated = [...MESSAGES, ...MESSAGES];

  return (
    <Banner>
      <Track>
        {repeated.map((msg, i) => (
          <Segment key={i}>
            <Dot />
            <BannerText>{msg.text}</BannerText>
            {msg.cta && (
              <BannerCta onClick={() => navigate('/become-a-seller')}>
                {msg.cta}
              </BannerCta>
            )}
          </Segment>
        ))}
      </Track>
      <CloseBtn onClick={handleDismiss} aria-label="Dismiss">×</CloseBtn>
    </Banner>
  );
};
