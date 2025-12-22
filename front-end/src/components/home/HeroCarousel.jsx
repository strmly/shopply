import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { fadeIn } from '../../theme/animations';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Slide = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.$gradient || props.theme.colors.gradient.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  opacity: ${props => props.$active ? 1 : 0};
  transform: translateX(${props => props.$active ? '0' : props.$direction === 'next' ? '100%' : '-100%'});
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  cursor: pointer;
`;

const SlideContent = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.text.inverse};
  max-width: 80%;
`;

const SlideTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.inverse};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-shadow: ${props => props.theme.shadows.sm};
`;

const SlideSubtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.inverse};
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.95;
  text-shadow: ${props => props.theme.shadows.xs};
`;

const CTAButton = styled.button`
  ${props => props.theme.typography.button}
  background: ${props => props.theme.colors.text.inverse};
  color: ${props => props.theme.colors.primary};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.md};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.primary};
  width: ${props => props.$progress}%;
  transition: width 0.1s linear;
  z-index: 10;
`;

const Dots = styled.div`
  position: absolute;
  bottom: ${props => props.theme.spacing.md};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  z-index: 10;
`;

const Dot = styled.button`
  width: ${props => props.theme.spacing.xs};
  height: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.radii.circle};
  border: none;
  background: ${props =>
    props.$active
      ? props.theme.colors.text.inverse
      : props.theme.colors.neutral[150]};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  padding: 0;
`;

const getSlides = (theme) => [
  {
    id: 1,
    title: '🔥 Flash Sale — Today Only',
    subtitle: 'Up to 50% off on selected items',
    cta: 'Shop Now',
    gradient: theme.colors.gradient.danger,
    route: '/deals',
  },
  {
    id: 2,
    title: '🥩 Braai Weekend Box',
    subtitle: 'Save R120 on braai bundles',
    cta: 'View Deals',
    gradient: theme.colors.gradient.warning,
    route: '/bundles',
  },
  {
    id: 3,
    title: '🧼 Household Essentials',
    subtitle: 'Best prices nearby',
    cta: 'Shop Now',
    gradient: theme.colors.gradient.success,
    route: '/category/Home',
  },
];

export const HeroCarousel = ({ onSlideClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const slides = getSlides(theme);
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
    e.stopPropagation(); // Prevent slide click from firing
    if (slide.route) {
      navigate(slide.route);
    }
    if (onSlideClick) {
      onSlideClick(slide);
    }
  };

  const handleSlideClick = (slide) => {
    // Navigate to the route when slide is clicked (but not when button is clicked)
    if (slide.route) {
      navigate(slide.route);
    }
    if (onSlideClick) {
      onSlideClick(slide);
    }
  };

  return (
    <CarouselContainer>
      {slides.map((slide, index) => (
        <Slide
          key={slide.id}
          $active={index === currentIndex}
          $direction={index > currentIndex ? 'next' : 'prev'}
          $gradient={slide.gradient}
          onClick={() => handleSlideClick(slide)}
        >
          <SlideContent>
            <SlideTitle>{slide.title}</SlideTitle>
            <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
            <CTAButton onClick={(e) => handleButtonClick(e, slide)}>
              {slide.cta}
            </CTAButton>
          </SlideContent>
        </Slide>
      ))}
      <ProgressBar $progress={progress} />
      <Dots>
        {slides.map((_, index) => (
          <Dot
            key={index}
            $active={index === currentIndex}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </Dots>
    </CarouselContainer>
  );
};

