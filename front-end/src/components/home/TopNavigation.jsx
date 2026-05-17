import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { AuthModal } from '../auth';
import { isSignedIn, getAuthUser } from '../../utils/authState';
import { useUser } from '../../context/UserContext';
import { getCurrentUserId } from '../../utils/currentUser.js';

/* ─── Shell ───────────────────────────────────────────── */

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px clamp(10px, 4vw, 40px);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(228, 231, 236, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  @media (max-width: 560px) {
    padding: 8px 10px;
  }
`;

const NavContent = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  max-width: 1180px;
  margin: 0 auto;
  min-width: 0;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 9px;
  }
`;

/* ─── Left cluster ────────────────────────────────────── */

const MainCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: auto;

  @media (max-width: 900px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const BrandButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  &:hover { opacity: 0.7; }

  @media (max-width: 1040px) { display: none; }
`;

const BrandGlyph = styled.span`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
`;

const BrandText = styled.span`
  font-size: 15px;
  font-weight: 900;
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: rgba(255, 255, 255, 0.92);
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.1);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PageBackRow = styled.div`
  max-width: 1180px;
  margin: 12px auto 0;
  padding: 0 min(5vw, 48px);

  @media (max-width: 560px) {
    margin-top: 10px;
  }
`;

const PageTitleWrap = styled.div`
  min-width: 0;
`;

const PageTitle = styled.h1`
  font-size: 17px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 7px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  max-width: clamp(160px, 24vw, 260px);
  min-width: 0;
  flex: 0 1 auto;

  &:hover {
    border-color: rgba(61, 129, 239, 0.3);
    background: rgba(61, 129, 239, 0.04);
  }

  @media (max-width: 900px) {
    max-width: none;
    flex: 1;
  }

  @media (max-width: 420px) {
    padding-right: 8px;
  }
`;

const LocationDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.successBase};
  flex-shrink: 0;
`;

const LocationValue = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LocationChange = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;

  @media (max-width: 560px) { display: none; }
`;

/* ─── Right actions ───────────────────────────────────── */

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
  justify-content: flex-end;

  @media (max-width: 900px) {
    justify-content: stretch;
  }

  @media (max-width: 420px) {
    gap: 6px;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  max-width: none;
  height: 40px;
  padding: 0 14px;
  background: #f4f6f8;
  border: 1px solid transparent;
  border-radius: 999px;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #eef1f5;
    border-color: rgba(61, 129, 239, 0.18);
    color: ${props => props.theme.colors.text.primary};
  }

  @media (max-width: 680px) {
    max-width: none;
    flex: 1 1 auto;
    min-width: 92px;
    padding: 0 12px;
  }

  @media (max-width: 420px) {
    min-width: 0;
    width: auto;
    padding: 0 10px;
    justify-content: flex-start;
    flex: 1 1 auto;
  }
`;

const SearchLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 360px) { display: none; }
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  color: ${props => props.theme.colors.text.primary};
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: rgba(61, 129, 239, 0.2);
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 420px) {
    width: 38px;
    height: 38px;
  }
`;

const NavIconWrap = styled.span`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: ${props => props.theme.colors.dangerBase || '#ef4444'};
  border-radius: 999px;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
`;

/* ─── Hover cards ─────────────────────────────────────── */

const HoverCard = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  width: min(230px, calc(100vw - 24px));
  padding: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.9);
  box-shadow: 0 16px 40px rgba(16, 24, 40, 0.12);
  opacity: 0;
  transform: translate(-50%, -6px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  z-index: 20;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    width: 10px;
    height: 10px;
    background: #ffffff;
    border-left: 1px solid rgba(228, 231, 236, 0.9);
    border-top: 1px solid rgba(228, 231, 236, 0.9);
    transform: translateX(-50%) rotate(45deg);
  }

  @media (max-width: 780px) { display: none; }
`;

const CartHoverCard = styled(HoverCard)`
  width: min(360px, calc(100vw - 24px));
  padding: 16px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.28), rgba(228, 231, 236, 0.86), rgba(245, 158, 11, 0.18)) border-box;
  border: 1px solid transparent;
  box-shadow:
    0 26px 64px rgba(16, 24, 40, 0.18),
    inset 0 1px 0 rgba(255,255,255,0.92);

  &::before {
    background: #ffffff;
    border-color: rgba(228, 231, 236, 0.86);
  }
`;

const HoverAction = styled.div`
  position: relative;
  display: inline-flex;

  &::after {
    content: '';
    position: absolute;
    left: -18px;
    right: -18px;
    top: 100%;
    height: 18px;
    pointer-events: auto;
  }

  &:hover > ${HoverCard},
  &:focus-within > ${HoverCard} {
    opacity: 1;
    transform: translate(-50%, 0);
    pointer-events: auto;
  }

  &:last-child > ${HoverCard},
  &:nth-last-child(2) > ${HoverCard} {
    left: auto;
    right: 0;
    transform: translate(0, -6px);
  }

  &:last-child:hover > ${HoverCard},
  &:last-child:focus-within > ${HoverCard},
  &:nth-last-child(2):hover > ${HoverCard},
  &:nth-last-child(2):focus-within > ${HoverCard} {
    transform: translate(0, 0);
  }
`;

const HoverTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const HoverIcon = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: ${props => props.theme.colors.gradient?.soft || '#f0f4ff'};
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const HoverTitle = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const HoverMeta = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const HoverFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(228, 231, 236, 0.8);
  margin-top: 10px;
`;

const HoverBtn = styled.button`
  height: 34px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.15s ease;

  ${props => props.$primary ? `
    background: ${props.theme.colors.gradient.primary};
    color: #ffffff;
    border: none;
    box-shadow: 0 12px 24px rgba(61, 129, 239, 0.24);
    &:hover {
      background: ${props.theme.colors.primary};
      box-shadow: 0 16px 30px rgba(61, 129, 239, 0.3);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.primary};
    border: 1px solid rgba(228, 231, 236, 0.9);
    &:hover {
      border-color: rgba(61, 129, 239, 0.3);
      color: ${props.theme.colors.primary};
    }
  `}
`;

const CartPreviewList = styled.div`
  display: grid;
  gap: 9px;
  max-height: 246px;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;
`;

const CartPreviewItem = styled.div`
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border-radius: 18px;
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(228, 231, 236, 0.78);
`;

const CartThumb = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 15px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: ${props => props.theme.colors.gradient?.soft || '#f0f4ff'};
  color: ${props => props.theme.colors.primary};
  font-size: 16px;
  font-weight: 900;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CartItemInfo = styled.div`
  min-width: 0;
`;

const CartItemName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CartItemMeta = styled.div`
  margin-top: 3px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 800;
`;

const QtyControls = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 8px 16px rgba(16, 24, 40, 0.05);
`;

const QtyButton = styled.button`
  width: 26px;
  height: 26px;
  border: 0;
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
`;

const QtyValue = styled.span`
  min-width: 24px;
  text-align: center;
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
`;

const RemoveItemButton = styled.button`
  margin-top: 7px;
  border: 0;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  font-size: 11px;
  font-weight: 900;
  padding: 0;

  &:hover {
    color: ${props => props.theme.colors.dangerBase || '#ef4444'};
  }
`;

const CartSummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient?.soft || '#f0f4ff'};
  border: 1px solid rgba(61, 129, 239, 0.18);
`;

const CartSummaryLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 900;
`;

const CartSummaryTotal = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
`;

const CartEmptyState = styled.div`
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 16px 6px 10px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const CartEmptyMark = styled.div`
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient?.soft || '#f0f4ff'};
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.18);
`;

const NotificationHoverCard = styled(CartHoverCard)`
  width: 360px;
`;

const NotificationList = styled.div`
  display: grid;
  gap: 9px;
  max-height: 270px;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;
`;

const NotificationPreviewItem = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.$unread ? 'rgba(61, 129, 239, 0.28)' : 'rgba(228, 231, 236, 0.78)'};
  border-radius: 18px;
  background: ${props => props.$unread ? props.theme.colors.primarySoftBg : 'rgba(255,255,255,0.78)'};
  text-align: left;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(61, 129, 239, 0.38);
    background: #ffffff;
    box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
  }
`;

const NotificationTypeMark = styled.span`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: ${props => props.$type === 'promotion'
    ? 'linear-gradient(135deg, rgba(255,247,237,0.95), rgba(255,255,255,0.95))'
    : props.$type === 'order'
      ? props.theme.colors.gradient?.soft || '#f0f4ff'
      : '#ffffff'};
  color: ${props => props.$type === 'promotion'
    ? props.theme.colors.warningBase
    : props.theme.colors.primary};
  border: 1px solid rgba(228, 231, 236, 0.84);
  font-size: 12px;
  font-weight: 900;
`;

const NotificationPreviewContent = styled.div`
  min-width: 0;
`;

const NotificationPreviewTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
  line-height: 1.25;
`;

const UnreadDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  box-shadow: 0 0 0 4px ${props => props.theme.colors.primarySoftBg};
  flex-shrink: 0;
`;

const NotificationPreviewMessage = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NotificationPreviewMeta = styled.div`
  margin-top: 7px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: ${props => props.theme.colors.text.tertiary || props.theme.colors.text.secondary};
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
`;

const ProfileHoverCard = styled(CartHoverCard)`
  width: 340px;
`;

const ProfileHero = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.86)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.22), rgba(245, 158, 11, 0.14)) border-box;
  border: 1px solid transparent;
`;

const ProfileAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: ${props => props.theme.colors.gradient?.soft || '#f0f4ff'};
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 19px;
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.84);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileIdentity = styled.div`
  min-width: 0;
`;

const ProfileName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileEmail = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileStatusRow = styled.div`
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const ProfileStatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : '#ffffff'};
  color: ${props => props.$active ? props.theme.colors.primarySoftText : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.22)' : 'rgba(228, 231, 236, 0.86)'};
  font-size: 11px;
  font-weight: 900;
`;

const ProfileActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
`;

const ProfileActionButton = styled.button`
  min-height: 44px;
  padding: 8px 10px;
  border-radius: 16px;
  border: 1px solid rgba(228, 231, 236, 0.84);
  background: rgba(255,255,255,0.82);
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(61, 129, 239, 0.32);
    background: #ffffff;
    color: ${props => props.theme.colors.primary};
    box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
  }
`;

const ProfileActionTitle = styled.div`
  font-size: 12px;
  font-weight: 900;
`;

const ProfileActionMeta = styled.div`
  margin-top: 3px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 10px;
  font-weight: 800;
`;

const ProfileAuthPanel = styled.div`
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(228, 231, 236, 0.92);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(16, 24, 40, 0.06);
`;

const ProfileAuthTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 950;
  line-height: 1.2;
`;

const ProfileAuthCopy = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 750;
  line-height: 1.35;
`;

const ProfileAuthActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
`;

/* ─── Icons ───────────────────────────────────────────── */

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.8" />
    <path d="m16 16 5 5" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h2l2 11h10l2-8H7" />
    <circle cx="10" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21c1.2-4.2 4-6.2 7.5-6.2s6.3 2 7.5 6.2" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.8 10.5c0-3.2 2-5.6 5.2-5.6s5.2 2.4 5.2 5.6v3.4l1.8 2.6H5l1.8-2.6v-3.4Z" />
    <path d="M9.8 19c.5 1.2 1.2 1.8 2.2 1.8s1.7-.6 2.2-1.8" />
  </svg>
);

const formatCurrency = (value) => `R${Number(value || 0).toFixed(2)}`;

const getCartItems = (cart) => {
  if (!cart) return [];
  if (Array.isArray(cart.items) && cart.items.length > 0) return cart.items;
  if (Array.isArray(cart.storeGroups)) {
    return cart.storeGroups.flatMap(group => group.items || []);
  }
  return [];
};

const readLocalCartPreview = () => {
  try {
    const localCart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
    if (!Array.isArray(localCart)) return null;
    const items = localCart.map(item => ({
      id: item.id,
      productId: item.id,
      product: item,
      quantity: item.quantity || 1,
      variant: item.selectedVariant || null,
      storeId: item.storeId,
      storeName: item.storeName,
    }));
    const itemsTotal = items.reduce((sum, item) => (
      sum + Number(item.product?.price || 0) * (item.quantity || 1)
    ), 0);
    return {
      items,
      itemCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totals: { itemsTotal, subtotal: itemsTotal, total: itemsTotal },
    };
  } catch {
    return null;
  }
};

const notificationTypeLabel = (type) => ({
  order: 'Order',
  promotion: 'Deal',
  system: 'System',
  info: 'Info',
}[type] || 'Update');

const notificationTypeMark = (type) => ({
  order: 'O',
  promotion: '%',
  system: 'S',
  info: 'i',
}[type] || 'N');

const timeAgo = (value) => {
  const created = new Date(value).getTime();
  if (!created) return 'Just now';
  const diff = Date.now() - created;
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
};

/* ─── Component ───────────────────────────────────────── */

export const TopNavigation = ({
  location,
  title,
  onBack,
  onLocationClick,
  onNotificationClick,
  onSearchClick,
  onCartClick,
  onProfileClick,
  unreadCount = 0,
  cartCount: cartCountProp,
}) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user: contextUser, role, loading: contextLoading } = useUser();
  const [cartCount, setCartCount] = useState(cartCountProp || 0);
  const [cartPreview, setCartPreview] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartBusyItem, setCartBusyItem] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnread, setNotificationUnread] = useState(unreadCount);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePrefs, setProfilePrefs] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const profileSignedIn = contextLoading ? isSignedIn() : role !== 'guest';
  const [showAuthModal, setShowAuthModal] = useState(false);
  const suburb = location?.suburb || 'Your Area';
  const city = location?.city || '';
  const isTitleMode = Boolean(title);
  const canShowBack = routerLocation.pathname !== '/';

  const syncCartState = (cart) => {
    const count = cart?.itemCount ?? getCartItems(cart).reduce((sum, item) => sum + (item.quantity || 1), 0);
    const localItems = getCartItems(cart).map(item => ({
      ...(item.product || item),
      id: item.productId || item.product?.id || item.id,
      quantity: item.quantity || 1,
      selectedVariant: item.variant || null,
      storeId: item.storeId || item.product?.storeId,
      storeName: item.storeName || item.product?.storeName,
    }));
    setCartPreview(cart);
    setCartCount(count || 0);
    localStorage.setItem('shopply_cart', JSON.stringify(localItems));
    localStorage.setItem('shopply_cart_count', String(count || 0));
  };

  const loadCartPreview = async () => {
    setCartLoading(true);
    try {
      const locationParam = location ? `&location=${encodeURIComponent(JSON.stringify(location))}` : '';
      const response = await fetch(`${API_BASE_URL}/cart?userId=default${locationParam}`);
      if (!response.ok) throw new Error(`Cart request failed: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Cart request failed');
      syncCartState(data.data);
    } catch {
      const localCart = readLocalCartPreview();
      if (localCart) syncCartState(localCart);
    } finally {
      setCartLoading(false);
    }
  };

  const loadNotificationPreview = async () => {
    setNotificationsLoading(true);
    try {
      const [listResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/notifications/user/default?limit=5`),
        fetch(`${API_BASE_URL}/notifications/user/default/count`),
      ]);
      const [listData, countData] = await Promise.all([
        listResponse.json(),
        countResponse.json(),
      ]);
      if (listData.success) setNotifications(listData.data || []);
      if (countData.success) setNotificationUnread(countData.data?.count || 0);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const openNotification = async (notification) => {
    if (!notification?.id) return;
    setNotificationBusy(true);
    try {
      if (!notification.read) {
        await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
          method: 'PUT',
        });
        setNotifications(prev => prev.map(item => (
          item.id === notification.id ? { ...item, read: true } : item
        )));
        setNotificationUnread(prev => Math.max(0, prev - 1));
      }
    } finally {
      setNotificationBusy(false);
      navigate(`/notifications/${notification.id}`);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotificationBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/default/read-all`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(item => ({ ...item, read: true })));
        setNotificationUnread(0);
      }
    } finally {
      setNotificationBusy(false);
    }
  };

  const loadProfilePreview = async () => {
    const profileId = getAuthUser()?.id || 'default';
    setProfileLoading(true);
    try {
      const [profileResponse, prefsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/profile/${profileId}`),
        fetch(`${API_BASE_URL}/profile/${profileId}/preferences`),
      ]);
      const [profileData, prefsData] = await Promise.all([
        profileResponse.json(),
        prefsResponse.json(),
      ]);
      if (profileData.success) setProfilePreview(profileData.data);
      if (prefsData.success) setProfilePrefs(prefsData.data);
    } catch {
      setProfilePreview(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    setNotificationUnread(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    loadNotificationPreview();
    loadProfilePreview();
    const interval = setInterval(loadNotificationPreview, 30000);
    window.addEventListener('notificationUpdated', loadNotificationPreview);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdated', loadNotificationPreview);
    };
  }, []);

  useEffect(() => {
    if (cartCountProp !== undefined) {
      setCartCount(cartCountProp);
      return;
    }

    const loadCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
        const count = Array.isArray(cart)
          ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
          : Number(localStorage.getItem('shopply_cart_count') || 0);
        setCartCount(count);
      } catch {
        setCartCount(Number(localStorage.getItem('shopply_cart_count') || 0));
      }
      loadCartPreview();
    };

    loadCartCount();
    window.addEventListener('cartUpdated', loadCartCount);
    window.addEventListener('storage', loadCartCount);
    return () => {
      window.removeEventListener('cartUpdated', loadCartCount);
      window.removeEventListener('storage', loadCartCount);
    };
  }, [cartCountProp, location]);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };
  const handleSearchClick = () => onSearchClick ? onSearchClick() : navigate('/search');
  const handleCartClick = () => onCartClick ? onCartClick() : navigate('/cart');
  const handleProfileClick = () => {
    if (!profileSignedIn) {
      setShowAuthModal(true);
      return;
    }

    if (onProfileClick) {
      onProfileClick();
      return;
    }

    navigate('/profile');
  };
  const handleProfileRoute = (path) => {
    if (!profileSignedIn) {
      setShowAuthModal(true);
      return;
    }

    navigate(path);
  };
  const handleAuthSuccess = () => {
    loadProfilePreview();

    if (onProfileClick) {
      onProfileClick();
      return;
    }

    navigate('/profile');
  };
  const cartItems = getCartItems(cartPreview);
  const cartTotal = cartPreview?.totals?.total ?? cartPreview?.totals?.subtotal ?? cartPreview?.totals?.itemsTotal ?? 0;
  const displayUnread = notificationUnread ?? unreadCount;
  const resolvedName = contextUser?.name || profilePreview?.name || 'Shopply Shopper';
  const resolvedEmail = contextUser?.email || profilePreview?.email || profilePreview?.mobile || 'Manage your account';
  const resolvedAvatar = contextUser?.avatarUrl || profilePreview?.avatarUrl || '';
  const profileName = profileSignedIn ? resolvedName : 'Sign in to Shopply';
  const profileEmail = profileSignedIn ? resolvedEmail : 'Unlock saved carts, orders, and local deals';
  const profileAvatar = profileSignedIn ? resolvedAvatar : '';
  const profileNotifications = profilePrefs?.notifications || {};

  const updateCartQuantity = async (item, nextQuantity) => {
    if (!item?.id || nextQuantity < 0) return;
    setCartBusyItem(item.id);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getCurrentUserId(), quantity: nextQuantity }),
      });
      const data = await response.json();
      if (data.success) {
        syncCartState(data.data);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        await loadCartPreview();
      }
    } catch {
      await loadCartPreview();
    } finally {
      setCartBusyItem(null);
    }
  };

  const removeCartItem = async (item) => {
    if (!item?.id) return;
    setCartBusyItem(item.id);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${item.id}?userId=default`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        syncCartState(data.data);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        await loadCartPreview();
      }
    } catch {
      await loadCartPreview();
    } finally {
      setCartBusyItem(null);
    }
  };

  return (
    <>
    <NavContainer>
      <NavContent>
        <MainCluster>
          {isTitleMode ? (
            <>
              <PageTitleWrap>
                <PageTitle>{title}</PageTitle>
              </PageTitleWrap>
            </>
          ) : (
            <>
              <BrandButton type="button" onClick={() => navigate('/')} aria-label="Home">
                <BrandGlyph>S</BrandGlyph>
                <BrandText>Shopply</BrandText>
              </BrandButton>
              <LocationButton onClick={onLocationClick}>
                <LocationDot aria-hidden="true" />
                <LocationValue>{suburb}{city ? `, ${city}` : ''}</LocationValue>
                <LocationChange>· Change</LocationChange>
              </LocationButton>
            </>
          )}
        </MainCluster>

        <Actions>
          <SearchButton onClick={handleSearchClick} aria-label="Search">
            <NavIconWrap><SearchIcon /></NavIconWrap>
            <SearchLabel>Search furniture, rooms, stores…</SearchLabel>
          </SearchButton>

          <HoverAction onMouseEnter={loadNotificationPreview} onFocus={loadNotificationPreview}>
            <IconButton onClick={onNotificationClick} aria-label="Notifications">
              <NavIconWrap><BellIcon /></NavIconWrap>
              {displayUnread > 0 && (
                <NotificationBadge>{displayUnread > 9 ? '9+' : displayUnread}</NotificationBadge>
              )}
            </IconButton>
            <NotificationHoverCard>
              <HoverTop>
                <HoverIcon><NavIconWrap><BellIcon /></NavIconWrap></HoverIcon>
                <div>
                  <HoverTitle>Notifications</HoverTitle>
                  <HoverMeta>
                    {notificationsLoading
                      ? 'Refreshing updates'
                      : displayUnread > 0
                        ? `${displayUnread} unread update${displayUnread === 1 ? '' : 's'}`
                        : 'All caught up'}
                  </HoverMeta>
                </div>
              </HoverTop>

              {notifications.length > 0 ? (
                <>
                  <NotificationList>
                    {notifications.slice(0, 5).map(notification => (
                      <NotificationPreviewItem
                        key={notification.id}
                        type="button"
                        $unread={!notification.read}
                        onClick={(event) => {
                          event.stopPropagation();
                          openNotification(notification);
                        }}
                        disabled={notificationBusy}
                      >
                        <NotificationTypeMark $type={notification.type}>
                          {notificationTypeMark(notification.type)}
                        </NotificationTypeMark>
                        <NotificationPreviewContent>
                          <NotificationPreviewTitle>
                            {!notification.read && <UnreadDot aria-hidden="true" />}
                            {notification.title}
                          </NotificationPreviewTitle>
                          <NotificationPreviewMessage>{notification.message}</NotificationPreviewMessage>
                          <NotificationPreviewMeta>
                            <span>{notificationTypeLabel(notification.type)}</span>
                            <span>{timeAgo(notification.createdAt)}</span>
                          </NotificationPreviewMeta>
                        </NotificationPreviewContent>
                      </NotificationPreviewItem>
                    ))}
                  </NotificationList>

                  <HoverFooter>
                    <HoverBtn
                      onClick={(event) => {
                        event.stopPropagation();
                        markAllNotificationsRead();
                      }}
                      disabled={notificationBusy || displayUnread === 0}
                    >
                      Mark read
                    </HoverBtn>
                    <HoverBtn
                      $primary
                      onClick={(event) => {
                        event.stopPropagation();
                        if (onNotificationClick) onNotificationClick();
                        else navigate('/account/notifications');
                      }}
                    >
                      View all
                    </HoverBtn>
                  </HoverFooter>
                </>
              ) : (
                <>
                  <CartEmptyState>
                    <CartEmptyMark><NavIconWrap><BellIcon /></NavIconWrap></CartEmptyMark>
                    No notifications yet. Important order and deal updates will appear here.
                  </CartEmptyState>
                  <HoverFooter>
                    <HoverBtn onClick={() => navigate('/orders')}>Orders</HoverBtn>
                    <HoverBtn $primary onClick={() => navigate('/account/notifications')}>Settings</HoverBtn>
                  </HoverFooter>
                </>
              )}
            </NotificationHoverCard>
          </HoverAction>

          <HoverAction onMouseEnter={loadCartPreview} onFocus={loadCartPreview}>
            <IconButton onClick={handleCartClick} aria-label="Cart">
              <NavIconWrap><CartIcon /></NavIconWrap>
              {cartCount > 0 && (
                <NotificationBadge>{cartCount > 9 ? '9+' : cartCount}</NotificationBadge>
              )}
            </IconButton>
            <CartHoverCard>
              <HoverTop>
                <HoverIcon><NavIconWrap><CartIcon /></NavIconWrap></HoverIcon>
                <div>
                  <HoverTitle>Cart</HoverTitle>
                  <HoverMeta>
                    {cartLoading
                      ? 'Refreshing your cart'
                      : cartCount > 0
                        ? `${cartCount} item${cartCount === 1 ? '' : 's'} ready`
                        : 'Empty'}
                  </HoverMeta>
                </div>
              </HoverTop>

              {cartItems.length > 0 ? (
                <>
                  <CartPreviewList>
                    {cartItems.slice(0, 4).map((item) => {
                      const product = item.product || item;
                      const image = product.image || product.images?.[0];
                      const quantity = item.quantity || 1;
                      const isBusy = cartBusyItem === item.id;

                      return (
                        <CartPreviewItem key={item.id}>
                          <CartThumb>
                            {image ? <img src={image} alt="" /> : 'S'}
                          </CartThumb>
                          <CartItemInfo>
                            <CartItemName>{product.name || 'Cart item'}</CartItemName>
                            <CartItemMeta>{formatCurrency(product.price)} each</CartItemMeta>
                            <RemoveItemButton
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeCartItem(item);
                              }}
                              disabled={isBusy}
                            >
                              Remove
                            </RemoveItemButton>
                          </CartItemInfo>
                          <QtyControls>
                            <QtyButton
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={isBusy}
                              onClick={(event) => {
                                event.stopPropagation();
                                updateCartQuantity(item, quantity - 1);
                              }}
                            >
                              -
                            </QtyButton>
                            <QtyValue>{quantity}</QtyValue>
                            <QtyButton
                              type="button"
                              aria-label="Increase quantity"
                              disabled={isBusy}
                              onClick={(event) => {
                                event.stopPropagation();
                                updateCartQuantity(item, quantity + 1);
                              }}
                            >
                              +
                            </QtyButton>
                          </QtyControls>
                        </CartPreviewItem>
                      );
                    })}
                  </CartPreviewList>

                  <CartSummaryRow>
                    <CartSummaryLabel>{cartItems.length > 4 ? `+${cartItems.length - 4} more item${cartItems.length - 4 === 1 ? '' : 's'}` : 'Estimated total'}</CartSummaryLabel>
                    <CartSummaryTotal>{formatCurrency(cartTotal)}</CartSummaryTotal>
                  </CartSummaryRow>

                  <HoverFooter>
                    <HoverBtn onClick={() => navigate('/cart')}>View cart</HoverBtn>
                    <HoverBtn $primary onClick={() => navigate('/checkout')}>Checkout</HoverBtn>
                  </HoverFooter>
                </>
              ) : (
                <>
                  <CartEmptyState>
                    <CartEmptyMark><NavIconWrap><CartIcon /></NavIconWrap></CartEmptyMark>
                    Your cart is ready for something beautiful.
                  </CartEmptyState>
                  <HoverFooter>
                    <HoverBtn onClick={() => navigate('/search')}>Search</HoverBtn>
                    <HoverBtn $primary onClick={() => navigate('/')}>Shop home</HoverBtn>
                  </HoverFooter>
                </>
              )}
            </CartHoverCard>
          </HoverAction>

          <HoverAction onMouseEnter={loadProfilePreview} onFocus={loadProfilePreview}>
            <IconButton onClick={handleProfileClick} aria-label="Profile">
              <NavIconWrap><ProfileIcon /></NavIconWrap>
            </IconButton>
            <ProfileHoverCard>
              <ProfileHero>
                <ProfileAvatar>
                  {profileAvatar ? <img src={profileAvatar} alt="" /> : getInitials(profileName)}
                </ProfileAvatar>
                <ProfileIdentity>
                  <ProfileName>{profileLoading ? 'Loading profile' : profileName}</ProfileName>
                  <ProfileEmail>{profileEmail}</ProfileEmail>
                </ProfileIdentity>
              </ProfileHero>

              <ProfileStatusRow>
                {profileSignedIn ? (
                  <>
                    <ProfileStatusPill $active={profileNotifications.orderUpdates !== false}>
                      Orders {profileNotifications.orderUpdates === false ? 'off' : 'on'}
                    </ProfileStatusPill>
                    <ProfileStatusPill $active={profileNotifications.deals !== false}>
                      Deals {profileNotifications.deals === false ? 'off' : 'on'}
                    </ProfileStatusPill>
                    <ProfileStatusPill $active={profilePrefs?.theme === 'dark'}>
                      {profilePrefs?.theme ? `${profilePrefs.theme} mode` : 'system mode'}
                    </ProfileStatusPill>
                  </>
                ) : (
                  <>
                    <ProfileStatusPill $active>Member prices</ProfileStatusPill>
                    <ProfileStatusPill $active>Order tracking</ProfileStatusPill>
                    <ProfileStatusPill $active>Saved rooms</ProfileStatusPill>
                  </>
                )}
              </ProfileStatusRow>

              {profileSignedIn ? (
                <>
                  <ProfileActionGrid>
                    {(
                      role === 'admin' ? [
                        { title: 'Edit profile', meta: 'Name, email, photo',          route: '/account/edit-profile' },
                        { title: 'Admin panel',  meta: 'Platform management',         route: '/admin' },
                        { title: 'All orders',   meta: 'Every order on the platform', route: '/admin' },
                        { title: 'Preferences',  meta: 'Alerts and settings',         route: '/account/notifications' },
                      ] : role === 'seller' ? [
                        { title: 'Edit profile',  meta: 'Name, email, photo',        route: '/account/edit-profile' },
                        { title: 'My orders',     meta: 'Track your purchases',      route: '/orders' },
                        { title: 'Seller orders', meta: 'Orders through your store', route: '/seller/orders' },
                        { title: 'Preferences',   meta: 'Alerts and settings',       route: '/account/notifications' },
                      ] : [
                        { title: 'Edit profile', meta: 'Name, email, photo',  route: '/account/edit-profile' },
                        { title: 'Orders',       meta: 'Track purchases',     route: '/orders' },
                        { title: 'Addresses',    meta: 'Delivery places',     route: '/addresses' },
                        { title: 'Preferences',  meta: 'Alerts and settings', route: '/account/notifications' },
                      ]
                    ).map(a => (
                      <ProfileActionButton key={a.title} onClick={() => handleProfileRoute(a.route)}>
                        <ProfileActionTitle>{a.title}</ProfileActionTitle>
                        <ProfileActionMeta>{a.meta}</ProfileActionMeta>
                      </ProfileActionButton>
                    ))}
                  </ProfileActionGrid>

                  <HoverFooter>
                    <HoverBtn onClick={() => handleProfileRoute('/profile')}>Account hub</HoverBtn>
                    {role === 'admin' ? (
                      <HoverBtn $primary onClick={() => handleProfileRoute('/admin')}>Admin panel</HoverBtn>
                    ) : role === 'seller' ? (
                      <HoverBtn $primary onClick={() => handleProfileRoute('/seller/dashboard')}>Seller tools</HoverBtn>
                    ) : (
                      <HoverBtn $primary onClick={() => handleProfileRoute('/become-a-seller')}>Become a seller</HoverBtn>
                    )}
                  </HoverFooter>
                </>
              ) : (
                <ProfileAuthPanel>
                  <ProfileAuthTitle>Shop with your own account</ProfileAuthTitle>
                  <ProfileAuthCopy>
                    Sign in or create an account to keep your cart, saved rooms, and order updates together.
                  </ProfileAuthCopy>
                  <ProfileAuthActions>
                    <HoverBtn onClick={() => setShowAuthModal(true)}>Sign in</HoverBtn>
                    <HoverBtn $primary onClick={() => setShowAuthModal(true)}>Sign up</HoverBtn>
                  </ProfileAuthActions>
                </ProfileAuthPanel>
              )}
            </ProfileHoverCard>
          </HoverAction>
        </Actions>
      </NavContent>
    </NavContainer>
    {canShowBack && (
      <PageBackRow>
        <BackButton onClick={handleBackClick} aria-label="Go back">&lt;</BackButton>
      </PageBackRow>
    )}
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onSuccess={handleAuthSuccess}
    />
    </>
  );
};
