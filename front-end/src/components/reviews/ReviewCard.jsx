import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { toast } from '../ui/Toast';

const Card = styled.article`
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.14)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: clamp(16px, 3vw, 22px);

  @media (max-width: 720px) {
    grid-template-columns: 64px minmax(0, 1fr);
  }
`;

const ProductImage = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  object-fit: cover;
  background: #ffffff;
`;

const ProductImagePlaceholder = styled.div`
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 22px;
  font-weight: 900;
`;

const ProductName = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 17px;
  line-height: 1.15;
  font-weight: 900;
`;

const Meta = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 700;
  margin-top: 5px;
`;

const StarSelector = styled.div`
  display: flex;
  gap: 4px;

  @media (max-width: 720px) {
    grid-column: 1 / -1;
  }
`;

const Star = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 14px;
  background: ${props => props.$filled ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$filled ? '#ffffff' : props.theme.colors.primarySoftText};
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
`;

const Expanded = styled.div`
  padding: 0 clamp(16px, 3vw, 22px) clamp(16px, 3vw, 22px);
`;

const TextInput = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 14px;
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 18px;
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
`;

const Chip = styled.button`
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 999px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
`;

const Footer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
`;

const Helper = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const SubmitButton = styled.button`
  min-height: 42px;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: ${props => props.disabled ? props.theme.colors.neutral[200] : props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const suggestedPhrases = ['Great quality', 'Fast delivery', 'Friendly seller', 'Good value', 'Would buy again'];

const formatDate = (value) => {
  if (!value) return 'recently';
  return new Date(value).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
};

export const ReviewCard = ({ item, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const maxChars = 1000;

  const handleStarClick = (value) => {
    setRating(value);
    setExpanded(true);
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.warning('Please select a rating');
      return;
    }
    await onSubmit({
      orderId: item.orderId,
      orderItemId: item.orderItemId,
      productId: item.productId,
      storeId: item.storeId,
      rating,
      content: content.trim(),
    });
    setRating(0);
    setContent('');
    setExpanded(false);
  };

  return (
    <Card>
      <CardContent>
        {item.productImage ? (
          <ProductImage src={item.productImage} alt={item.productName} />
        ) : (
          <ProductImagePlaceholder>R</ProductImagePlaceholder>
        )}
        <div>
          <ProductName>{item.productName || 'Product'}</ProductName>
          <Meta>{item.storeName || 'Store'} | Delivered {formatDate(item.deliveredAt || item.orderDate)}</Meta>
        </div>
        <StarSelector>
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} $filled={star <= rating} onClick={() => handleStarClick(star)}>
              {star}
            </Star>
          ))}
        </StarSelector>
      </CardContent>
      {expanded && (
        <Expanded>
          <TextInput
            placeholder="Tell nearby shoppers what you liked..."
            value={content}
            maxLength={maxChars}
            onChange={event => setContent(event.target.value.slice(0, maxChars))}
          />
          <ChipRow>
            {suggestedPhrases.map(phrase => (
              <Chip key={phrase} onClick={() => setContent(prev => prev ? `${prev.trim()}, ${phrase}` : phrase)}>
                {phrase}
              </Chip>
            ))}
          </ChipRow>
          <Footer>
            <Helper>{content.length} / {maxChars} | Earn 10 points for a helpful review</Helper>
            <SubmitButton onClick={handleSubmit} disabled={!rating || submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </SubmitButton>
          </Footer>
        </Expanded>
      )}
    </Card>
  );
};
