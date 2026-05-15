import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import API_BASE_URL from '@config/api';
import { useUser } from '../../context/UserContext';
import { clearAuthUser, getAuthUser } from '../../utils/authState';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';

/* ─── Animations ──────────────────────────────────────── */

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

/* ─── Skeleton system ─────────────────────────────────── */

const SkeletonBlock = styled.div`
  border-radius: ${p => p.$r || '10px'};
  height: ${p => p.$h || '16px'};
  width: ${p => p.$w || '100%'};
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    rgba(228,231,236,0.7) 25%,
    rgba(243,245,249,0.95) 50%,
    rgba(228,231,236,0.7) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;
`;

const SkeletonHeroWrap = styled.div`
  display: grid;
  grid-template-columns: minmax(0,1fr) auto;
  gap: 24px;
  padding: clamp(18px,3vw,32px);
  border-radius: 28px;
  background: rgba(243,245,249,0.6);
  border: 1px solid rgba(228,231,236,0.8);
  @media (max-width: 780px) { grid-template-columns: 1fr; }
`;

const SkeletonHeroLeft = styled.div`display: grid; gap: 18px;`;

const SkeletonIdentityRow = styled.div`
  display: flex; align-items: center; gap: 16px;
`;

const SkeletonHeroCard = styled.div`
  width: min(330px,100%);
  padding: 20px;
  border-radius: 24px;
  background: rgba(243,245,249,0.6);
  border: 1px solid rgba(228,231,236,0.8);
  display: grid; gap: 12px;
  @media (max-width: 780px) { width: 100%; }
`;

const SkeletonStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(6,minmax(0,1fr));
  gap: 10px; margin: 14px 0 18px;
  @media (max-width: 960px) { grid-template-columns: repeat(3,minmax(0,1fr)); }
  @media (max-width: 520px)  { grid-template-columns: repeat(3,minmax(0,1fr)); }
`;

const SkeletonStatCard = styled.div`
  padding: 16px 14px;
  border-radius: 18px;
  background: rgba(243,245,249,0.7);
  border: 1px solid rgba(228,231,236,0.8);
  display: grid; gap: 10px;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0,1.35fr) minmax(280px,0.65fr);
  gap: 16px;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;

const SkeletonColumn = styled.div`display: grid; gap: 16px; align-content: start;`;

const SkeletonPanel = styled.div`
  padding: clamp(16px,2.4vw,22px);
  border-radius: 24px;
  background: rgba(243,245,249,0.6);
  border: 1px solid rgba(228,231,236,0.8);
  display: grid; gap: 14px;
`;

const SkeletonActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 10px;
  @media (max-width: 680px) { grid-template-columns: repeat(2,1fr); }
`;

const SkeletonActionCard = styled.div`
  padding: 15px;
  border-radius: 18px;
  background: rgba(228,231,236,0.4);
  border: 1px solid rgba(228,231,236,0.7);
  display: grid; gap: 10px; min-height: 130px;
  align-content: start;
`;

const SkeletonOrderRow = styled.div`
  padding: 14px;
  border-radius: 16px;
  background: rgba(228,231,236,0.35);
  display: grid; gap: 8px;
`;

/* ─── SVG icon system ─────────────────────────────────── */

const Svg = ({ size = 20, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const BagIcon     = () => <Svg><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></Svg>;
const PackageIcon = () => <Svg><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Svg>;
const PinIcon     = () => <Svg><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const CardIcon    = () => <Svg><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></Svg>;
const TagIcon     = () => <Svg><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Svg>;
const StarIcon    = () => <Svg><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>;
const StoreIcon   = () => <Svg><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>;
const DashIcon    = () => <Svg><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Svg>;
const BoxIcon     = () => <Svg><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></Svg>;
const ChartIcon   = () => <Svg><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Svg>;
const MsgIcon     = () => <Svg><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Svg>;
const ShieldIcon  = () => <Svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>;
const ListIcon    = () => <Svg><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></Svg>;
const PlusIcon    = () => <Svg><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>;
const ZapIcon     = () => <Svg><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>;
const ChevronIcon = () => <Svg size={16}><polyline points="9 18 15 12 9 6"/></Svg>;
const EditIcon    = () => <Svg size={16}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>;
const LockIcon    = () => <Svg size={16}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Svg>;
const BellIcon    = () => <Svg size={16}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></Svg>;
const GlobeIcon   = () => <Svg size={16}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></Svg>;
const MoonIcon    = () => <Svg size={16}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></Svg>;
const HelpIcon    = () => <Svg size={16}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const FileIcon    = () => <Svg size={16}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></Svg>;
const SignOutIcon = () => <Svg size={16}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>;

const ACTION_ICONS = {
  shop:      BagIcon,
  orders:    PackageIcon,
  addresses: PinIcon,
  payments:  CardIcon,
  vouchers:  TagIcon,
  reviews:   StarIcon,
  seller:    StoreIcon,
  dashboard: DashIcon,
  products:  BoxIcon,
  analytics: ChartIcon,
  messages:  MsgIcon,
  admin:     ShieldIcon,
  allorders: ListIcon,
  become:    PlusIcon,
  promotions: ZapIcon,
};

const ROW_ICONS = {
  '/account/edit-profile':   EditIcon,
  '/account/change-password': LockIcon,
  '/account/notifications':  BellIcon,
  '/account/language':       GlobeIcon,
  '/account/theme':          MoonIcon,
  '/support/help':           HelpIcon,
  '/legal':                  FileIcon,
};

/* ─── Layout ──────────────────────────────────────────── */

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 48%, #ffffff 100%);
  animation: ${fadeIn} 0.4s ease;
  padding-bottom: 104px;
`;

const Shell = styled.main`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 28px;
  @media (max-width: 640px) { width: min(100% - 22px, 1180px); padding-top: 12px; }
`;

/* ─── Hero ────────────────────────────────────────────── */

const Hero = styled.section`
  position: relative; overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px; align-items: stretch;
  padding: clamp(18px, 3vw, 32px);
  border: 1px solid transparent; border-radius: 28px;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98) 0%, rgba(241,247,255,0.96) 55%, rgba(243,240,254,0.92) 100%) padding-box,
    ${p => p.theme.colors.gradient.primary} border-box;
  box-shadow: 0 24px 68px rgba(16,24,40,0.11);
  animation: ${slideUp} 0.35s ease;
  @media (max-width: 780px) { grid-template-columns: 1fr; }
`;

const HeroLeft = styled.div`
  position: relative; z-index: 1;
  display: grid; gap: 16px; min-width: 0;
`;

const ProfileIdentity = styled.div`
  display: grid; grid-template-columns: auto minmax(0, 1fr);
  gap: 16px; align-items: center;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const Avatar = styled.div`
  width: 86px; height: 86px; border-radius: 24px;
  display: grid; place-items: center; overflow: hidden;
  background: ${p => p.theme.colors.gradient.primary};
  color: ${p => p.theme.colors.text.inverse};
  font-size: 34px; font-weight: 900;
  box-shadow: 0 18px 42px rgba(61,129,239,0.24);
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Eyebrow = styled.div`
  display: inline-flex; width: fit-content;
  align-items: center; gap: 8px; margin-bottom: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(61,129,239,0.14); border-radius: 999px;
  color: ${p => p.theme.colors.primarySoftText};
  background: rgba(255,255,255,0.78);
  font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px;
`;

const StatusDot = styled.span`
  width: 7px; height: 7px; border-radius: 999px;
  background: ${p =>
    p.$role === 'admin'  ? '#a855f7' :
    p.$role === 'seller' ? '#f59e0b' :
    p.theme.colors.successBase};
  box-shadow: 0 0 0 3px ${p =>
    p.$role === 'admin'  ? 'rgba(168,85,247,0.18)' :
    p.$role === 'seller' ? 'rgba(245,158,11,0.18)' :
    'rgba(34,197,94,0.18)'};
`;

const RoleBadge = styled.span`
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 900; text-transform: uppercase;
  background: ${p =>
    p.$role === 'admin'  ? 'rgba(168,85,247,0.12)' :
    p.$role === 'seller' ? 'rgba(245,158,11,0.12)' :
    'rgba(61,129,239,0.1)'};
  color: ${p =>
    p.$role === 'admin'  ? '#7c3aed' :
    p.$role === 'seller' ? '#d97706' :
    p.theme.colors.primary};
  border: 1px solid ${p =>
    p.$role === 'admin'  ? 'rgba(168,85,247,0.25)' :
    p.$role === 'seller' ? 'rgba(245,158,11,0.25)' :
    'rgba(61,129,239,0.18)'};
`;

const Title = styled.h1`
  margin: 0 0 8px;
  color: ${p => p.theme.colors.text.primary};
  font-size: clamp(28px, 5.5vw, 52px);
  line-height: 1.02; letter-spacing: -0.5px; font-weight: 950;
  overflow-wrap: anywhere;
`;

const Contact = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px;
  color: ${p => p.theme.colors.text.secondary};
  font-size: 13px; font-weight: 800;
`;

const Pill = styled.span`
  display: inline-flex; align-items: center;
  min-height: 30px; padding: 5px 10px;
  border: 1px solid ${p => p.theme.colors.border.default};
  border-radius: 999px; background: #ffffff;
  color: ${p => p.theme.colors.text.primary}; font-weight: 800; font-size: 12px;
`;

/* ─── Profile completeness (buyer only) ───────────────── */

const CompletenessRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;
`;

const CompLabel = styled.div`
  font-size: 11px; font-weight: 900; margin-bottom: 5px;
  color: ${p => p.theme.colors.text.secondary};
  text-transform: uppercase; letter-spacing: 0.3px;
`;

const CompPill = styled.button`
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 999px; cursor: pointer;
  border: 1px solid ${p => p.$done ? 'rgba(34,197,94,0.3)' : 'rgba(228,231,236,0.9)'};
  background: ${p => p.$done ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.6)'};
  color: ${p => p.$done ? '#16a34a' : p.theme.colors.text.tertiary};
  font-size: 11px; font-weight: 900;
  transition: all 0.15s;
  &:hover { border-color: ${p => p.$done ? 'rgba(34,197,94,0.5)' : 'rgba(61,129,239,0.3)'}; }
`;

const CompDot = styled.span`
  width: 6px; height: 6px; border-radius: 999px;
  background: ${p => p.$done ? '#22c55e' : 'rgba(200,205,215,0.9)'};
`;

/* ─── Hero actions ────────────────────────────────────── */

const HeroActions = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
`;

const PrimaryButton = styled.button`
  min-height: 44px; padding: 0 20px;
  border: none; border-radius: 999px;
  background: ${p => p.theme.colors.gradient.primary};
  color: #fff; font-weight: 900; cursor: pointer; font-size: 14px;
  box-shadow: 0 12px 28px rgba(61,129,239,0.24);
  transition: all 0.2s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 18px 38px rgba(61,129,239,0.3); }
`;

const SecondaryButton = styled.button`
  min-height: 44px; padding: 0 18px;
  border: 1px solid rgba(61,129,239,0.2); border-radius: 999px;
  background: #ffffff; color: ${p => p.theme.colors.primarySoftText};
  font-weight: 900; cursor: pointer; font-size: 14px;
  transition: all 0.2s ease;
  &:hover { transform: translateY(-2px); border-color: ${p => p.theme.colors.primary}; background: ${p => p.theme.colors.primarySoftBg}; }
`;

const SignOutBtn = styled.button`
  margin-left: auto;
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: none;
  color: ${p => p.theme.colors.text.secondary};
  font-size: 13px; font-weight: 900; cursor: pointer;
  padding: 8px 4px; border-radius: 8px;
  transition: color 0.15s;
  &:hover { color: #c62850; }
`;

/* ─── Hero card ───────────────────────────────────────── */

const HeroCard = styled.aside`
  position: relative; z-index: 1;
  width: min(300px, 100%);
  display: grid; align-content: space-between;
  gap: 16px; padding: 20px; border-radius: 24px;
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(61,129,239,0.14);
  box-shadow: 0 18px 44px rgba(16,24,40,0.08);
  @media (max-width: 780px) { width: 100%; }
`;

const MiniLabel = styled.div`
  font-size: 10.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px;
  color: ${p => p.theme.colors.text.secondary}; margin-bottom: 6px;
`;

const MiniTitle = styled.div`
  color: ${p => p.theme.colors.text.primary};
  font-size: 22px; line-height: 1.12; font-weight: 950; margin-bottom: 6px;
`;

const MiniText = styled.div`
  color: ${p => p.theme.colors.text.secondary};
  font-size: 13px; line-height: 1.5; font-weight: 700;
`;

/* ─── Stats ───────────────────────────────────────────── */

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px; margin: 14px 0 18px;
  @media (max-width: 960px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 520px)  { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`;

const StatCard = styled.button`
  padding: 16px 14px;
  border: 1.5px solid ${p => p.theme.colors.border.default};
  border-radius: 18px; background: #ffffff;
  box-shadow: 0 4px 16px rgba(16,24,40,0.06);
  text-align: left; cursor: pointer;
  transition: all 0.2s ease;
  animation: ${slideUp} 0.4s ease both;
  animation-delay: ${p => p.$i * 40}ms;
  &:hover {
    transform: translateY(-3px);
    border-color: rgba(61,129,239,0.3);
    background: ${p => p.theme.colors.primarySoftBg};
    box-shadow: 0 10px 28px rgba(61,129,239,0.1);
  }
`;

const StatValue = styled.div`
  color: ${p => p.theme.colors.primarySoftText};
  font-size: 28px; line-height: 1; font-weight: 950;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  color: ${p => p.theme.colors.text.secondary};
  font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px;
`;

/* ─── Two-column grid ─────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 16px;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;

const Column = styled.div`display: grid; align-content: start; gap: 16px;`;

/* ─── Panels ──────────────────────────────────────────── */

const Panel = styled.section`
  border: 1px solid ${p => p.theme.colors.border.default};
  border-radius: 24px; background: #ffffff;
  box-shadow: 0 8px 32px rgba(16,24,40,0.07);
  padding: clamp(16px, 2.4vw, 22px);
  animation: ${slideUp} 0.4s ease;
`;

const PanelHeader = styled.div`
  display: flex; justify-content: space-between;
  gap: 14px; align-items: center; margin-bottom: 16px;
`;

const PanelTitle = styled.h2`
  margin: 0; color: ${p => p.theme.colors.text.primary};
  font-size: 20px; line-height: 1.15; font-weight: 950;
`;

const PanelBadge = styled.span`
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 900;
  background: rgba(168,85,247,0.1);
  color: #7c3aed;
  border: 1px solid rgba(168,85,247,0.2);
`;

const TextButton = styled.button`
  border: 1px solid rgba(61,129,239,0.16); border-radius: 999px;
  background: ${p => p.theme.colors.primarySoftBg};
  color: ${p => p.theme.colors.primarySoftText};
  padding: 7px 13px; font-weight: 900; font-size: 12px; cursor: pointer; white-space: nowrap;
  transition: all 0.15s;
  &:hover { border-color: ${p => p.theme.colors.primary}; transform: translateY(-1px); }
`;

/* ─── Quick action cards ──────────────────────────────── */

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 680px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 420px) { grid-template-columns: 1fr; }
`;

const ActionCard = styled.button`
  display: grid; align-content: start; gap: 10px;
  min-height: 140px; padding: 14px; text-align: left;
  border: 1.5px solid ${p => p.$highlight ? 'rgba(168,85,247,0.22)' : p.theme.colors.border.default};
  border-radius: 18px;
  background: ${p => p.$highlight
    ? 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(99,102,241,0.04) 100%)'
    : p.theme.colors.gradient.soft};
  cursor: pointer; transition: all 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    border-color: ${p => p.$highlight ? 'rgba(168,85,247,0.42)' : 'rgba(61,129,239,0.32)'};
    box-shadow: 0 14px 32px ${p => p.$highlight ? 'rgba(168,85,247,0.12)' : 'rgba(61,129,239,0.1)'};
  }
`;

const IconBox = styled.span`
  width: 42px; height: 42px; display: grid; place-items: center;
  border-radius: 14px; background: #ffffff;
  color: ${p => p.$purple ? '#7c3aed' : p.theme.colors.primarySoftText};
  border: 1px solid ${p => p.$purple ? 'rgba(168,85,247,0.22)' : 'rgba(61,129,239,0.14)'};
  box-shadow: 0 2px 8px rgba(16,24,40,0.06);
`;

const MetricBadge = styled.span`
  min-height: 24px; display: inline-flex; align-items: center;
  padding: 0 8px; border-radius: 999px;
  background: #ffffff; color: ${p => p.theme.colors.primarySoftText};
  border: 1px solid rgba(61,129,239,0.14);
  font-size: 11px; font-weight: 900;
`;

const CardTitle = styled.div`
  color: ${p => p.theme.colors.text.primary};
  font-weight: 950; font-size: 13.5px; line-height: 1.3;
`;

const CardText = styled.div`
  color: ${p => p.theme.colors.text.secondary};
  font-size: 11.5px; line-height: 1.4; font-weight: 750;
`;

/* ─── List rows ───────────────────────────────────────── */

const List = styled.div`display: grid; gap: 8px;`;

const RowButton = styled.button`
  width: 100%; display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px; align-items: center; padding: 13px 14px;
  border: 1px solid ${p => p.theme.colors.border.light};
  border-radius: 14px;
  background: ${p => p.$tone === 'soft' ? p.theme.colors.primarySoftBg : p.theme.colors.neutral[50]};
  text-align: left; cursor: pointer; transition: all 0.15s;
  &:hover { transform: translateX(3px); border-color: rgba(61,129,239,0.26); background: ${p => p.theme.colors.primarySoftBg}; }
`;

const RowIconBox = styled.span`
  width: 32px; height: 32px; display: grid; place-items: center;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid rgba(61,129,239,0.12);
  color: ${p => p.theme.colors.primarySoftText};
  flex-shrink: 0;
`;

const RowTitle = styled.div`
  color: ${p => p.theme.colors.text.primary};
  font-size: 13.5px; font-weight: 900;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const RowMeta = styled.div`
  margin-top: 2px; color: ${p => p.theme.colors.text.secondary};
  font-size: 11.5px; font-weight: 750;
`;

const RowStatus = styled.span`
  display: inline-flex; align-items: center; flex-shrink: 0;
  min-height: 26px; padding: 0 9px; border-radius: 999px;
  background: ${p => p.theme.colors.primarySoftBg};
  color: ${p => p.theme.colors.primarySoftText};
  border: 1px solid rgba(61,129,239,0.14);
  font-size: 11px; font-weight: 900;
`;

const Chevron = styled.span`
  color: ${p => p.theme.colors.text.tertiary};
  display: flex; align-items: center;
`;

/* ─── Empty orders ────────────────────────────────────── */

const EmptyWrap = styled.div`
  display: grid; place-items: center; gap: 10px;
  padding: 32px 20px; text-align: center;
`;

const EmptyEmoji = styled.div`font-size: 40px; line-height: 1;`;

const EmptyTitle = styled.div`
  font-size: 16px; font-weight: 950;
  color: ${p => p.theme.colors.text.primary};
`;

const EmptySubtext = styled.div`
  font-size: 13px; font-weight: 700; line-height: 1.5;
  color: ${p => p.theme.colors.text.secondary};
  max-width: 260px;
`;

/* ─── Upsell panel (buyers only) ─────────────────────── */

const UpsellPanel = styled.section`
  border-radius: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #d1fae5 100%);
  border: 1px solid rgba(34,197,94,0.22);
  box-shadow: 0 8px 32px rgba(34,197,94,0.1);
  padding: clamp(16px, 2.4vw, 22px);
  overflow: hidden; position: relative;
  animation: ${slideUp} 0.4s ease;
`;

const UpsellHeader = styled.div`
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 14px;
`;

const UpsellTitle = styled.h2`
  margin: 0; font-size: 20px; font-weight: 950;
  color: #14532d;
`;

const UpsellBadge = styled.span`
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 900;
  background: rgba(34,197,94,0.15);
  color: #15803d;
  border: 1px solid rgba(34,197,94,0.25);
`;

const UpsellRow = styled.button`
  width: 100%; display: grid;
  grid-template-columns: auto minmax(0,1fr) auto;
  gap: 12px; align-items: center; padding: 12px 14px;
  border: 1px solid rgba(34,197,94,0.18);
  border-radius: 14px;
  background: rgba(255,255,255,0.7);
  text-align: left; cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(255,255,255,0.9); border-color: rgba(34,197,94,0.35); transform: translateX(3px); }
`;

const UpsellIconBox = styled.span`
  width: 32px; height: 32px; display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(34,197,94,0.2);
  color: #15803d;
`;

const UpsellRowTitle = styled.div`
  font-size: 13.5px; font-weight: 900; color: #14532d;
`;
const UpsellRowMeta = styled.div`
  font-size: 11.5px; font-weight: 750; margin-top: 2px; color: #166534;
`;
const UpsellChevron = styled.span`color: #16a34a; display: flex; align-items: center;`;

/* ─── Guest state ─────────────────────────────────────── */

const GuestHero = styled.section`
  display: grid; place-items: center; text-align: center; gap: 20px;
  padding: clamp(48px, 7vw, 80px) clamp(24px, 5vw, 64px);
  border: 1px solid transparent; border-radius: 28px;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98) 0%, rgba(241,247,255,0.96) 55%, rgba(243,240,254,0.92) 100%) padding-box,
    ${p => p.theme.colors.gradient.primary} border-box;
  box-shadow: 0 24px 68px rgba(16,24,40,0.11);
  animation: ${slideUp} 0.35s ease;
`;

const GuestEyebrow = styled.div`
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(61,129,239,0.16);
  color: ${p => p.theme.colors.primarySoftText};
  font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px;
`;

const GuestTitle = styled.h1`
  margin: 0; font-size: clamp(32px, 6.5vw, 56px);
  font-weight: 950; line-height: 1.05; letter-spacing: -0.5px;
  color: ${p => p.theme.colors.text.primary};
`;

const GuestSub = styled.p`
  margin: 0; max-width: 460px;
  font-size: 16px; font-weight: 700; line-height: 1.6;
  color: ${p => p.theme.colors.text.secondary};
`;

const GuestActions = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
`;

const BenefitsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const BenefitCard = styled.div`
  padding: 22px 18px;
  border: 1px solid ${p => p.theme.colors.border.default};
  border-radius: 22px; background: #ffffff;
  box-shadow: 0 8px 24px rgba(16,24,40,0.06);
  animation: ${slideUp} 0.4s ease both;
  animation-delay: ${p => p.$i * 60}ms;
`;

const BenefitIcon = styled.div`
  width: 46px; height: 46px; display: grid; place-items: center;
  border-radius: 15px; margin-bottom: 14px;
  background: ${p => p.theme.colors.primarySoftBg};
  color: ${p => p.theme.colors.primary};
  font-size: 22px;
`;

const BenefitTitle = styled.div`
  font-size: 15px; font-weight: 950; margin-bottom: 5px;
  color: ${p => p.theme.colors.text.primary};
`;

const BenefitText = styled.div`
  font-size: 13px; font-weight: 700; line-height: 1.5;
  color: ${p => p.theme.colors.text.secondary};
`;

/* ─── Error ───────────────────────────────────────────── */

const ErrorBox = styled.div`
  margin-bottom: 14px; padding: 12px 16px; border-radius: 16px;
  border: 1px solid ${p => p.theme.colors.danger[200]};
  color: ${p => p.theme.colors.danger[600]};
  background: ${p => p.theme.colors.danger[100]}; font-weight: 850;
`;

const DangerPanel = styled.div`
  padding: 18px 20px;
  border: 1px solid rgba(198,40,80,0.18);
  border-radius: 20px;
  background: rgba(255,245,248,0.7);
`;

const DangerTitle = styled.div`
  font-size: 13px; font-weight: 950; color: #c62850; margin-bottom: 4px;
`;

const DangerText = styled.div`
  font-size: 12px; font-weight: 700; color: #9b2040; line-height: 1.5; margin-bottom: 14px;
`;

const DangerBtn = styled.button`
  min-height: 40px; padding: 0 18px;
  border: 1.5px solid rgba(198,40,80,0.5); border-radius: 999px;
  background: transparent; color: #c62850;
  font-size: 13px; font-weight: 900; cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover:not(:disabled) { background: #c62850; color: #fff; }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const DangerConfirmRow = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px;
`;

const DangerConfirmBtn = styled.button`
  min-height: 40px; padding: 0 18px;
  border: 0; border-radius: 999px;
  background: #c62850; color: #fff;
  font-size: 13px; font-weight: 900; cursor: pointer;
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const DangerCancelBtn = styled.button`
  min-height: 40px; padding: 0 18px;
  border: 1.5px solid rgba(228,231,236,0.9); border-radius: 999px;
  background: transparent; color: ${p => p.theme.colors.text.secondary};
  font-size: 13px; font-weight: 900; cursor: pointer;
`;

/* ─── Helpers ─────────────────────────────────────────── */

const fmt = (v) => `R${Number(v || 0).toFixed(2)}`;

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'S';

/* ─── Component ───────────────────────────────────────── */

export const ProfilePage = ({ location }) => {
  const navigate = useNavigate();
  const { user, loading: userLoading, role } = useUser();

  const isGuest  = role === 'guest';
  const isBuyer  = role === 'buyer';
  const isSeller = role === 'seller';
  const isAdmin  = role === 'admin';

  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const getUserId = () => getAuthUser()?.id || 'default';

  const loadProfile = async () => {
    try {
      setLoading(true); setError('');
      const res  = await fetch(`${API_BASE_URL}/profile/${getUserId()}/summary`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Profile could not be loaded');
      setSummary(data.data);
    } catch (err) {
      setError(err.message || 'Profile could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;
    if (isGuest) { setLoading(false); return; }
    loadProfile();
  }, [userLoading, role]);

  /* ── Derived ──────────────────────────────────────── */

  const profileUser   = user || {};
  const stats         = summary?.stats || {};
  const orders        = summary?.orders || [];
  const userName      = profileUser.name || 'Shopper';
  const locationLabel = summary?.defaultAddress?.suburb || location?.suburb || 'Sandton';

  /* ── Profile completeness (buyers) ───────────────── */

  const completeness = useMemo(() => [
    { label: 'Name',    done: !!profileUser.name && profileUser.name !== 'Shopper', route: '/account/edit-profile' },
    { label: 'Email',   done: !!profileUser.email,   route: '/account/edit-profile' },
    { label: 'Phone',   done: !!profileUser.mobile,  route: '/account/edit-profile' },
    { label: 'Address', done: !!summary?.defaultAddress, route: '/addresses' },
  ], [profileUser, summary]);

  const completedCount = completeness.filter(c => c.done).length;

  /* ── Stats per role ───────────────────────────────── */

  const statItems = useMemo(() => {
    if (isAdmin) {
      return [
        { label: 'My orders',   value: stats.orders       || 0,   route: '/orders' },
        { label: 'All orders',  value: stats.sellerOrders || 0,   route: '/admin' },
        { label: 'Products',    value: stats.products     || 0,   route: '/seller/products' },
        { label: 'Revenue',     value: `R${stats.revenue  || 0}`, route: '/seller/analytics' },
        { label: 'Messages',    value: stats.messages     || 0,   route: '/seller/messages' },
        { label: 'Reviews',     value: stats.reviews      || 0,   route: '/reviews' },
      ];
    }
    if (isSeller) {
      return [
        { label: 'My orders',    value: stats.orders       || 0,   route: '/orders' },
        { label: 'Store orders', value: stats.sellerOrders || 0,   route: '/seller/orders' },
        { label: 'Products',     value: stats.products     || 0,   route: '/seller/products' },
        { label: 'Revenue',      value: `R${stats.revenue  || 0}`, route: '/seller/analytics' },
        { label: 'Messages',     value: stats.messages     || 0,   route: '/seller/messages' },
        { label: 'Reviews',      value: stats.reviews      || 0,   route: '/reviews' },
      ];
    }
    return [
      { label: 'Orders',    value: stats.orders         || 0, route: '/orders' },
      { label: 'Active',    value: stats.activeOrders   || 0, route: '/orders?filter=active' },
      { label: 'Addresses', value: stats.savedAddresses || 0, route: '/addresses' },
      { label: 'Vouchers',  value: stats.activeVouchers || 0, route: '/vouchers' },
      { label: 'Reviews',   value: stats.reviews        || 0, route: '/reviews' },
    ];
  }, [role, stats]);

  /* ── Quick actions per role ───────────────────────── */

  const quickActions = useMemo(() => {
    if (isAdmin) return [
      { iconKey: 'admin',      title: 'Admin panel',      text: 'Platform management and settings',                          route: '/admin',            highlight: true  },
      { iconKey: 'allorders',  title: 'All orders',       text: 'Every order across the platform',                           route: '/admin',            highlight: true  },
      { iconKey: 'dashboard',  title: 'Seller dashboard', text: summary?.seller?.storeName || 'Open your seller workspace',  route: '/seller/dashboard', highlight: false },
      { iconKey: 'products',   title: 'Products',         text: 'Manage all product listings',                               route: '/seller/products',  highlight: false },
      { iconKey: 'analytics',  title: 'Analytics',        text: 'Sales, traffic, and conversions',                           route: '/seller/analytics', highlight: false },
      { iconKey: 'messages',   title: 'Messages',         text: 'Buyer conversations',                                       route: '/seller/messages',  highlight: false },
      { iconKey: 'orders',     title: 'My orders',        text: 'Track and reorder purchases',                               route: '/orders',           highlight: false },
    ];
    if (isSeller) return [
      { iconKey: 'shop',       title: 'Shop nearby',      text: 'Explore products near you',                                                 route: '/search',           highlight: false },
      { iconKey: 'orders',     title: 'My orders',        text: 'Track and reorder your purchases',                                          route: '/orders',           highlight: false },
      { iconKey: 'dashboard',  title: 'Seller dashboard', text: summary?.seller?.storeName || 'Open your seller workspace',                  route: '/seller/dashboard', highlight: false },
      { iconKey: 'products',   title: 'Products',         text: 'Add, edit, and promote listings',                                           route: '/seller/products',  highlight: false },
      { iconKey: 'analytics',  title: 'Analytics',        text: 'Sales data and performance',                                                route: '/seller/analytics', highlight: false },
      { iconKey: 'messages',   title: 'Messages',         text: 'Buyer conversations and support',                                           route: '/seller/messages',  highlight: false },
      { iconKey: 'allorders',  title: 'Seller orders',    text: 'Orders placed through your store',                                          route: '/seller/orders',    highlight: false },
    ];
    return [
      { iconKey: 'shop',      title: 'Shop nearby',     text: 'Search refined finds near you',                              metric: 'Nearby', route: '/search' },
      { iconKey: 'orders',    title: 'My orders',       text: summary?.orderSummary?.subtext || 'Track and reorder faster',                  route: '/orders' },
      { iconKey: 'addresses', title: 'Addresses',       text: summary?.defaultAddress ? `${summary.defaultAddress.label || 'Default'} · ${summary.defaultAddress.suburb || locationLabel}` : 'Add a delivery address', route: '/addresses' },
      { iconKey: 'vouchers',  title: 'Vouchers',        text: `${stats.activeVouchers || 0} active rewards`,                                route: '/vouchers' },
      { iconKey: 'reviews',   title: 'Reviews',         text: `${stats.pendingReviews || 0} waiting for feedback`,                          route: '/reviews' },
      { iconKey: 'become',    title: 'Become a seller', text: 'Open your own store on Shopply',                                             route: '/become-a-seller' },
    ];
  }, [role, summary, stats, locationLabel]);

  /* ── Account & preference rows ───────────────────── */

  const accountActions = [
    { title: 'Edit profile',  text: 'Name, phone, email, and avatar',     route: '/account/edit-profile' },
    { title: 'Password',      text: 'Update your sign-in password',        route: '/account/change-password' },
    { title: 'Notifications', text: 'Order updates, deals, and reminders', route: '/account/notifications' },
  ];

  const preferenceActions = [
    { title: 'Language',       text: summary?.preferences?.language || 'English', route: '/account/language' },
    { title: 'Theme',          text: summary?.preferences?.theme    || 'System',  route: '/account/theme' },
    { title: 'Help & support', text: 'Orders, returns, and sellers',               route: '/support/help' },
    { title: 'Legal',          text: 'Terms, privacy policy, licenses',            route: '/legal' },
  ];

  /* ── Hero card per role ───────────────────────────── */

  const heroCard = useMemo(() => {
    if (isAdmin) return {
      label: 'Platform administrator',
      title: 'Full platform access',
      text:  'Manage sellers, orders, and all platform settings.',
      cta:   'Admin dashboard', ctaRoute: '/admin',
    };
    if (isSeller) return {
      label: 'Your store',
      title: summary?.seller?.storeName || 'Seller workspace',
      text:  summary?.seller?.status
        ? `Store is ${summary.seller.status} in ${summary.seller.suburb || locationLabel}.`
        : 'Manage your store, products, and orders.',
      cta:   'Open dashboard', ctaRoute: '/seller/dashboard',
    };
    const hasProfile = !!(profileUser.email);
    return {
      label: completedCount === 4 ? 'Profile complete' : `Profile ${completedCount}/4`,
      title: hasProfile ? 'Ready for local shopping' : 'Finish your profile',
      text:  hasProfile
        ? 'Your orders, rewards, and preferences are connected.'
        : 'Add your email and phone so checkout can reach you.',
      cta:   hasProfile ? 'Continue shopping' : 'Complete profile',
      ctaRoute: hasProfile ? '/search' : '/account/edit-profile',
    };
  }, [role, summary, profileUser, locationLabel, completedCount]);

  const handleSignOut = () => { clearAuthUser(); navigate('/'); };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const userId = getAuthUser()?.id || 'default';
      await fetch(`${API_BASE_URL}/profile/${userId}`, { method: 'DELETE' });
    } catch {}
    clearAuthUser();
    navigate('/');
  };

  /* ── Loading skeleton ─────────────────────────────── */

  if (userLoading || (loading && !isGuest)) {
    return (
      <Page>
        <TopNavigation currentPath="/profile" />
        <Shell>
          <SkeletonHeroWrap>
            <SkeletonHeroLeft>
              <SkeletonIdentityRow>
                <SkeletonBlock $h="86px" $w="86px" $r="24px" />
                <div style={{ flex: 1, display: 'grid', gap: 10 }}>
                  <SkeletonBlock $h="26px" $w="140px" $r="999px" />
                  <SkeletonBlock $h="44px" $w="200px" $r="12px" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <SkeletonBlock $h="30px" $w="130px" $r="999px" />
                    <SkeletonBlock $h="30px" $w="100px" $r="999px" />
                  </div>
                </div>
              </SkeletonIdentityRow>
              <div style={{ display: 'flex', gap: 10 }}>
                <SkeletonBlock $h="44px" $w="130px" $r="999px" />
                <SkeletonBlock $h="44px" $w="80px" $r="999px" />
              </div>
            </SkeletonHeroLeft>
            <SkeletonHeroCard>
              <SkeletonBlock $h="12px" $w="100px" $r="6px" />
              <SkeletonBlock $h="28px" $w="80%" $r="8px" />
              <SkeletonBlock $h="14px" $w="90%" $r="6px" />
              <SkeletonBlock $h="14px" $w="70%" $r="6px" />
              <SkeletonBlock $h="44px" $r="999px" style={{ marginTop: 4 }} />
            </SkeletonHeroCard>
          </SkeletonHeroWrap>

          <SkeletonStatsRow>
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonStatCard key={i}>
                <SkeletonBlock $h="30px" $w="50px" $r="8px" />
                <SkeletonBlock $h="11px" $w="60px" $r="6px" />
              </SkeletonStatCard>
            ))}
          </SkeletonStatsRow>

          <SkeletonGrid>
            <SkeletonColumn>
              <SkeletonPanel>
                <SkeletonBlock $h="22px" $w="140px" $r="8px" />
                <SkeletonActionGrid>
                  {Array.from({ length: 6 }, (_, i) => (
                    <SkeletonActionCard key={i}>
                      <SkeletonBlock $h="42px" $w="42px" $r="14px" />
                      <SkeletonBlock $h="15px" $w="80%" $r="6px" />
                      <SkeletonBlock $h="12px" $w="65%" $r="6px" />
                    </SkeletonActionCard>
                  ))}
                </SkeletonActionGrid>
              </SkeletonPanel>
              <SkeletonPanel>
                <SkeletonBlock $h="22px" $w="140px" $r="8px" />
                {Array.from({ length: 3 }, (_, i) => (
                  <SkeletonOrderRow key={i}>
                    <SkeletonBlock $h="15px" $w="55%" $r="6px" />
                    <SkeletonBlock $h="11px" $w="35%" $r="6px" />
                  </SkeletonOrderRow>
                ))}
              </SkeletonPanel>
            </SkeletonColumn>
            <SkeletonColumn>
              {Array.from({ length: 2 }, (_, i) => (
                <SkeletonPanel key={i}>
                  <SkeletonBlock $h="22px" $w="110px" $r="8px" />
                  {Array.from({ length: 3 }, (_, j) => (
                    <SkeletonOrderRow key={j}>
                      <SkeletonBlock $h="15px" $w="60%" $r="6px" />
                      <SkeletonBlock $h="11px" $w="40%" $r="6px" />
                    </SkeletonOrderRow>
                  ))}
                </SkeletonPanel>
              ))}
            </SkeletonColumn>
          </SkeletonGrid>
        </Shell>
        <BottomNavigation currentPath="/profile" />
      </Page>
    );
  }

  /* ── Guest view ───────────────────────────────────── */

  if (isGuest) {
    return (
      <Page>
        <TopNavigation currentPath="/profile" />
        <Shell>
          <GuestHero>
            <GuestEyebrow>
              <StatusDot $role="buyer" $active />
              Shopply account
            </GuestEyebrow>
            <GuestTitle>Your profile awaits</GuestTitle>
            <GuestSub>
              Sign in to track orders, save addresses, collect vouchers, and unlock member-only prices.
            </GuestSub>
            <GuestActions>
              <PrimaryButton onClick={() => navigate('/sign-in')}>Sign in</PrimaryButton>
              <SecondaryButton onClick={() => navigate('/sign-in?mode=signup')}>Create account</SecondaryButton>
            </GuestActions>
          </GuestHero>

          <BenefitsGrid>
            {[
              { icon: '%', title: 'Member prices',   text: 'Signed-in shoppers see lower prices on thousands of products.' },
              { icon: '📦', title: 'Order tracking', text: 'Real-time updates from checkout to doorstep, every step.' },
              { icon: '⚡', title: 'Fast checkout',  text: 'Saved addresses and cards for one-tap checkout every time.' },
            ].map((b, i) => (
              <BenefitCard key={b.title} $i={i}>
                <BenefitIcon>{b.icon}</BenefitIcon>
                <BenefitTitle>{b.title}</BenefitTitle>
                <BenefitText>{b.text}</BenefitText>
              </BenefitCard>
            ))}
          </BenefitsGrid>

          <Panel style={{ marginTop: 16 }}>
            <PanelHeader><PanelTitle>Preferences</PanelTitle></PanelHeader>
            <List>
              {[
                { title: 'Language',       text: 'English',                                route: '/account/language' },
                { title: 'Theme',          text: 'System',                                 route: '/account/theme' },
                { title: 'Help & support', text: 'Get help with orders and returns',       route: '/support/help' },
                { title: 'Legal',          text: 'Terms, privacy policy, and licenses',   route: '/legal' },
              ].map(a => {
                const RowIco = ROW_ICONS[a.route];
                return (
                  <RowButton key={a.title} onClick={() => navigate(a.route)}>
                    <RowIconBox>{RowIco && <RowIco />}</RowIconBox>
                    <div><RowTitle>{a.title}</RowTitle><RowMeta>{a.text}</RowMeta></div>
                    <Chevron><ChevronIcon /></Chevron>
                  </RowButton>
                );
              })}
            </List>
          </Panel>
        </Shell>
        <BottomNavigation currentPath="/profile" />
      </Page>
    );
  }

  /* ── Signed-in profile ────────────────────────────── */

  return (
    <Page>
      <TopNavigation currentPath="/profile" />
      <Shell>
        {error && <ErrorBox>{error}</ErrorBox>}

        {/* Hero */}
        <Hero>
          <HeroLeft>
            <ProfileIdentity>
              <Avatar>
                {profileUser.avatarUrl
                  ? <img src={profileUser.avatarUrl} alt={userName} />
                  : initials(userName)}
              </Avatar>
              <div>
                <Eyebrow>
                  <StatusDot $role={role} $active />
                  Shopply account
                  <RoleBadge $role={role}>
                    {isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Buyer'}
                  </RoleBadge>
                </Eyebrow>
                <Title>{userName}</Title>
                <Contact>
                  {profileUser.email  && <Pill>{profileUser.email}</Pill>}
                  {profileUser.mobile && <Pill>{profileUser.mobile}</Pill>}
                  <Pill>{locationLabel}</Pill>
                </Contact>

                {/* Completeness chips — buyers only */}
                {isBuyer && (
                  <>
                    <CompLabel style={{ marginTop: 12 }}>
                      Profile {completedCount}/4 complete
                    </CompLabel>
                    <CompletenessRow>
                      {completeness.map(c => (
                        <CompPill key={c.label} $done={c.done} onClick={() => navigate(c.route)}>
                          <CompDot $done={c.done} />
                          {c.label}
                        </CompPill>
                      ))}
                    </CompletenessRow>
                  </>
                )}
              </div>
            </ProfileIdentity>

            <HeroActions>
              <PrimaryButton onClick={() => navigate('/account/edit-profile')}>
                Edit profile
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate(heroCard.ctaRoute)}>
                {heroCard.cta}
              </SecondaryButton>
              <SignOutBtn onClick={handleSignOut}>
                <SignOutIcon /> Sign out
              </SignOutBtn>
            </HeroActions>
          </HeroLeft>

          <HeroCard>
            <div>
              <MiniLabel>{heroCard.label}</MiniLabel>
              <MiniTitle>{heroCard.title}</MiniTitle>
              <MiniText>{heroCard.text}</MiniText>
            </div>
            <PrimaryButton onClick={() => navigate(heroCard.ctaRoute)}>
              {heroCard.cta}
            </PrimaryButton>
          </HeroCard>
        </Hero>

        {/* Stats */}
        <Stats>
          {statItems.map((item, i) => (
            <StatCard key={item.label} $i={i} onClick={() => navigate(item.route)}>
              <StatValue>{item.value}</StatValue>
              <StatLabel>{item.label}</StatLabel>
            </StatCard>
          ))}
        </Stats>

        <Grid>
          {/* Left column */}
          <Column>
            {/* Quick actions */}
            <Panel>
              <PanelHeader>
                <PanelTitle>Quick actions</PanelTitle>
              </PanelHeader>
              <ActionGrid>
                {quickActions.map(action => {
                  const ActionIco = ACTION_ICONS[action.iconKey] || BagIcon;
                  return (
                    <ActionCard
                      key={action.title}
                      $highlight={action.highlight}
                      onClick={() => navigate(action.route)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <IconBox $purple={action.highlight}><ActionIco /></IconBox>
                        {action.metric && <MetricBadge>{action.metric}</MetricBadge>}
                      </div>
                      <div>
                        <CardTitle>{action.title}</CardTitle>
                        <CardText>{action.text}</CardText>
                      </div>
                    </ActionCard>
                  );
                })}
              </ActionGrid>
            </Panel>

            {/* Recent orders */}
            <Panel>
              <PanelHeader>
                <PanelTitle>Recent orders</PanelTitle>
                <TextButton onClick={() => navigate('/orders')}>See all</TextButton>
              </PanelHeader>
              {orders.length > 0 ? (
                <List>
                  {orders.slice(0, 4).map(order => (
                    <RowButton key={order.id} onClick={() => navigate(`/tracking/${order.id}`)}>
                      <RowIconBox><PackageIcon /></RowIconBox>
                      <div>
                        <RowTitle>Order #{String(order.id).slice(-8).toUpperCase()}</RowTitle>
                        <RowMeta>{fmt(order.totals?.total)} · {order.status || 'processing'}</RowMeta>
                      </div>
                      <Chevron><ChevronIcon /></Chevron>
                    </RowButton>
                  ))}
                </List>
              ) : (
                <EmptyWrap>
                  <EmptyEmoji>🛍️</EmptyEmoji>
                  <EmptyTitle>No orders yet</EmptyTitle>
                  <EmptySubtext>When you place your first order, it'll show up here.</EmptySubtext>
                  <SecondaryButton onClick={() => navigate('/search')} style={{ marginTop: 4 }}>
                    Start shopping
                  </SecondaryButton>
                </EmptyWrap>
              )}
            </Panel>

            {/* Seller/admin: store overview */}
            {(isSeller || isAdmin) && (
              <Panel>
                <PanelHeader>
                  <PanelTitle>Store overview</PanelTitle>
                  <TextButton onClick={() => navigate('/seller/dashboard')}>Dashboard</TextButton>
                </PanelHeader>
                <List>
                  <RowButton $tone="soft" onClick={() => navigate('/seller/orders')}>
                    <RowIconBox><ListIcon /></RowIconBox>
                    <div>
                      <RowTitle>Seller orders</RowTitle>
                      <RowMeta>Orders placed through your store</RowMeta>
                    </div>
                    <RowStatus>{stats.sellerOrders || 0} orders</RowStatus>
                  </RowButton>
                  <RowButton onClick={() => navigate('/seller/products')}>
                    <RowIconBox><BoxIcon /></RowIconBox>
                    <div>
                      <RowTitle>Your products</RowTitle>
                      <RowMeta>Manage and promote listings</RowMeta>
                    </div>
                    <RowStatus>{stats.products || 0} listed</RowStatus>
                  </RowButton>
                  <RowButton onClick={() => navigate('/seller/analytics')}>
                    <RowIconBox><ChartIcon /></RowIconBox>
                    <div>
                      <RowTitle>Analytics</RowTitle>
                      <RowMeta>Sales data and traffic</RowMeta>
                    </div>
                    <Chevron><ChevronIcon /></Chevron>
                  </RowButton>
                </List>
              </Panel>
            )}
          </Column>

          {/* Right column */}
          <Column>
            {/* Account settings */}
            <Panel>
              <PanelHeader><PanelTitle>Account</PanelTitle></PanelHeader>
              <List>
                {accountActions.map(action => {
                  const RowIco = ROW_ICONS[action.route];
                  return (
                    <RowButton key={action.title} onClick={() => navigate(action.route)}>
                      <RowIconBox>{RowIco && <RowIco />}</RowIconBox>
                      <div>
                        <RowTitle>{action.title}</RowTitle>
                        <RowMeta>{action.text}</RowMeta>
                      </div>
                      <Chevron><ChevronIcon /></Chevron>
                    </RowButton>
                  );
                })}
              </List>
            </Panel>

            {/* Seller panel */}
            {(isSeller || isAdmin) && (
              <Panel>
                <PanelHeader>
                  <PanelTitle>Seller profile</PanelTitle>
                  <TextButton onClick={() => navigate('/seller/dashboard')}>Open</TextButton>
                </PanelHeader>
                <List>
                  {[
                    { icon: StoreIcon, title: summary?.seller?.storeName || 'My store', text: `${summary?.seller?.status || 'active'} · ${summary?.seller?.suburb || locationLabel}`, route: '/seller/dashboard', tone: 'soft' },
                    { icon: BoxIcon,   title: 'Manage products',  text: 'Add, edit, and promote listings',    route: '/seller/products' },
                    { icon: ZapIcon,   title: 'Promotions',       text: 'Discounts, flash deals, bundles',    route: '/seller/promotions' },
                    { icon: MsgIcon,   title: 'Messages',         text: 'Conversations with buyers',          route: '/seller/messages' },
                  ].map(r => (
                    <RowButton key={r.title} $tone={r.tone} onClick={() => navigate(r.route)}>
                      <RowIconBox><r.icon /></RowIconBox>
                      <div><RowTitle>{r.title}</RowTitle><RowMeta>{r.text}</RowMeta></div>
                      <Chevron><ChevronIcon /></Chevron>
                    </RowButton>
                  ))}
                </List>
              </Panel>
            )}

            {/* Admin-only panel */}
            {isAdmin && (
              <Panel>
                <PanelHeader>
                  <PanelTitle>Platform admin</PanelTitle>
                  <PanelBadge>Admin</PanelBadge>
                </PanelHeader>
                <List>
                  {[
                    { icon: DashIcon,  title: 'Platform overview', text: 'Sales, traffic, and key metrics',      route: '/admin',            tone: 'soft' },
                    { icon: ListIcon,  title: 'All orders',        text: 'Every order across the platform',      route: '/admin' },
                    { icon: ChartIcon, title: 'Analytics',         text: 'GMV, conversions, seller performance', route: '/seller/analytics' },
                  ].map(r => (
                    <RowButton key={r.title} $tone={r.tone} onClick={() => navigate(r.route)}>
                      <RowIconBox><r.icon /></RowIconBox>
                      <div><RowTitle>{r.title}</RowTitle><RowMeta>{r.text}</RowMeta></div>
                      <Chevron><ChevronIcon /></Chevron>
                    </RowButton>
                  ))}
                </List>
              </Panel>
            )}

            {/* Become a seller — buyers only, visually distinct */}
            {isBuyer && (
              <UpsellPanel>
                <UpsellHeader>
                  <UpsellTitle>Sell on Shopply</UpsellTitle>
                  <UpsellBadge>Free to start</UpsellBadge>
                </UpsellHeader>
                <List>
                  <UpsellRow onClick={() => navigate('/become-a-seller')}>
                    <UpsellIconBox><StoreIcon /></UpsellIconBox>
                    <div>
                      <UpsellRowTitle>Become a seller</UpsellRowTitle>
                      <UpsellRowMeta>Open your store and reach local buyers</UpsellRowMeta>
                    </div>
                    <UpsellChevron><ChevronIcon /></UpsellChevron>
                  </UpsellRow>
                  <UpsellRow onClick={() => navigate('/sell-on-shopply')}>
                    <UpsellIconBox><HelpIcon /></UpsellIconBox>
                    <div>
                      <UpsellRowTitle>Learn more</UpsellRowTitle>
                      <UpsellRowMeta>See how selling on Shopply works</UpsellRowMeta>
                    </div>
                    <UpsellChevron><ChevronIcon /></UpsellChevron>
                  </UpsellRow>
                </List>
              </UpsellPanel>
            )}

            {/* Preferences */}
            <Panel>
              <PanelHeader><PanelTitle>Preferences</PanelTitle></PanelHeader>
              <List>
                {preferenceActions.map(action => {
                  const RowIco = ROW_ICONS[action.route];
                  return (
                    <RowButton key={action.title} onClick={() => navigate(action.route)}>
                      <RowIconBox>{RowIco && <RowIco />}</RowIconBox>
                      <div>
                        <RowTitle>{action.title}</RowTitle>
                        <RowMeta>{action.text}</RowMeta>
                      </div>
                      <Chevron><ChevronIcon /></Chevron>
                    </RowButton>
                  );
                })}
              </List>
            </Panel>

            {/* Danger zone */}
            <DangerPanel>
              <DangerTitle>Delete account</DangerTitle>
              <DangerText>
                This permanently removes your account, orders, and saved data. This cannot be undone.
              </DangerText>
              {!deleteConfirm ? (
                <DangerBtn onClick={() => setDeleteConfirm(true)}>Delete my account</DangerBtn>
              ) : (
                <>
                  <DangerText style={{ marginBottom: 0 }}>Are you sure? This is permanent.</DangerText>
                  <DangerConfirmRow>
                    <DangerConfirmBtn onClick={handleDeleteAccount} disabled={deleting}>
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </DangerConfirmBtn>
                    <DangerCancelBtn onClick={() => setDeleteConfirm(false)} disabled={deleting}>
                      Cancel
                    </DangerCancelBtn>
                  </DangerConfirmRow>
                </>
              )}
            </DangerPanel>
          </Column>
        </Grid>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
