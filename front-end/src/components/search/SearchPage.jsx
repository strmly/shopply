import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { SearchIdleState } from './SearchIdleState';
import { SearchAutocomplete } from './SearchAutocomplete';
import { SearchResults } from './SearchResults';
import { FilterOverlay } from './FilterOverlay';
import ExpansionBanner from '../hyperlocal/ExpansionBanner';
import ProgressiveExpansionLoader from '../hyperlocal/ProgressiveExpansionLoader';

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 54%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 80px;
`;

const SearchHeader = styled.div`
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);
  padding: 16px min(5vw, 48px);
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.07);
  backdrop-filter: blur(18px);
`;

const HeaderInner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 560px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const RoomSelectWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  display: grid;
  min-width: 174px;
  border-radius: 999px;

  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9)) padding-box,
      linear-gradient(135deg, rgba(61, 129, 239, 0.4), rgba(245, 158, 11, 0.22), rgba(228, 231, 236, 0.84)) border-box;
    border: 1px solid transparent;
    box-shadow:
      0 18px 40px rgba(16, 24, 40, 0.08),
      inset 0 1px 0 rgba(255,255,255,0.94);
    pointer-events: none;
    transition: ${props => props.theme.transitions.swift};
  }

  &::before {
    content: 'Shop rooms';
    position: absolute;
    left: 48px;
    top: 8px;
    z-index: 3;
    color: ${props => props.theme.colors.primarySoftText};
    font-size: 9px;
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
    pointer-events: none;
  }

  &:focus-within,
  &:hover {
    transform: translateY(-1px);
  }

  &:focus-within::after,
  &:hover::after {
    box-shadow:
      0 24px 52px rgba(16, 24, 40, 0.12),
      0 0 0 4px ${props => props.theme.colors.primarySoftBg},
      inset 0 1px 0 rgba(255,255,255,0.98);
  }

  @media (max-width: 560px) {
    order: 3;
    width: calc(100% - 92px);
    min-width: 0;
  }
`;

const RoomSelectIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  z-index: 3;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 0;
  transform: translateY(-50%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.82),
    0 10px 20px rgba(61, 129, 239, 0.12);
  pointer-events: none;

  &::before {
    content: '';
    width: 13px;
    height: 11px;
    border: 2px solid currentColor;
    border-radius: 3px;
    box-shadow:
      7px 0 0 -2px currentColor,
      0 7px 0 -2px currentColor,
      7px 7px 0 -2px currentColor;
  }
`;

const RoomSelectChevron = styled.span`
  position: absolute;
  z-index: 3;
  right: 16px;
  top: 50%;
  width: 8px;
  height: 8px;
  pointer-events: none;
  transform: translateY(-64%) rotate(45deg);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-right: 2px solid ${props => props.theme.colors.text.secondary};
    border-bottom: 2px solid ${props => props.theme.colors.text.secondary};
    transition: ${props => props.theme.transitions.swift};
  }

  ${RoomSelectWrap}:focus-within &::before,
  ${RoomSelectWrap}:hover &::before {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RoomSelect = styled.select`
  position: relative;
  z-index: 2;
  appearance: none;
  height: 58px;
  width: 100%;
  min-width: 174px;
  padding: 21px 40px 7px 48px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  outline: none;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: none;

  &:hover,
  &:focus {
    color: ${props => props.theme.colors.primary};
  }

  &:focus-visible {
    outline: none;
  }

  @media (max-width: 560px) {
    min-width: 0;
    height: 52px;
    padding-top: 18px;
  }
`;

const SearchInput = styled.input`
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 58px;
  padding: 0 112px 0 66px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: none;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 800;
  }

  @media (max-width: 560px) {
    height: 54px;
    padding: 0 58px 0 60px;
    font-size: 14px;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  z-index: 2;
  left: 10px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(61, 129, 239, 0.14), rgba(255, 255, 255, 0.92)),
    ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 0;
  pointer-events: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 10px 20px rgba(61, 129, 239, 0.16);

  &::before {
    content: '';
    width: 13px;
    height: 13px;
    border: 2px solid currentColor;
    border-radius: 999px;
    transform: translate(-1px, -1px);
  }

  &::after {
    content: '';
    position: absolute;
    width: 9px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transform: translate(8px, 8px) rotate(45deg);
  }

  @media (max-width: 560px) {
    width: 36px;
    height: 36px;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 999px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.5), rgba(228, 231, 236, 0.82), rgba(245, 158, 11, 0.24)) border-box;
  box-shadow:
    0 18px 40px rgba(16, 24, 40, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  transition: ${props => props.theme.transitions.swift};

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(61, 129, 239, 0.06), rgba(255, 255, 255, 0) 44%, rgba(245, 158, 11, 0.07));
    pointer-events: none;
  }

  &:focus-within {
    transform: translateY(-1px);
    box-shadow:
      0 24px 52px rgba(16, 24, 40, 0.13),
      0 0 0 4px ${props => props.theme.colors.primarySoftBg},
      inset 0 1px 0 rgba(255, 255, 255, 0.98);
  }
`;

const SearchAffordance = styled.span`
  position: absolute;
  z-index: 2;
  right: 12px;
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 13px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(228, 231, 236, 0.86);
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 900;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);

  @media (max-width: 560px) {
    display: none;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  z-index: 3;
  right: 10px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(228, 231, 236, 0.88);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.08);

  &:hover {
    color: ${props => props.theme.colors.primary};
    border-color: rgba(61, 129, 239, 0.28);
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  display: grid;
  place-items: center;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.primary};
  border-radius: 999px;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
  padding: 0;
  transition: ${props => props.theme.transitions.swift};
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

const FilterButton = styled.button`
  background: ${props => props.$active ? props.theme.colors.gradient.soft : '#ffffff'};
  color: ${props => props.$active ? props.theme.colors.primarySoftText : props.theme.colors.text.primary};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.28)' : props.theme.colors.border.default};
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-weight: 900;
  font-size: 14px;
  box-shadow: 0 10px 22px rgba(16, 24, 40, 0.06);

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const SortButton = styled(FilterButton)`
  margin-left: ${props => props.theme.spacing.xs};
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const H3Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px min(5vw, 48px) 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.18);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  width: fit-content;
`;

/* ─── Search History Chips ─────────────────────────────────────── */

const HistoryPanel = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px min(5vw, 48px) 0;
  animation: ${slideDown} 0.2s ease-out;
`;

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const HistoryLabel = styled.span`
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.theme.colors.text.secondary};
`;

const ClearAllLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.7;
  }
`;

const HistoryChips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const HistoryChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.22);
  border-radius: 999px;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(61, 129, 239, 0.14);
  }
`;

const HistoryChipRemove = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(61, 129, 239, 0.16);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: #ffffff;
  }
`;

/* ─── Inline Filter Panel ──────────────────────────────────────── */

const FiltersToggleButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: ${props => props.$active ? props.theme.colors.gradient.soft : '#ffffff'};
  color: ${props => props.$active ? props.theme.colors.primarySoftText : props.theme.colors.text.primary};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.28)' : props.theme.colors.border.default};
  border-radius: 999px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-weight: 900;
  font-size: 14px;
  box-shadow: 0 10px 22px rgba(16, 24, 40, 0.06);
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const FilterIconSvg = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
`;

const FilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primary};
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
`;

const InlineFilterPanel = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px min(5vw, 48px) 0;
  animation: ${slideDown} 0.22s ease-out;
`;

const FilterPanelInner = styled.div`
  background: #ffffff;
  border: 1px solid rgba(61, 129, 239, 0.18);
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 18px 46px rgba(16, 24, 40, 0.1);
  display: grid;
  gap: 20px;
`;

const FilterRow = styled.div`
  display: grid;
  gap: 8px;
`;

const FilterRowLabel = styled.div`
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.theme.colors.text.secondary};
`;

const PriceInputsRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const PriceInput = styled.input`
  flex: 1;
  height: 42px;
  padding: 0 14px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 12px;
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 900;
  outline: none;
  transition: ${props => props.theme.transitions.swift};
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 700;
  }
`;

const PriceDash = styled.span`
  font-size: 13px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.secondary};
  flex-shrink: 0;
`;

const StarRatingRow = styled.div`
  display: flex;
  gap: 6px;
`;

const StarButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${props => props.$filled ? 'rgba(245, 158, 11, 0.42)' : props.theme.colors.border.default};
  background: ${props => props.$filled ? 'rgba(254, 243, 199, 0.9)' : '#ffffff'};
  color: ${props => props.$filled ? '#D97706' : props.theme.colors.text.secondary};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: rgba(245, 158, 11, 0.42);
    background: rgba(254, 243, 199, 0.6);
    color: #D97706;
    transform: translateY(-1px);
  }
`;

const ToggleSwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ToggleSwitchLabel = styled.span`
  font-size: 14px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const ToggleSwitch = styled.button`
  position: relative;
  width: 46px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: ${props => props.$on ? props.theme.colors.primary : props.theme.colors.border.default};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$on ? '23px' : '3px'};
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #ffffff;
    transition: ${props => props.theme.transitions.swift};
    box-shadow: 0 2px 8px rgba(16, 24, 40, 0.18);
  }
`;

const FilterPanelActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const FilterClearLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.secondary};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const FilterApplyButton = styled.button`
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 10px 22px rgba(16, 24, 40, 0.14);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(16, 24, 40, 0.18);
  }
`;

/* ─── Delivery / Pickup Toggle ─────────────────────────────────── */

const DeliveryToggleWrap = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 16px min(5vw, 48px) 0;
  animation: ${fadeIn} 0.2s ease-in;
`;

const DeliverySegment = styled.div`
  display: inline-flex;
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.18);
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
`;

const DeliverySegmentBtn = styled.button`
  height: 34px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.$active ? '0 4px 14px rgba(16, 24, 40, 0.1)' : 'none'};
  white-space: nowrap;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

import API_BASE_URL from '@config/api';

const HISTORY_KEY = 'shopply_search_history';
const MAX_HISTORY = 5;

const ROOM_OPTIONS = [
  { label: 'All Rooms', value: 'all' },
  { label: 'Living Room', value: 'living' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Dining', value: 'dining' },
  { label: 'Office', value: 'office' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Kids', value: 'kids' },
  { label: 'Storage', value: 'storage' },
];

export const SearchPage = ({ location, onBack }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [repeatPurchases, setRepeatPurchases] = useState([]);
  const [smartShortcuts, setSmartShortcuts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [flashDealsLoading, setFlashDealsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('relevance');
  const [searchState, setSearchState] = useState('idle'); // idle, typing, results
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [h3TierLabel, setH3TierLabel] = useState(null);
  const [expansionData, setExpansionData] = useState(null);
  // { expanded, expansionSteps, tierLabel, effectiveRadiusKm }

  // ── Improvement 1: Search History ────────────────────────────────
  const [inputFocused, setInputFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // ── Improvement 2: Inline Filters ────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inlineFilters, setInlineFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    openNow: false,
    inStockOnly: false,
  });
  // Local draft while panel is open (apply on button click)
  const [draftFilters, setDraftFilters] = useState({ ...inlineFilters });

  // ── Improvement 3: Delivery/Pickup Toggle ─────────────────────────
  const [deliveryFilter, setDeliveryFilter] = useState('all'); // 'all' | 'delivery' | 'pickup'

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Load recent and trending searches
    loadRecentSearches();
    loadTrendingSearches();
    loadRepeatPurchases();
    loadSmartShortcuts();
    loadFlashDeals();
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setSearchState('idle');
      setSuggestions(null);
      setSearchResults([]);
      setSearchPage(1);
      setHasMoreResults(false);
      setTotalResults(0);
      setExpansionData(null);
      return;
    }

    if (query.length >= 2) {
      setSearchState('typing');
      loadSuggestions();
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        setSearchPage(1);
        performSearch(1, true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, sortBy]);

  const loadRecentSearches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/recent`);
      const data = await response.json();
      if (data.success) {
        setRecentSearches(data.data);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadTrendingSearches = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const response = await fetch(`${API_BASE_URL}/search/trending?suburb=${suburb}`);
      const data = await response.json();
      if (data.success) {
        setTrendingSearches(data.data);
      }
    } catch (error) {
      console.error('Error loading trending searches:', error);
    }
  };

  const loadRepeatPurchases = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const city = location?.city || 'Johannesburg';
      const lat = location?.lat || -26.1076;
      const lng = location?.lng || 28.0567;

      const response = await fetch(
        `${API_BASE_URL}/search/repeat-purchases?suburb=${suburb}&city=${city}&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      if (data.success) {
        setRepeatPurchases(data.data);
      }
    } catch (error) {
      console.error('Error loading repeat purchases:', error);
    }
  };

  const loadSmartShortcuts = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const response = await fetch(`${API_BASE_URL}/search/shortcuts?suburb=${suburb}`);
      const data = await response.json();
      if (data.success) {
        setSmartShortcuts(data.data);
      }
    } catch (error) {
      console.error('Error loading smart shortcuts:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suburb = location?.suburb || 'Sandton';
      const city = location?.city || 'Johannesburg';
      const lat = location?.lat || -26.1076;
      const lng = location?.lng || 28.0567;

      const response = await fetch(
        `${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}&suburb=${suburb}&city=${city}&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async (page = 1, resetResults = false) => {
    if (!query.trim()) return;

    if (resetResults) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Try to get coordinates from localStorage for H3 search
      let storedLocation = null;
      try {
        storedLocation = JSON.parse(localStorage.getItem('shopply_location') || 'null');
      } catch {}

      const hasCoords = storedLocation?.lat && storedLocation?.lng;

      if (hasCoords && page === 1) {
        // Use H3 hyperlocal search when we have real coordinates
        const h3Params = new URLSearchParams({
          q: query,
          lat: storedLocation.lat.toString(),
          lng: storedLocation.lng.toString(),
          min_results: '8',
        });

        const response = await fetch(`${API_BASE_URL}/hyperlocal/search?${h3Params}`);
        const data = await response.json();

        if (data.success) {
          const results = data.data?.results || [];
          if (resetResults) {
            setSearchResults(results);
          } else {
            setSearchResults(prev => [...prev, ...results]);
          }
          setSearchState('results');
          setSearchPage(page);
          setHasMoreResults(false); // H3 search returns all results at once
          setTotalResults(results.length);
          setH3TierLabel(data.data?.tierLabel || null);
          setExpansionData({
            expanded: data.data?.expanded || false,
            wasAutoExpanded: data.data?.wasAutoExpanded || false,
            expansionReason: data.data?.expansionReason || null,
            expansionSteps: data.data?.expansionSteps || [],
            tierLabel: data.data?.tierLabel || null,
            effectiveRadiusKm: data.data?.effectiveRadiusKm || null,
          });
          return;
        }
      }

      // Fallback: standard search
      setH3TierLabel(null);
      setExpansionData(null);
      const suburb = location?.suburb || 'Sandton';
      const city = location?.city || 'Johannesburg';
      const lat = storedLocation?.lat || location?.lat || -26.1076;
      const lng = storedLocation?.lng || location?.lng || 28.0567;

      const params = new URLSearchParams({
        q: query,
        suburb,
        city,
        lat: lat.toString(),
        lng: lng.toString(),
        sortBy,
        page: page.toString(),
        limit: '16', // Load 16 items per page (4x4 grid)
        ...filters,
      });

      const response = await fetch(`${API_BASE_URL}/search/products?${params}`);
      const data = await response.json();

      if (data.success) {
        if (resetResults) {
          setSearchResults(data.data || []);
        } else {
          setSearchResults(prev => [...prev, ...(data.data || [])]);
        }
        setSearchState('results');
        setSearchPage(page);
        setHasMoreResults(data.pagination?.hasMore || false);
        setTotalResults(data.pagination?.total || data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = searchPage + 1;
    performSearch(nextPage, false);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      pushToHistory(query.trim());
    }
  };

  const loadFlashDeals = async () => {
    setFlashDealsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/flash-deals?limit=8`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setFlashDeals(data.data);
      } else {
        setFlashDeals([]);
      }
    } catch (error) {
      console.error('Error loading flash deals:', error);
      setFlashDeals([]);
    } finally {
      setFlashDealsLoading(false);
    }
  };

  // ── History helpers ───────────────────────────────────────────────
  const pushToHistory = useCallback((term) => {
    if (!term || !term.trim()) return;
    setSearchHistory(prev => {
      const deduped = [term, ...prev.filter(t => t !== term)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(deduped));
      } catch {}
      return deduped;
    });
  }, []);

  const removeFromHistory = useCallback((term) => {
    setSearchHistory(prev => {
      const next = prev.filter(t => t !== term);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  // ── Inline filter helpers ─────────────────────────────────────────
  const inlineFilterCount = [
    inlineFilters.minPrice !== '',
    inlineFilters.maxPrice !== '',
    inlineFilters.minRating > 0,
    inlineFilters.openNow,
    inlineFilters.inStockOnly,
  ].filter(Boolean).length;

  const handleOpenFiltersPanel = () => {
    setDraftFilters({ ...inlineFilters });
    setFiltersOpen(prev => !prev);
  };

  const handleApplyInlineFilters = () => {
    setInlineFilters({ ...draftFilters });
    setFiltersOpen(false);
    // Merge the inline filter params into the existing filters object so performSearch picks them up
    const extra = {};
    if (draftFilters.minPrice !== '') extra.min_price = draftFilters.minPrice;
    if (draftFilters.maxPrice !== '') extra.max_price = draftFilters.maxPrice;
    if (draftFilters.minRating > 0) extra.min_rating = draftFilters.minRating;
    if (draftFilters.openNow) extra.open_now = true;
    if (draftFilters.inStockOnly) extra.in_stock_only = true;
    setFilters(prev => {
      // Remove old inline keys, merge new ones
      const { min_price: _a, max_price: _b, min_rating: _c, open_now: _d, in_stock_only: _e, ...rest } = prev;
      return { ...rest, ...extra };
    });
  };

  const handleClearInlineFilters = () => {
    const empty = { minPrice: '', maxPrice: '', minRating: 0, openNow: false, inStockOnly: false };
    setDraftFilters(empty);
    setInlineFilters(empty);
    setFilters(prev => {
      const { min_price: _a, max_price: _b, min_rating: _c, open_now: _d, in_stock_only: _e, ...rest } = prev;
      return rest;
    });
    setFiltersOpen(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions(null);
    setSearchResults([]);
    setSearchPage(1);
    setHasMoreResults(false);
    setTotalResults(0);
    setSearchState('idle');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      setQuery(suggestion.label);
      pushToHistory(suggestion.label);
    } else if (suggestion.type === 'category') {
      setQuery(suggestion.data.category);
      pushToHistory(suggestion.data.category);
    } else if (suggestion.type === 'store') {
      setQuery(suggestion.label);
      pushToHistory(suggestion.label);
    }
  };

  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    pushToHistory(searchTerm);
  };

  const handleTrendingSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    pushToHistory(searchTerm);
  };

  const handleRemoveRecentSearch = async (searchTerm) => {
    try {
      await fetch(`${API_BASE_URL}/search/recent`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm }),
      });
      loadRecentSearches();
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
    const idx = cart.findIndex(i => String(i.id) === String(product.id) && JSON.stringify(i.selectedVariant) === 'null');
    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, selectedVariant: null, addedAt: new Date().toISOString() });
    }
    localStorage.setItem('shopply_cart', JSON.stringify(cart));
    localStorage.setItem('shopply_cart_count', cart.reduce((s, i) => s + (i.quantity || 1), 0).toString());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const handleRoomChange = (event) => {
    const room = event.target.value;
    if (room === 'all') {
      const { room: _r, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters(prev => ({ ...prev, room }));
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== false).length;

  // ── Improvement 3: client-side delivery filter ────────────────────
  const hasDeliveryData = searchResults.some(r => r.canDeliver || r.pickupOnly);
  const filteredResults = searchResults.filter(r => {
    if (deliveryFilter === 'delivery') return r.canDeliver === true;
    if (deliveryFilter === 'pickup') return r.pickupOnly === true;
    return true;
  });

  // ── Improvement 1: show history panel ────────────────────────────
  const showHistory = inputFocused && !query && searchHistory.length > 0;

  return (
    <Container>
      <SearchHeader>
        <HeaderInner>
          <SearchBarContainer>
            <RoomSelectWrap>
              <RoomSelectIcon aria-hidden="true" />
              <RoomSelect
                aria-label="Shop by room"
                value={filters.room || 'all'}
                onChange={handleRoomChange}
              >
                {ROOM_OPTIONS.map(room => (
                  <option key={room.value} value={room.value}>
                    {room.label}
                  </option>
                ))}
              </RoomSelect>
              <RoomSelectChevron aria-hidden="true" />
            </RoomSelectWrap>
            <SearchWrapper>
              <SearchIcon>S</SearchIcon>
              <SearchInput
                ref={inputRef}
                type="text"
                placeholder="Search refined finds nearby"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 150)}
              />
              {query ? (
                <ClearButton type="button" onClick={handleClearSearch} aria-label="Clear search">
                  x
                </ClearButton>
              ) : (
                <SearchAffordance>Nearby</SearchAffordance>
              )}
            </SearchWrapper>
            <CancelButton onClick={handleBack} aria-label="Go back">&lt;</CancelButton>
          </SearchBarContainer>
          {searchState === 'results' && h3TierLabel && (
            <H3Banner>Showing results within {h3TierLabel}</H3Banner>
          )}
          {searchState === 'results' && (
            <ControlsRow>
              {/* Improvement 2: Inline Filters button */}
              <FiltersToggleButton
                $active={filtersOpen || inlineFilterCount > 0}
                onClick={handleOpenFiltersPanel}
                aria-expanded={filtersOpen}
              >
                <FilterIconSvg aria-hidden="true">&#9776;</FilterIconSvg>
                Filters
                {inlineFilterCount > 0 && (
                  <FilterBadge>{inlineFilterCount}</FilterBadge>
                )}
              </FiltersToggleButton>
              <FilterButton
                $active={showFilters || activeFilterCount > 0}
                onClick={() => setShowFilters(!showFilters)}
              >
                More {activeFilterCount > 0 && `(${activeFilterCount})`}
              </FilterButton>
              <SortButton
                $active={sortBy !== 'relevance'}
                onClick={() => {
                  const sortOptions = ['relevance', 'nearest', 'price_asc', 'price_desc', 'popular', 'rating'];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
              >
                Sort: {sortBy === 'relevance' ? 'Relevance' :
                       sortBy === 'nearest' ? 'Nearest' :
                       sortBy === 'price_asc' ? 'Price up' :
                       sortBy === 'price_desc' ? 'Price down' :
                       sortBy === 'popular' ? 'Popular' : 'Rating'}
              </SortButton>
            </ControlsRow>
          )}
        </HeaderInner>
      </SearchHeader>

      {/* Improvement 2: Inline Filter Panel (slide-down, below header) */}
      {filtersOpen && (
        <InlineFilterPanel>
          <FilterPanelInner>
            <FilterRow>
              <FilterRowLabel>Price range (ZAR)</FilterRowLabel>
              <PriceInputsRow>
                <PriceInput
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={draftFilters.minPrice}
                  onChange={e => setDraftFilters(p => ({ ...p, minPrice: e.target.value }))}
                />
                <PriceDash>—</PriceDash>
                <PriceInput
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={draftFilters.maxPrice}
                  onChange={e => setDraftFilters(p => ({ ...p, maxPrice: e.target.value }))}
                />
              </PriceInputsRow>
            </FilterRow>

            <FilterRow>
              <FilterRowLabel>Minimum rating</FilterRowLabel>
              <StarRatingRow>
                {[1, 2, 3, 4, 5].map(star => (
                  <StarButton
                    key={star}
                    type="button"
                    $filled={star <= draftFilters.minRating}
                    onClick={() =>
                      setDraftFilters(p => ({
                        ...p,
                        minRating: p.minRating === star ? 0 : star,
                      }))
                    }
                    aria-label={`${star} star minimum`}
                  >
                    {star <= draftFilters.minRating ? '★' : '☆'}
                  </StarButton>
                ))}
              </StarRatingRow>
            </FilterRow>

            <FilterRow>
              <ToggleSwitchRow>
                <ToggleSwitchLabel>Open now</ToggleSwitchLabel>
                <ToggleSwitch
                  type="button"
                  $on={draftFilters.openNow}
                  onClick={() => setDraftFilters(p => ({ ...p, openNow: !p.openNow }))}
                  aria-pressed={draftFilters.openNow}
                  aria-label="Open now"
                />
              </ToggleSwitchRow>
            </FilterRow>

            <FilterRow>
              <ToggleSwitchRow>
                <ToggleSwitchLabel>In stock only</ToggleSwitchLabel>
                <ToggleSwitch
                  type="button"
                  $on={draftFilters.inStockOnly}
                  onClick={() => setDraftFilters(p => ({ ...p, inStockOnly: !p.inStockOnly }))}
                  aria-pressed={draftFilters.inStockOnly}
                  aria-label="In stock only"
                />
              </ToggleSwitchRow>
            </FilterRow>

            <FilterPanelActions>
              <FilterClearLink type="button" onClick={handleClearInlineFilters}>
                Clear all
              </FilterClearLink>
              <FilterApplyButton type="button" onClick={handleApplyInlineFilters}>
                Apply
              </FilterApplyButton>
            </FilterPanelActions>
          </FilterPanelInner>
        </InlineFilterPanel>
      )}

      {/* Improvement 1: Search History chips (shown when input focused + empty) */}
      {showHistory && (
        <HistoryPanel>
          <HistoryHeader>
            <HistoryLabel>Recent searches</HistoryLabel>
            <ClearAllLink type="button" onClick={clearHistory}>
              Clear all
            </ClearAllLink>
          </HistoryHeader>
          <HistoryChips>
            {searchHistory.map(term => (
              <HistoryChip
                key={term}
                onClick={() => {
                  setQuery(term);
                  pushToHistory(term);
                }}
              >
                {term}
                <HistoryChipRemove
                  role="button"
                  aria-label={`Remove ${term} from history`}
                  onClick={e => {
                    e.stopPropagation();
                    removeFromHistory(term);
                  }}
                >
                  ✕
                </HistoryChipRemove>
              </HistoryChip>
            ))}
          </HistoryChips>
        </HistoryPanel>
      )}

      {searchState === 'idle' && (
        <SearchIdleState
          recentSearches={recentSearches}
          trendingSearches={trendingSearches}
          repeatPurchases={repeatPurchases}
          smartShortcuts={smartShortcuts}
          flashDeals={flashDeals}
          flashDealsLoading={flashDealsLoading}
          location={location}
          onRecentSearchClick={handleRecentSearchClick}
          onTrendingSearchClick={handleTrendingSearchClick}
          onRemoveRecentSearch={handleRemoveRecentSearch}
          onRepeatPurchaseClick={handleProductClick}
          onFlashDealClick={handleProductClick}
          onFlashDealAddToCart={handleAddToCart}
          onShortcutClick={(shortcut) => {
            const nextFilters = shortcut.filter || {};
            setFilters(nextFilters);
            // Use the shortcut label as the visible query so backend can still apply semantic ranking
            const nextQuery = shortcut.query || shortcut.label || '';
            setQuery(nextQuery);
            // Immediately perform a search with these filters
            setSearchState('results');
            setSearchPage(1);
            performSearch(1, true);
          }}
          onCategoryClick={(category) => {
            setQuery(category.label);
          }}
        />
      )}

      {searchState === 'typing' && suggestions && (
        <SearchAutocomplete
          suggestions={suggestions}
          query={query}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {loading && (
        <ProgressiveExpansionLoader isSearching={true} />
      )}

      {!loading && searchState === 'results' && (expansionData?.expanded || expansionData?.wasAutoExpanded) && (
        <ExpansionBanner
          expanded={expansionData.expanded}
          wasAutoExpanded={expansionData.wasAutoExpanded}
          expansionReason={expansionData.expansionReason}
          expansionSteps={expansionData.expansionSteps}
          effectiveLabel={expansionData.tierLabel}
          effectiveRadius={expansionData.effectiveRadiusKm}
          query={query}
        />
      )}

      {/* Improvement 3: Delivery / Pickup segmented toggle */}
      {searchState === 'results' && !loading && searchResults.length > 0 && hasDeliveryData && (
        <DeliveryToggleWrap>
          <DeliverySegment role="group" aria-label="Delivery method filter">
            <DeliverySegmentBtn
              $active={deliveryFilter === 'all'}
              onClick={() => setDeliveryFilter('all')}
            >
              All
            </DeliverySegmentBtn>
            <DeliverySegmentBtn
              $active={deliveryFilter === 'delivery'}
              onClick={() => setDeliveryFilter('delivery')}
            >
              Delivery
            </DeliverySegmentBtn>
            <DeliverySegmentBtn
              $active={deliveryFilter === 'pickup'}
              onClick={() => setDeliveryFilter('pickup')}
            >
              Pickup
            </DeliverySegmentBtn>
          </DeliverySegment>
        </DeliveryToggleWrap>
      )}

      {searchState === 'results' && (
        <SearchResults
          results={filteredResults}
          query={query}
          location={location}
          loading={loading}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          onLoadMore={handleLoadMore}
          hasMore={hasMoreResults}
          loadingMore={loadingMore}
          totalResults={deliveryFilter === 'all' ? totalResults : filteredResults.length}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {showFilters && (
        <FilterOverlay
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}
    </Container>
  );
};
