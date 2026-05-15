import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.article`
  position: relative;
  overflow: hidden;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  opacity: ${props => props.$status === 'active' ? 1 : 0.76};
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.22), rgba(228,231,236,0.9), rgba(245,158,11,0.16)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 22px);
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    right: -64px;
    top: -72px;
    width: 170px;
    height: 170px;
    border-radius: 999px;
    background: ${props => props.$expiringSoon ? 'rgba(245, 158, 11, 0.1)' : 'rgba(61, 129, 239, 0.08)'};
    pointer-events: none;
  }

  &:hover {
    transform: ${props => props.$clickable ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.$clickable ? '0 28px 58px rgba(16, 24, 40, 0.12)' : '0 20px 46px rgba(16, 24, 40, 0.08)'};
  }
`;

const TopRow = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;

  @media (max-width: 620px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const ValueMark = styled.div`
  min-width: 84px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 28px;
  font-weight: 900;
`;

const Title = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(18px, 4vw, 24px);
  line-height: 1.05;
  font-weight: 900;
`;

const Description = styled.p`
  margin: 8px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 6px 11px;
  border-radius: 999px;
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(228,231,236,0.95)'};
  font-size: 12px;
  font-weight: 900;

  @media (max-width: 620px) {
    grid-column: 1 / -1;
    width: fit-content;
  }
`;

const MetaRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Pill = styled.span`
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(228,231,236,0.95);
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const Hint = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 18px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 13px;
  font-weight: 900;
  text-align: center;
`;

const formatCountdown = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

export const VoucherCard = ({ voucher, onClick, showHint = false }) => {
  const [countdown, setCountdown] = useState(formatCountdown(voucher.expiresAt));

  useEffect(() => {
    if (voucher.status !== 'active') return undefined;
    const interval = setInterval(() => setCountdown(formatCountdown(voucher.expiresAt)), 30000);
    return () => clearInterval(interval);
  }, [voucher.expiresAt, voucher.status]);

  const value = voucher.type === 'percentage' ? `${voucher.value}%` : `R${Number(voucher.value || 0).toFixed(0)}`;
  const expiry = voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry';
  const conditions = [
    voucher.minPurchase > 0 ? `Min R${voucher.minPurchase}` : null,
    voucher.maxDiscount && voucher.type === 'percentage' ? `Max R${voucher.maxDiscount}` : null,
    voucher.code ? `Code ${voucher.code}` : null,
  ].filter(Boolean);
  const active = voucher.status === 'active';
  const expiringSoon = Boolean(voucher.isExpiringSoon);
  const statusText = active && expiringSoon ? 'Expiring soon' : active ? 'Active' : voucher.status === 'used' ? 'Used' : 'Expired';

  return (
    <Card
      $status={voucher.status}
      $expiringSoon={expiringSoon}
      $clickable={active && onClick}
      onClick={active && onClick ? onClick : undefined}
    >
      <TopRow>
        <ValueMark>{value}</ValueMark>
        <div>
          <Title>{voucher.title || 'Shopply voucher'}</Title>
          {voucher.description && <Description>{voucher.description}</Description>}
        </div>
        <Badge $active={active}>{statusText}</Badge>
      </TopRow>

      <MetaRow>
        <Pill>Expires {expiry}</Pill>
        {countdown && active && <Pill>{countdown}</Pill>}
        {conditions.map(condition => <Pill key={condition}>{condition}</Pill>)}
      </MetaRow>

      {showHint && active && <Hint>Tap to apply this voucher from your cart</Hint>}
    </Card>
  );
};
