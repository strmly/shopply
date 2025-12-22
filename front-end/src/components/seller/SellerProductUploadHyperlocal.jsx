import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * SellerProductUploadHyperlocal Component
 * Enhanced product upload with hyperlocal features
 */
const SellerProductUploadHyperlocal = ({ storeData, onProductCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    images: [],
  });

  const [showLocalityInfo, setShowLocalityInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create product with hyperlocal indexing
    const productData = {
      ...formData,
      storeId: storeData.id,
    };

    if (onProductCreate) {
      await onProductCreate(productData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Header>
          <Title>Add New Product</Title>
          <Subtitle>Your products will appear to nearby customers first</Subtitle>
        </Header>

        {/* Locality Info Banner */}
        <LocalityBanner>
          <LocalityIcon>📍</LocalityIcon>
          <LocalityContent>
            <LocalityTitle>Your Store Location</LocalityTitle>
            <LocalityAddress>
              {storeData?.address?.street}, {storeData?.address?.suburb}
            </LocalityAddress>
            <LocalityRadius onClick={() => setShowLocalityInfo(!showLocalityInfo)}>
              Customers within {storeData?.serviceRadiusKm || 10}km will see this first
              <ToggleIcon>{showLocalityInfo ? '▼' : '▶'}</ToggleIcon>
            </LocalityRadius>
          </LocalityContent>
        </LocalityBanner>

        {showLocalityInfo && (
          <LocalityDetails>
            <DetailItem>
              <DetailIcon>✓</DetailIcon>
              <DetailText>
                <DetailLabel>Location Verified</DetailLabel>
                <DetailDesc>
                  Your store pin is accurate and will help customers find you
                </DetailDesc>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon>⚡</DetailIcon>
              <DetailText>
                <DetailLabel>Hyperlocal Visibility</DetailLabel>
                <DetailDesc>
                  Products appear to nearby customers first, then expand automatically
                </DetailDesc>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon>📊</DetailIcon>
              <DetailText>
                <DetailLabel>Quality Matters</DetailLabel>
                <DetailDesc>
                  Keep inventory updated and maintain good ratings for better visibility
                </DetailDesc>
              </DetailText>
            </DetailItem>
          </LocalityDetails>
        )}

        {/* Product Form Fields */}
        <FormSection>
          <Label>Product Name *</Label>
          <Input
            type="text"
            placeholder="e.g., Fresh Organic Tomatoes"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </FormSection>

        <FormSection>
          <Label>Description</Label>
          <TextArea
            placeholder="Describe your product..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
          />
        </FormSection>

        <FormRow>
          <FormSection>
            <Label>Price (R) *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              required
            />
          </FormSection>

          <FormSection>
            <Label>Stock Quantity *</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.stockQuantity}
              onChange={(e) => handleChange('stockQuantity', e.target.value)}
              required
            />
            <Hint>
              Keep this updated for better ranking
            </Hint>
          </FormSection>
        </FormRow>

        <FormSection>
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
          >
            <option value="">Select a category</option>
            <option value="groceries">Groceries</option>
            <option value="bakery">Bakery</option>
            <option value="meat">Meat & Poultry</option>
            <option value="dairy">Dairy</option>
            <option value="produce">Fresh Produce</option>
            <option value="beverages">Beverages</option>
            <option value="snacks">Snacks</option>
            <option value="other">Other</option>
          </Select>
        </FormSection>

        {/* Visibility Tips */}
        <VisibilityTips>
          <TipsTitle>💡 Tips for Maximum Visibility</TipsTitle>
          <TipsList>
            <TipItem>Update inventory regularly (recent updates boost ranking)</TipItem>
            <TipItem>Add clear photos and detailed descriptions</TipItem>
            <TipItem>Maintain good ratings and fast fulfillment</TipItem>
            <TipItem>Keep your store open during listed hours</TipItem>
          </TipsList>
        </VisibilityTips>

        {/* Stock Update Reminder */}
        <StockReminder>
          <ReminderIcon>⏰</ReminderIcon>
          <ReminderText>
            <ReminderTitle>Last stock update</ReminderTitle>
            <ReminderTime>Just now</ReminderTime>
          </ReminderText>
        </StockReminder>

        <ButtonRow>
          <Button type="button" secondary onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit">
            Create Product
          </Button>
        </ButtonRow>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const LocalityBanner = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #81C784;
`;

const LocalityIcon = styled.div`
  font-size: 24px;
`;

const LocalityContent = styled.div`
  flex: 1;
`;

const LocalityTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #2E7D32;
  margin-bottom: 4px;
`;

const LocalityAddress = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
`;

const LocalityRadius = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #2E7D32;
  cursor: pointer;
  user-select: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ToggleIcon = styled.span`
  font-size: 10px;
`;

const LocalityDetails = styled.div`
  background: #F5F5F5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailIcon = styled.div`
  font-size: 18px;
  color: #4CAF50;
  margin-top: 2px;
`;

const DetailText = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 2px;
`;

const DetailDesc = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const Hint = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 6px;
`;

const VisibilityTips = styled.div`
  background: #FFF8E1;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 2px solid #FFD54F;
`;

const TipsTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #F57C00;
  margin-bottom: 12px;
`;

const TipsList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const TipItem = styled.li`
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StockReminder = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #E3F2FD;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const ReminderIcon = styled.div`
  font-size: 20px;
`;

const ReminderText = styled.div`
  flex: 1;
`;

const ReminderTitle = styled.div`
  font-size: 12px;
  color: #666;
`;

const ReminderTime = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1976D2;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 32px;
  background: ${props => props.secondary ? 'transparent' : '#007AFF'};
  color: ${props => props.secondary ? '#007AFF' : 'white'};
  border: ${props => props.secondary ? '2px solid #007AFF' : 'none'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    background: ${props => props.secondary ? '#f0f0f0' : '#0056b3'};
  }
`;

export default SellerProductUploadHyperlocal;

