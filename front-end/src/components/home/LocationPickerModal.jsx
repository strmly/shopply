import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const SUBURBS = [
  { suburb: 'Sandton', city: 'Johannesburg', lat: -26.1076, lng: 28.0567 },
  { suburb: 'Rosebank', city: 'Johannesburg', lat: -26.1452, lng: 28.0436 },
  { suburb: 'Melville', city: 'Johannesburg', lat: -26.1792, lng: 28.0121 },
  { suburb: 'Randburg', city: 'Johannesburg', lat: -26.0942, lng: 27.9997 },
  { suburb: 'Soweto', city: 'Johannesburg', lat: -26.2671, lng: 27.8561 },
  { suburb: 'Midrand', city: 'Johannesburg', lat: -25.9939, lng: 28.1261 },
  { suburb: 'Fourways', city: 'Johannesburg', lat: -26.0258, lng: 28.0059 },
  { suburb: 'Bryanston', city: 'Johannesburg', lat: -26.0742, lng: 28.0191 },
  { suburb: 'Parkhurst', city: 'Johannesburg', lat: -26.1418, lng: 28.0094 },
  { suburb: 'Norwood', city: 'Johannesburg', lat: -26.1697, lng: 28.0780 },
  { suburb: 'Roodepoort', city: 'Johannesburg', lat: -26.1631, lng: 27.8739 },
  { suburb: 'Alexandra', city: 'Johannesburg', lat: -26.1067, lng: 28.0866 },
  { suburb: 'Centurion', city: 'Pretoria', lat: -25.8535, lng: 28.1887 },
  { suburb: 'Pretoria CBD', city: 'Pretoria', lat: -25.7459, lng: 28.1878 },
  { suburb: 'Hatfield', city: 'Pretoria', lat: -25.7531, lng: 28.2273 },
  { suburb: 'Cape Town CBD', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { suburb: 'V&A Waterfront', city: 'Cape Town', lat: -33.9007, lng: 18.4193 },
  { suburb: 'Claremont', city: 'Cape Town', lat: -33.9831, lng: 18.4666 },
  { suburb: 'Durban CBD', city: 'Durban', lat: -29.8587, lng: 31.0218 },
  { suburb: 'Umhlanga', city: 'Durban', lat: -29.7234, lng: 31.0742 },
];

function findNearestSuburb(lat, lng) {
  let nearest = SUBURBS[0];
  let minDist = Infinity;
  for (const s of SUBURBS) {
    const d = Math.hypot(s.lat - lat, s.lng - lng);
    if (d < minDist) { minDist = d; nearest = s; }
  }
  return nearest;
}

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.44);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -24px 60px rgba(16, 24, 40, 0.18);
  animation: ${slideUp} 0.32s cubic-bezier(0.34, 1.2, 0.64, 1);
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  margin: 12px auto 0;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 10px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    border-color: transparent;
  }
`;

const SearchWrap = styled.div`
  padding: 0 20px 12px;
  flex-shrink: 0;
`;

const SearchRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIconWrap = styled.span`
  position: absolute;
  left: 14px;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 16px 0 42px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  outline: none;
  transition: ${props => props.theme.transitions.swift};
  box-sizing: border-box;

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
  }

  &:focus {
    border-color: rgba(61, 129, 239, 0.42);
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(61, 129, 239, 0.1);
  }
`;

const GPSButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 20px 4px;
  padding: 12px 14px;
  background: ${props => props.theme.colors.gradient?.soft || 'rgba(61, 129, 239, 0.06)'};
  border: 1px solid rgba(61, 129, 239, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;
  text-align: left;

  &:hover:not(:disabled) {
    background: rgba(61, 129, 239, 0.1);
    border-color: rgba(61, 129, 239, 0.36);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const GPSIconCircle = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(61, 129, 239, 0.1);
  border: 1px solid rgba(61, 129, 239, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.theme.colors.primary};
`;

const GPSLabel = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary};
`;

const GPSSub = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(228, 231, 236, 0.72);
  margin: 8px 20px;
  flex-shrink: 0;
`;

const ListWrap = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 0 8px 24px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(228, 231, 236, 0.9);
    border-radius: 999px;
  }
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: ${props => props.theme.colors.text.secondary};
  letter-spacing: 0.06em;
  padding: 6px 12px 4px;
`;

const SuburbRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 14px;
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const SuburbIconWrap = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${props => props.$active ? 'rgba(61, 129, 239, 0.1)' : 'rgba(248, 250, 252, 0.9)'};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.22)' : 'rgba(228, 231, 236, 0.9)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
`;

const SuburbInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuburbName = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.primary};
`;

const SuburbCity = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 1px;
`;

const CheckCircle = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 600;
`;

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const GPSCrosshairIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

const SearchSVGIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

const CheckSVGIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-9" />
  </svg>
);

export const LocationPickerModal = ({ currentLocation, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = search.trim()
    ? SUBURBS.filter(s =>
        s.suburb.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      )
    : SUBURBS;

  const handleGPS = () => {
    if (!navigator.geolocation || detecting) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestSuburb(pos.coords.latitude, pos.coords.longitude);
        onSelect({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          suburb: nearest.suburb,
          city: nearest.city,
        });
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelect = (s) => {
    onSelect({ lat: s.lat, lng: s.lng, suburb: s.suburb, city: s.city });
  };

  const isActive = (s) =>
    currentLocation?.suburb === s.suburb && currentLocation?.city === s.city;

  return (
    <>
      <Backdrop onClick={onClose} />
      <Sheet role="dialog" aria-modal="true" aria-label="Choose delivery area">
        <Handle />
        <Header>
          <Title>Choose delivery area</Title>
          <CloseButton onClick={onClose} aria-label="Close">&#10005;</CloseButton>
        </Header>

        <SearchWrap>
          <SearchRow>
            <SearchIconWrap>
              <SearchSVGIcon />
            </SearchIconWrap>
            <SearchInput
              ref={inputRef}
              type="text"
              placeholder="Search suburb or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchRow>
        </SearchWrap>

        <GPSButton onClick={handleGPS} disabled={detecting}>
          <GPSIconCircle>
            <GPSCrosshairIcon />
          </GPSIconCircle>
          <div>
            <GPSLabel>{detecting ? 'Detecting location...' : 'Use my current location'}</GPSLabel>
            <GPSSub>Auto-detect via GPS</GPSSub>
          </div>
        </GPSButton>

        <Divider />

        <ListWrap>
          {!search.trim() && <SectionLabel>Popular areas</SectionLabel>}
          {filtered.length === 0 && (
            <EmptyState>No areas found for &ldquo;{search}&rdquo;</EmptyState>
          )}
          {filtered.map(s => (
            <SuburbRow
              key={`${s.suburb}-${s.city}`}
              $active={isActive(s)}
              onClick={() => handleSelect(s)}
            >
              <SuburbIconWrap $active={isActive(s)}>
                <PinIcon />
              </SuburbIconWrap>
              <SuburbInfo>
                <SuburbName $active={isActive(s)}>{s.suburb}</SuburbName>
                <SuburbCity>{s.city}</SuburbCity>
              </SuburbInfo>
              {isActive(s) && (
                <CheckCircle>
                  <CheckSVGIcon />
                </CheckCircle>
              )}
            </SuburbRow>
          ))}
        </ListWrap>
      </Sheet>
    </>
  );
};
