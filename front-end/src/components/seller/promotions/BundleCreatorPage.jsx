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

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
  margin-top: ${props => props.theme.spacing.md};
`;

const ProductCard = styled.div`
  border: 2px solid ${props => 
    props.$selected ? props.theme.colors.primary : 
    props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => 
    props.$selected ? props.theme.colors.primarySoftBg : 
    props.theme.colors.background};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: ${props => props.theme.radii.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: 12px;
`;

const ProductPrice = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

const BundleSummary = styled.div`
  background: ${props => props.theme.colors.success[100]};
  border: 1px solid ${props => props.theme.colors.success[300]};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

export function BundleCreatorPage({ location }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [storeId] = useState(() => localStorage.getItem('sellerStoreId') || '1');

  const [formData, setFormData] = useState({
    bundleName: '',
    bundlePrice: '',
    description: '',
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

  const toggleProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((sum, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        return sum + (product.discountPrice || product.price);
      }
      return sum;
    }, 0);
  };

  const calculateSavings = () => {
    const total = calculateTotalPrice();
    const bundlePrice = parseFloat(formData.bundlePrice) || 0;
    return total - bundlePrice;
  };

  const calculateSavingsPercent = () => {
    const total = calculateTotalPrice();
    if (total === 0) return 0;
    const savings = calculateSavings();
    return (savings / total) * 100;
  };

  const handleSubmit = async () => {
    if (selectedProducts.length < 2) {
      toast.error('Please select at least 2 products for a bundle');
      return;
    }
    if (!formData.bundleName || !formData.bundlePrice) {
      toast.error('Please fill in bundle name and price');
      return;
    }

    const savingsPercent = calculateSavingsPercent();
    if (savingsPercent > 40) {
      if (!window.confirm('This bundle offers more than 40% savings. Are you sure?')) {
        return;
      }
    }

    try {
      setLoading(true);
      
      const promotionData = {
        type: 'bundle',
        title: formData.bundleName,
        description: formData.description,
        bundleName: formData.bundleName,
        productIds: selectedProducts,
        bundlePrice: parseFloat(formData.bundlePrice),
        sellerId: parseInt(storeId),
      };

      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Bundle created successfully! 📦');
        navigate('/seller/promotions');
      } else {
        toast.error(data.message || 'Failed to create bundle');
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Failed to create bundle');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice();
  const savings = calculateSavings();
  const savingsPercent = calculateSavingsPercent();

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
          <Title>Create Bundle</Title>
          <Subtitle>Group products together at a special price</Subtitle>
        </Header>

        <FormSection>
          <FormGroup>
            <Label>Add Products (Minimum 2)</Label>
            <ProductGrid>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  $selected={selectedProducts.includes(product.id)}
                  onClick={() => toggleProduct(product.id)}
                >
                  {product.image && (
                    <ProductImage src={product.image} alt={product.name} />
                  )}
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>
                    R{product.discountPrice || product.price}
                  </ProductPrice>
                </ProductCard>
              ))}
            </ProductGrid>
            <div style={{ marginTop: '16px', color: '#667085', fontSize: '14px' }}>
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              {selectedProducts.length < 2 && (
                <span style={{ color: '#C62850', marginLeft: '8px' }}>
                  (Need at least 2)
                </span>
              )}
            </div>
          </FormGroup>

          <FormGroup>
            <Label>Bundle Name</Label>
            <input
              type="text"
              value={formData.bundleName}
              onChange={(e) => setFormData({ ...formData, bundleName: e.target.value })}
              placeholder="e.g., Braai Essentials Pack"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
            <p style={{ fontSize: '12px', color: '#667085', marginTop: '8px' }}>
              Suggested: "Snack Combo", "Fruit Variety Box", "Braai Essentials Pack"
            </p>
          </FormGroup>

          <FormGroup>
            <Label>Bundle Price (R)</Label>
            <input
              type="number"
              value={formData.bundlePrice}
              onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
            {selectedProducts.length >= 2 && formData.bundlePrice && (
              <BundleSummary>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Bundle Summary
                </div>
                <div style={{ fontSize: '12px', color: '#667085', lineHeight: '1.8' }}>
                  <div>Total normal price: R{totalPrice.toFixed(2)}</div>
                  <div>Bundle price: R{parseFloat(formData.bundlePrice || 0).toFixed(2)}</div>
                  <div style={{ color: '#15A17C', fontWeight: 600, marginTop: '4px' }}>
                    You're offering R{savings.toFixed(2)} savings ({savingsPercent.toFixed(1)}%)
                  </div>
                  {savingsPercent > 40 && (
                    <div style={{ color: '#F59E0B', marginTop: '8px' }}>
                      ⚠️ Warning: Discount exceeds 40%
                    </div>
                  )}
                </div>
              </BundleSummary>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Description (Optional)</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included in this bundle"
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #F2F4F7',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
              }}
            />
          </FormGroup>
        </FormSection>

        <Actions>
          <Button variant="outline" onClick={() => navigate('/seller/promotions')}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || selectedProducts.length < 2}
          >
            Publish Bundle
          </Button>
        </Actions>
      </Content>
    </Container>
  );
}


