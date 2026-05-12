import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: 26px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 24px;
  box-shadow: 0 14px 32px rgba(16, 24, 40, 0.06);
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 900;
  font-size: 18px;
`;

const DescriptionText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  font-size: 15px;
  font-weight: 500;
  
  ${props => !props.$expanded && `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const ReadMoreButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm} 0;
  margin-top: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.8;
  }
`;

export const ProductDescription = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const description = product.description || 'No description available.';

  const needsExpansion = description.length > 100;

  return (
    <Container>
      <SectionTitle>Description</SectionTitle>
      <DescriptionText $expanded={expanded || !needsExpansion}>
        {description}
      </DescriptionText>
      {needsExpansion && (
        <ReadMoreButton onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Read less' : 'Read more'}
        </ReadMoreButton>
      )}
    </Container>
  );
};











