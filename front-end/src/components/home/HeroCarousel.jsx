import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: clamp(560px, 58vw, 680px);
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.xl};
  background: #ffffff;

  @media (max-width: 760px) {
    min-height: auto;
    display: grid;
    overflow: visible;
  }

  @media (max-width: 420px) {
    min-height: auto;
  }
`;

const Slide = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 42%, rgba(241,247,255,0.78) 100%),
    ${props => props.$image ? `url(${props.$image})` : props.$gradient || props.theme.colors.gradient.soft};
  background-size: cover;
  background-position: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
  align-items: start;
  gap: clamp(18px, 4vw, 32px);
  padding: 54px clamp(14px, 7vw, 88px) 92px;
  opacity: ${props => props.$active ? 1 : 0};
  transform: translateX(${props => props.$active ? '0' : props.$direction === 'next' ? '18px' : '-18px'});
  transition: opacity 0.45s ease-out, transform 0.45s ease-out;
  cursor: pointer;
  pointer-events: ${props => props.$active ? 'auto' : 'none'};

  @media (max-width: 760px) {
    position: relative;
    grid-area: 1 / 1;
    grid-template-columns: 1fr;
    align-content: start;
    padding: 28px clamp(14px, 5vw, 24px) 82px;
    gap: 18px;
    min-height: 0;
  }

  @media (max-width: 420px) {
    padding: 22px 14px 64px;
    gap: 16px;
  }
`;

const SlideContent = styled.div`
  color: ${props => props.theme.colors.text.primary};
  max-width: 620px;
  min-width: 0;
  position: relative;
  z-index: 2;
  align-self: center;

  @media (max-width: 760px) {
    max-width: none;
    align-self: start;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  color: ${props => props.theme.colors.primarySoftText};
  ${props => props.theme.typography.caption}
  font-weight: 800;
  text-transform: uppercase;

  @media (max-width: 420px) {
    max-width: 100%;
    font-size: 10px;
    padding: 7px 10px;
    margin-bottom: 12px;
    overflow-wrap: anywhere;
  }
`;

const DotMark = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.successBase};
`;

const SlideTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 14px;
  font-size: clamp(32px, 6.4vw, 72px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
  max-width: 11ch;
  overflow-wrap: anywhere;

  @media (max-width: 760px) {
    max-width: 14ch;
    font-size: clamp(34px, 10vw, 58px);
  }

  @media (max-width: 420px) {
    font-size: clamp(30px, 11vw, 42px);
    line-height: 1.03;
    margin-bottom: 12px;
  }
`;

const SlideSubtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 24px;
  max-width: 520px;
  font-weight: 500;

  @media (max-width: 760px) {
    max-width: 62ch;
  }

  @media (max-width: 420px) {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 18px;
  }
`;

const CTAButton = styled.button`
  ${props => props.theme.typography.button}
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: 999px;
  padding: 14px 22px;
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 18px 32px rgba(16, 24, 40, 0.18);

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme.colors.gradient.primary};
  }

  @media (max-width: 420px) {
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
  }
`;

const HeroPanel = styled.div`
  align-self: stretch;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 320px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 28px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 30px 70px rgba(16, 24, 40, 0.14);

  @media (max-width: 760px) {
    min-height: 0;
    height: auto;
    aspect-ratio: 16 / 10;
    border-radius: 22px;
  }

  @media (max-width: 420px) {
    aspect-ratio: 1.25;
  }
`;

const ProductImage = styled.div`
  min-height: 0;
  background:
    linear-gradient(180deg, rgba(255,255,255,0) 45%, rgba(255,255,255,0.95) 100%),
    ${props => props.$image ? `url(${props.$image})` : props.theme.colors.gradient.soft};
  background-size: cover;
  background-position: center;
`;

const PanelMeta = styled.div`
  padding: 18px;
  display: grid;
  gap: 6px;

  @media (max-width: 420px) {
    padding: 14px;
  }
`;

const PanelLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const PanelTitle = styled.strong`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 420px) {
    font-size: 16px;
    line-height: 1.25;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 520px;
  margin-top: 24px;
  position: relative;
  z-index: 3;

  @media (max-width: 760px) {
    max-width: none;
    grid-template-columns: repeat(3, minmax(92px, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 20px;
  }

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  padding: 14px;
  min-width: 0;
  border: 1px solid rgba(61, 129, 239, 0.14);
  border-radius: 18px;
  background: rgba(255,255,255,0.9);
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.07);

  @media (max-width: 420px) {
    padding: 10px 8px;
    min-height: 70px;
  }
`;

const StatValue = styled.div`
  ${props => props.theme.typography.heading3}
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;

  @media (max-width: 420px) {
    font-size: 16px;
  }
`;

const StatLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  overflow-wrap: anywhere;

  @media (max-width: 420px) {
    font-size: 10px;
    line-height: 1.25;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => props.theme.colors.gradient.primary};
  width: ${props => props.$progress}%;
  transition: width 0.1s linear;
  z-index: 10;
`;

const Dots = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const Dot = styled.button`
  width: ${props => props.$active ? '28px' : '8px'};
  height: 8px;
  border-radius: 999px;
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.neutral[200]};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  padding: 0;
`;

const getSlides = (theme, featuredProducts, suburb) => [
  {
    id: 1,
    eyebrow: `Curated in ${suburb}`,
    title: 'Beautiful furniture, close to home',
    subtitle: 'Discover refined pieces from nearby sellers, fast delivery windows, and deals that make a room feel instantly considered.',
    cta: 'Explore the edit',
    gradient: theme.colors.gradient.soft,
    route: '/deals',
    product: featuredProducts[0],
  },
  {
    id: 2,
    eyebrow: 'Weekend refresh',
    title: 'Statement pieces without the showroom wait',
    subtitle: 'Shop living, dining, bedroom, and outdoor finds with trusted local availability.',
    cta: 'Shop rooms',
    gradient: theme.colors.gradient.secondary,
    route: '/bundles',
    product: featuredProducts[1] || featuredProducts[0],
  },
  {
    id: 3,
    eyebrow: 'Fresh arrivals',
    title: 'New silhouettes for every corner',
    subtitle: 'Layer in texture, storage, comfort, and light with fresh drops from sellers near you.',
    cta: 'See new arrivals',
    gradient: theme.colors.gradient.primary,
    route: '/new',
    product: featuredProducts[2] || featuredProducts[0],
  },
];

export const HeroCarousel = ({ onSlideClick, featuredProducts = [], location }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const suburb = location?.suburb || 'your area';
  const slides = useMemo(
    () => getSlides(theme, featuredProducts.filter(Boolean), suburb),
    [theme, featuredProducts, suburb]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % slides.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handleButtonClick = (e, slide) => {
    e.stopPropagation();
    if (slide.route) {
      navigate(slide.route);
    }
    if (onSlideClick) {
      onSlideClick(slide);
    }
  };

  const handleSlideClick = (slide) => {
    if (slide.route) {
      navigate(slide.route);
    }
    if (onSlideClick) {
      onSlideClick(slide);
    }
  };

  return (
    <CarouselContainer>
      {slides.map((slide, index) => {
        const productImage = slide.product?.image || slide.product?.images?.[0];
        return (
          <Slide
            key={slide.id}
            $active={index === currentIndex}
            $direction={index > currentIndex ? 'next' : 'prev'}
            $gradient={slide.gradient}
            $image={productImage}
            onClick={() => handleSlideClick(slide)}
          >
            <SlideContent>
              <Eyebrow><DotMark />{slide.eyebrow}</Eyebrow>
              <SlideTitle>{slide.title}</SlideTitle>
              <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
              <CTAButton onClick={(e) => handleButtonClick(e, slide)}>
                {slide.cta}
              </CTAButton>
              <StatsRow>
                <Stat>
                  <StatValue>5 km</StatValue>
                  <StatLabel>nearby stock</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>R0</StatValue>
                  <StatLabel>browse fees</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>4.8</StatValue>
                  <StatLabel>local rating</StatLabel>
                </Stat>
              </StatsRow>
            </SlideContent>
            <HeroPanel>
              <ProductImage $image={productImage} />
              <PanelMeta>
                <PanelLabel>{slide.product?.storeName || 'Featured find'}</PanelLabel>
                <PanelTitle>{slide.product?.name || 'Curated furniture for your home'}</PanelTitle>
              </PanelMeta>
            </HeroPanel>
          </Slide>
        );
      })}
      <ProgressBar $progress={progress} />
      <Dots>
        {slides.map((_, index) => (
          <Dot
            key={index}
            $active={index === currentIndex}
            onClick={() => handleDotClick(index)}
            aria-label={`Show slide ${index + 1}`}
          />
        ))}
      </Dots>
    </CarouselContainer>
  );
};
