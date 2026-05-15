import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useUser } from '../../context/UserContext';

const shimmer = keyframes`
  0% { transform: translateX(-100%) rotate(20deg); }
  100% { transform: translateX(300%) rotate(20deg); }
`;

/* ─── Compact strip ───────────────────────────────────── */

const CompactWrap = styled.div`
  margin: 0 clamp(14px, 5vw, 48px) 34px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background:
    linear-gradient(115deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 18px 44px rgba(15, 52, 96, 0.32);

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -10px;
    width: 80px;
    height: 160px;
    background: rgba(255, 255, 255, 0.06);
    animation: ${shimmer} 3.5s ease-in-out infinite;
    pointer-events: none;
  }

  @media (max-width: 560px) {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    padding: 14px;
    border-radius: 18px;
  }
`;

const CompactIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(245, 158, 11, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #f59e0b;
`;

const CompactCopy = styled.div`
  min-width: 0;
`;

const CompactTitle = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CompactSub = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.52);
  margin-top: 2px;
  overflow-wrap: anywhere;
`;

const CompactBtn = styled.button`
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: none;
  background: #f59e0b;
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(245, 158, 11, 0.4);

  &:hover {
    background: #fbbf24;
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(245, 158, 11, 0.48);
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export function SellerBannerCompact() {
  const navigate = useNavigate();
  const { role } = useUser();
  if (role === 'seller' || role === 'admin') return null;
  return (
    <CompactWrap onClick={() => navigate('/become-a-seller')} style={{ cursor: 'pointer' }}>
      <CompactIcon><StoreIcon /></CompactIcon>
      <CompactCopy>
        <CompactTitle>Have furniture to sell?</CompactTitle>
        <CompactSub>Join 500+ sellers — list your pieces, reach local buyers.</CompactSub>
      </CompactCopy>
      <CompactBtn onClick={e => { e.stopPropagation(); navigate('/become-a-seller'); }}>
        Start selling
      </CompactBtn>
    </CompactWrap>
  );
}

/* ─── Full banner ─────────────────────────────────────── */

const FullWrap = styled.div`
  margin: 0 clamp(14px, 5vw, 48px) 34px;
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 36px 32px;
  background: linear-gradient(130deg, #0f172a 0%, #1e293b 55%, #0f3460 100%);
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.38);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    padding: 28px 24px;
  }

  @media (max-width: 420px) {
    padding: 22px 18px;
    border-radius: 24px;
  }
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
`;

const Blob1 = styled(Blob)`
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%);
  right: -60px;
  top: -80px;
`;

const Blob2 = styled(Blob)`
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(61,129,239,0.22), transparent 70%);
  left: -40px;
  bottom: -60px;
`;

const FullLeft = styled.div`
  position: relative;
  z-index: 1;
`;

const FullEyebrow = styled.div`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #f59e0b;
  margin-bottom: 10px;
`;

const FullTitle = styled.h2`
  margin: 0 0 12px;
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 900;
  line-height: 1.05;
  color: #ffffff;

  @media (max-width: 420px) {
    font-size: 24px;
  }
`;

const FullSub = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.56);
  margin: 0 0 20px;
  max-width: 480px;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.span`
  font-size: 11px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 6px 12px;
`;

const FullRight = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 680px) {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }
`;

const StatBlock = styled.div`
  text-align: right;

  @media (max-width: 680px) {
    text-align: left;
    margin-right: 24px;
  }

  @media (max-width: 420px) {
    margin-right: 12px;
  }
`;

const StatNum = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.44);
  margin-top: 3px;
`;

const FullBtn = styled.button`
  height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #f59e0b, #ef7c00);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 12px 28px rgba(245, 158, 11, 0.42);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 36px rgba(245, 158, 11, 0.52);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LearnBtn = styled.button`
  height: 48px;
  padding: 0 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;

  &:hover {
    border-color: rgba(255, 255, 255, 0.38);
    color: #ffffff;
    transform: translateY(-1px);
  }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 520px) {
    width: 100%;
    flex-wrap: wrap;

    ${FullBtn},
    ${LearnBtn} {
      flex: 1 1 150px;
    }
  }
`;

export function SellerBannerFull() {
  const navigate = useNavigate();
  const { role } = useUser();
  if (role === 'seller' || role === 'admin') return null;
  return (
    <FullWrap>
      <Blob1 />
      <Blob2 />
      <FullLeft>
        <FullEyebrow>Sell on Shopply</FullEyebrow>
        <FullTitle>Turn your space<br />into income</FullTitle>
        <FullSub>
          List your pieces in minutes. Reach thousands of local buyers. Track every order from your seller dashboard.
        </FullSub>
        <Pills>
          <Pill>Free to list</Pill>
          <Pill>Instant payouts</Pill>
          <Pill>Local buyers</Pill>
          <Pill>Built-in analytics</Pill>
          <Pill>Delivery handled</Pill>
        </Pills>
      </FullLeft>
      <FullRight>
        <StatBlock>
          <StatNum>500+</StatNum>
          <StatLabel>active sellers</StatLabel>
        </StatBlock>
        <StatBlock>
          <StatNum>R2.4M</StatNum>
          <StatLabel>paid out this month</StatLabel>
        </StatBlock>
        <BtnRow>
          <FullBtn onClick={() => navigate('/become-a-seller')}>
            Become a seller
          </FullBtn>
          <LearnBtn onClick={() => navigate('/sell-on-shopply')}>
            Learn more
          </LearnBtn>
        </BtnRow>
      </FullRight>
    </FullWrap>
  );
}
