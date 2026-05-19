import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';

const Shell = styled.section`
  max-width: 1180px;
  margin: ${props => props.$compact ? '14px auto' : '0 auto 34px'};
  padding: ${props => props.$compact ? '0' : '0 clamp(14px, 5vw, 48px)'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$compact ? '1fr' : '1.15fr 0.85fr'};
  gap: 14px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  position: relative;
  min-height: ${props => props.$featured ? '190px' : '136px'};
  overflow: hidden;
  display: grid;
  align-content: space-between;
  gap: 18px;
  padding: ${props => props.$featured ? '24px' : '18px'};
  border: 1px solid transparent;
  border-radius: ${props => props.$compact ? '20px' : '28px'};
  text-align: left;
  cursor: pointer;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    ${props => {
      if (props.$accent === 'warm') return 'linear-gradient(135deg, rgba(245,158,11,0.44), rgba(61,129,239,0.18), rgba(228,231,236,0.86)) border-box';
      if (props.$accent === 'fresh') return 'linear-gradient(135deg, rgba(16,185,129,0.34), rgba(61,129,239,0.2), rgba(228,231,236,0.86)) border-box';
      return 'linear-gradient(135deg, rgba(61,129,239,0.42), rgba(245,158,11,0.2), rgba(228,231,236,0.86)) border-box';
    }};
  box-shadow: ${props => props.$featured
    ? '0 28px 70px rgba(16, 24, 40, 0.13)'
    : '0 18px 44px rgba(16, 24, 40, 0.09)'};
  transition: ${props => props.theme.transitions.swift};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => {
      if (props.$accent === 'warm') return 'linear-gradient(135deg, rgba(245,158,11,0.14), transparent 52%)';
      if (props.$accent === 'fresh') return 'linear-gradient(135deg, rgba(16,185,129,0.12), transparent 52%)';
      return props.theme.colors.gradient?.soft || 'linear-gradient(135deg, rgba(61,129,239,0.12), transparent 52%)';
    }};
    opacity: 0.92;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 32px 76px rgba(16, 24, 40, 0.16);
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.colors.primarySoftBg};
    outline-offset: 3px;
  }

  @media (max-width: 520px) {
    min-height: ${props => props.$featured ? '176px' : '124px'};
    padding: 18px;
    border-radius: 22px;
  }
`;

const CardBody = styled.div`
  position: relative;
  z-index: 1;
  max-width: 560px;
`;

const TopRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(228, 231, 236, 0.82);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  white-space: nowrap;
`;

const Eyebrow = styled.div`
  margin-bottom: 7px;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
`;

const Title = styled.h3`
  margin: 0;
  max-width: 14ch;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.$featured ? 'clamp(25px, 3.4vw, 40px)' : '20px'};
  line-height: 1.02;
  font-weight: 950;
  letter-spacing: 0;
  overflow-wrap: anywhere;

  @media (max-width: 520px) {
    font-size: ${props => props.$featured ? '28px' : '18px'};
  }
`;

const Copy = styled.p`
  margin: 10px 0 0;
  max-width: 54ch;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.45;
  font-weight: 750;
`;

const Cta = styled.span`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 14px 28px rgba(61, 129, 239, 0.24);

  &::after {
    content: '';
    width: 7px;
    height: 7px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(45deg);
  }
`;

const Dismiss = styled.button`
  position: relative;
  z-index: 2;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(228, 231, 236, 0.86);
  border-radius: 999px;
  background: rgba(255,255,255,0.88);
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
    border-color: rgba(61, 129, 239, 0.3);
  }
`;

const storageKey = (placement, id) => `shopply_banner_dismissed_${placement}_${id}`;

export function PlatformBanners({ placement = 'home', location, limit = 2, compact = false }) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const impressed = useRef(new Set());

  const locationParam = useMemo(() => {
    if (!location) return '';
    return `&location=${encodeURIComponent(JSON.stringify(location))}`;
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/banners?placement=${encodeURIComponent(placement)}&limit=${limit}${locationParam}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success) {
          const visible = (data.data || []).filter(banner => (
            sessionStorage.getItem(storageKey(placement, banner.id)) !== '1'
          ));
          setBanners(visible);
        }
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });

    return () => {
      cancelled = true;
    };
  }, [placement, limit, locationParam]);

  useEffect(() => {
    banners.forEach(banner => {
      if (impressed.current.has(banner.id)) return;
      impressed.current.add(banner.id);
      fetch(`${API_BASE_URL}/banners/${banner.id}/impression`, { method: 'POST' }).catch(() => {});
    });
  }, [banners]);

  const handleClick = (banner) => {
    fetch(`${API_BASE_URL}/banners/${banner.id}/click`, { method: 'POST' }).catch(() => {});
    navigate(banner.ctaRoute || '/');
  };

  const handleDismiss = (event, banner) => {
    event.stopPropagation();
    sessionStorage.setItem(storageKey(placement, banner.id), '1');
    setBanners(prev => prev.filter(item => item.id !== banner.id));
    fetch(`${API_BASE_URL}/banners/${banner.id}/dismiss`, { method: 'POST' }).catch(() => {});
  };

  if (banners.length === 0) return null;

  return (
    <Shell $compact={compact}>
      <Grid $compact={compact || banners.length === 1}>
        {banners.map((banner, index) => (
          <Card
            key={banner.id}
            type="button"
            $featured={!compact && index === 0}
            $compact={compact}
            $accent={banner.accent}
            onClick={() => handleClick(banner)}
          >
            <TopRow>
              <Badge>{banner.badge || banner.locationLabel}</Badge>
              <Dismiss type="button" onClick={(event) => handleDismiss(event, banner)} aria-label="Dismiss banner">
                x
              </Dismiss>
            </TopRow>
            <CardBody>
              <Eyebrow>{banner.eyebrow}</Eyebrow>
              <Title $featured={!compact && index === 0}>{banner.title}</Title>
              <Copy>{banner.body}</Copy>
            </CardBody>
            <Cta>{banner.cta}</Cta>
          </Card>
        ))}
      </Grid>
    </Shell>
  );
}
