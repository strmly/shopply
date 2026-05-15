import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.article`
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.14)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 22px);
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;

  @media (max-width: 700px) {
    grid-template-columns: 64px minmax(0, 1fr);
  }
`;

const ProductImage = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  object-fit: cover;
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

const Rating = styled.div`
  display: flex;
  gap: 4px;

  @media (max-width: 700px) {
    grid-column: 1 / -1;
  }
`;

const Star = styled.span`
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: ${props => props.$filled ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$filled ? '#ffffff' : props.theme.colors.primarySoftText};
  border: 1px solid rgba(228,231,236,0.95);
  font-size: 12px;
  font-weight: 900;
`;

const ReviewText = styled.p`
  margin: 16px 0 0;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.5;
  font-size: 14px;
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(228,231,236,0.9);
`;

const ActionButton = styled.button`
  min-height: 40px;
  border: 1px solid ${props => props.$danger ? 'rgba(198,40,80,0.22)' : 'rgba(228,231,236,0.95)'};
  border-radius: 999px;
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : props.$danger ? 'rgba(198,40,80,0.08)' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.$danger ? (props.theme.colors.dangerBase || '#C62850') : props.theme.colors.primarySoftText};
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
`;

const EditForm = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 12px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 14px;
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 18px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
`;

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

const isEditable = (createdAt) => {
  const days = Math.ceil(Math.abs(new Date() - new Date(createdAt)) / 86400000);
  return days <= 7;
};

export const ReviewHistoryCard = ({ review, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating || 5);
  const [content, setContent] = useState(review.content || '');
  const editable = isEditable(review.createdAt);

  const save = async () => {
    await onUpdate(review.id, { rating, content });
    setEditing(false);
  };

  return (
    <Card>
      <TopRow>
        {review.productImage ? (
          <ProductImage src={review.productImage} alt={review.productName || 'Product'} />
        ) : (
          <ProductImagePlaceholder>R</ProductImagePlaceholder>
        )}
        <div>
          <ProductName>{review.productName || 'Product'}</ProductName>
          <Meta>{review.storeName || 'Store'} | Submitted {formatDate(review.createdAt)}</Meta>
        </div>
        <Rating>
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} $filled={star <= (editing ? rating : review.rating)}>{star}</Star>
          ))}
        </Rating>
      </TopRow>

      {editing ? (
        <EditForm>
          <Rating>
            {[1, 2, 3, 4, 5].map(star => (
              <ActionButton key={star} $primary={star <= rating} onClick={() => setRating(star)}>{star}</ActionButton>
            ))}
          </Rating>
          <TextArea value={content} maxLength={1000} onChange={event => setContent(event.target.value.slice(0, 1000))} />
          <Actions>
            <ActionButton onClick={() => setEditing(false)}>Cancel</ActionButton>
            <ActionButton $primary onClick={save}>Update Review</ActionButton>
          </Actions>
        </EditForm>
      ) : (
        <>
          {review.content && <ReviewText>{review.content}</ReviewText>}
          <Actions>
            {editable && <ActionButton onClick={() => setEditing(true)}>Edit review</ActionButton>}
            <ActionButton $danger onClick={() => onDelete(review.id)}>Delete</ActionButton>
          </Actions>
        </>
      )}
    </Card>
  );
};
