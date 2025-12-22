import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { toast } from '../ui/Toast';

// Local animations for review interactions
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

const starPulse = keyframes`
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  overflow: hidden;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  
  ${props => props.$expanded && `
    box-shadow: ${props.theme.shadows.md};
  `}
`;

const CardContent = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ProductImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  object-fit: cover;
  flex-shrink: 0;
  background: ${props => props.theme.colors.background};
`;

const ProductImagePlaceholder = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  min-width: 0;
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const OrderDate = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
`;

const StarSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
  flex-shrink: 0;
`;

const Star = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  line-height: 1;
  position: relative;
  
  &:hover {
    transform: scale(1.2);
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  ${props => props.$justSelected && `
    animation: ${starPulse} 0.3s ease;
  `}
`;

const ExpandedContent = styled.div`
  padding: 0 ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  animation: ${slideDown} 0.3s ease-out;
  overflow: hidden;
`;

const TextInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};
  resize: vertical;
  font-family: inherit;
  margin-bottom: ${props => props.theme.spacing.xs};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const CharCount = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.$count > 900) return props.theme.colors.danger[600];
    if (props.$count > 800) return props.theme.colors.warning[600];
    return props.theme.colors.text.tertiary;
  }};
  font-size: 11px;
  text-align: right;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SuggestedChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Chip = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  background: ${props => props.theme.colors.background};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
  }
`;

const RewardNudge = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  margin-bottom: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$disabled 
    ? props.theme.colors.border.light 
    : props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;


const suggestedPhrases = [
  'Great quality',
  'Fast delivery',
  'Friendly seller',
  'Good value',
  'Would buy again',
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ReviewCard = ({ item, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [justSelectedStar, setJustSelectedStar] = useState(null);

  const handleStarClick = (starRating) => {
    setRating(starRating);
    setJustSelectedStar(starRating);
    setTimeout(() => setJustSelectedStar(null), 300);
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleChipClick = (phrase) => {
    // Add phrase with proper spacing
    if (content.trim()) {
      setContent(content.trim() + ', ' + phrase);
    } else {
      setContent(phrase);
    }
    // Focus the textarea after adding phrase
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning('Please select a rating');
      return;
    }
    
    try {
      const success = await onSubmit({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        productId: item.productId,
        storeId: item.storeId,
        rating,
        content: content.trim(),
      });
      
      if (success) {
        setSubmitted(true);
        setTimeout(() => {
          setExpanded(false);
          setRating(0);
          setContent('');
          setSubmitted(false);
        }, 1500);
      }
    } catch (error) {
      // Error already handled by parent component
    }
  };

  const maxChars = 1000;
  const charCount = content.length;

  if (submitted) {
    return null; // Card will be removed from list after submission
  }

  return (
    <Card $expanded={expanded}>
      <CardContent>
        {item.productImage ? (
          <ProductImage src={item.productImage} alt={item.productName} />
        ) : (
          <ProductImagePlaceholder>📦</ProductImagePlaceholder>
        )}
        <ProductInfo>
          <ProductName>{item.productName}</ProductName>
          <StoreName>{item.storeName}</StoreName>
          <OrderDate>Ordered {formatDate(item.orderDate)}</OrderDate>
        </ProductInfo>
        <StarSelector>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onClick={() => handleStarClick(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              $justSelected={justSelectedStar === star}
            >
              {star <= rating ? '⭐' : '☆'}
            </Star>
          ))}
        </StarSelector>
      </CardContent>
      
      {expanded && (
        <ExpandedContent>
          <TextInput
            placeholder="Tell others what you liked (optional)"
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setContent(e.target.value);
              }
            }}
            maxLength={maxChars}
          />
          <CharCount $count={charCount}>
            {charCount} / {maxChars}
          </CharCount>
          <SuggestedChips>
            {suggestedPhrases.map((phrase) => (
              <Chip
                key={phrase}
                onClick={() => handleChipClick(phrase)}
              >
                {phrase}
              </Chip>
            ))}
          </SuggestedChips>
          <RewardNudge>
            🎁 Earn 10 points for leaving a review
          </RewardNudge>
          <SubmitButton
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </SubmitButton>
        </ExpandedContent>
      )}
    </Card>
  );
};

