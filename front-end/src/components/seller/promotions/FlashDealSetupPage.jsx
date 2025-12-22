import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';

import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 28px;
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const FormSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const TimeChips = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: ${props => props.theme.spacing.sm};
`;

const Chip = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => 
    props.$selected ? props.theme.colors.primary : 
    props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  background: ${props => 
    props.$selected ? props.theme.colors.primarySoftBg : 
    'transparent'};
  color: ${props => 
    props.$selected ? props.theme.colors.primary : 
    props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-weight: ${props => props.$selected ? 600 : 400};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const PreviewCard = styled.div`
  background: linear-gradient(135deg, #C62850 0%, #E23E66 100%);
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  color: white;
  margin-top: ${props => props.theme.spacing.lg};
  position: sticky;
  top: 20px;
`;

const PreviewTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: white;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FlashBadge = styled.span`
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 12px;
  border-radius: ${props => props.theme.radii.pill};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Countdown = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin: ${props => props.theme.spacing.md} 0;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

export function FlashDealSetupPage({ location }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeId] = useState(() => localStorage.getItem('sellerStoreId') || '1');

  const [formData, setFormData] = useState({
    title: '',
    discountValue: '',
    duration: '', // in hours
    maxInventory: '',
    startDate: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateEndDate = () => {
    if (!formData.startDate || !formData.duration) return null;
    const start = new Date(formData.startDate);
    const hours = parseInt(formData.duration) || 0;
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return end;
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    if (!formData.discountValue || !formData.duration || !formData.maxInventory) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const endDate = calculateEndDate();
      
      const promotionData = {
        type: 'flash',
        title: formData.title || `Flash Deal: ${selectedProduct.name}`,
        productIds: [selectedProduct.id],
        discountType: 'percentage',
        discountValue: parseFloat(formData.discountValue),
        maxInventory: parseInt(formData.maxInventory),
        startDate: formData.startDate || new Date().toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        sellerId: parseInt(storeId),
      };

      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Flash deal created successfully! ⚡');
        navigate('/seller/promotions');
      } else {
        toast.error(data.message || 'Failed to create flash deal');
      }
    } catch (error) {
      console.error('Error creating flash deal:', error);
      toast.error('Failed to create flash deal');
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = [
    { label: '1h', value: '1' },
    { label: '2h', value: '2' },
    { label: '4h', value: '4' },
    { label: '8h', value: '8' },
    { label: '24h', value: '24' },
  ];

  const endDate = calculateEndDate();
  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <Container>
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => navigate('/')}
        onSearchClick={() => navigate('/search')}
      />
      
      <Content>
        <Header>
          <Title>Create Flash Deal</Title>
          <Subtitle>Limited-time deals with countdown timer and inventory limits</Subtitle>
        </Header>

        <FormSection>
          <FormGroup>
            <Label>Select Product</Label>
            <select
              value={selectedProduct || ''}
              onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            >
              <option value="">Choose a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - R{product.price}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <Label>Discount Percentage</Label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              placeholder="20"
              min="1"
              max="100"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </FormGroup>

          <FormGroup>
            <Label>Duration</Label>
            <TimeChips>
              {timeOptions.map(option => (
                <Chip
                  key={option.value}
                  $selected={formData.duration === option.value}
                  onClick={() => setFormData({ ...formData, duration: option.value })}
                >
                  {option.label}
                </Chip>
              ))}
            </TimeChips>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Custom hours"
              min="1"
              max="48"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
                marginTop: '12px',
              }}
            />
            <p style={{ fontSize: '12px', color: '#667085', marginTop: '8px' }}>
              Flash deals cannot exceed 48 hours
            </p>
          </FormGroup>

          <FormGroup>
            <Label>Maximum Units Available</Label>
            <input
              type="number"
              value={formData.maxInventory}
              onChange={(e) => setFormData({ ...formData, maxInventory: e.target.value })}
              placeholder="20"
              min="1"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
            {selectedProductData && formData.maxInventory && 
             parseInt(formData.maxInventory) > (selectedProductData.stockQuantity || 0) && (
              <p style={{ fontSize: '12px', color: '#F59E0B', marginTop: '8px' }}>
                ⚠️ Not enough stock. Available: {selectedProductData.stockQuantity || 0}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Start Date & Time</Label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </FormGroup>

          {selectedProductData && formData.discountValue && (
            <PreviewCard>
              <PreviewTitle>
                <FlashBadge>⚡ FLASH DEAL</FlashBadge>
              </PreviewTitle>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {selectedProductData.name}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', marginBottom: '12px' }}>
                <span style={{ textDecoration: 'line-through', opacity: 0.8 }}>
                  R{selectedProductData.price}
                </span>
                <span style={{ fontSize: '24px', fontWeight: 700 }}>
                  R{(selectedProductData.price * (1 - parseFloat(formData.discountValue) / 100)).toFixed(2)}
                </span>
              </div>
              {endDate && (
                <Countdown>
                  Ends: {endDate.toLocaleString()}
                </Countdown>
              )}
              {formData.maxInventory && (
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Only {formData.maxInventory} units available!
                </div>
              )}
            </PreviewCard>
          )}
        </FormSection>

        <Actions>
          <Button variant="outline" onClick={() => navigate('/seller/promotions')}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            Launch Flash Deal
          </Button>
        </Actions>
      </Content>
    </Container>
  );
}


