import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const GalleryContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 0.92;
  overflow: hidden;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.28), rgba(196, 184, 252, 0.22), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 30px 70px rgba(16, 24, 40, 0.14);
  isolation: isolate;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255,255,255,0) 48%, rgba(13,28,51,0.36) 100%),
      linear-gradient(115deg, rgba(255,255,255,0.28), transparent 42%);
    pointer-events: none;
    z-index: 2;
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    border-radius: 24px;
    aspect-ratio: 1;
  }
`;

const ImageCarousel = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(${props => -props.$currentIndex * 100}%);
  transition: transform 0.4s ease-out;
`;

const ImageSlide = styled.div`
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.gradient.soft};
  cursor: zoom-in;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  ${GalleryContainer}:hover & {
    transform: scale(1.035);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active 
    ? props.theme.colors.primary 
    : 'rgba(255, 255, 255, 0.72)'};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  position: relative;
  z-index: 3;
`;

const GalleryIndicator = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background: rgba(255, 255, 255, 0.88);
  color: ${props => props.theme.colors.text.primary};
  padding: 8px 12px;
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-weight: 800;
  z-index: 3;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: #ffffff;
    transform: scale(1.05);
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-in;
`;

const FullscreenImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.xl};
  right: ${props => props.theme.spacing.xl};
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: ${props => props.theme.radii.circle};
  width: 44px;
  height: 44px;
  color: ${props => props.theme.colors.text.inverse};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

export const MediaGallery = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use product images or fallback to single image
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [];

  if (images.length === 0) {
    return (
      <GalleryContainer>
        <ImagePlaceholder>F</ImagePlaceholder>
      </GalleryContainer>
    );
  }

  const handleImageClick = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <GalleryContainer>
        <ImageCarousel $currentIndex={currentIndex}>
          {images.map((image, index) => (
            <ImageSlide key={index} onClick={handleImageClick}>
              <ProductImage src={image} alt={`${product.name} - Image ${index + 1}`} />
            </ImageSlide>
          ))}
        </ImageCarousel>
        
        {images.length > 1 && (
          <>
            <GalleryIndicator onClick={handleImageClick}>
              {currentIndex + 1} / {images.length}
            </GalleryIndicator>
            <Dots>
              {images.map((_, index) => (
                <Dot
                  key={index}
                  $active={index === currentIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </Dots>
          </>
        )}
        {images.length === 1 && (
          <GalleryIndicator onClick={handleImageClick}>
            View image
          </GalleryIndicator>
        )}
      </GalleryContainer>

      {isFullscreen && (
        <FullscreenOverlay onClick={handleCloseFullscreen}>
          <CloseButton onClick={handleCloseFullscreen}>x</CloseButton>
          <FullscreenImage 
            src={images[currentIndex]} 
            alt={`${product.name} - Fullscreen`}
            onClick={(e) => e.stopPropagation()}
          />
        </FullscreenOverlay>
      )}
    </>
  );
};

