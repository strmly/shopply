import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { Button } from '../../ui/Button';
import { Input, InputContainer, Label } from '../../ui/Input';
import { SkeletonCard, SkeletonText } from '../../ui/Skeleton';
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

  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.md};
  }
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

const StepsIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.theme.colors.border.light};
    z-index: 0;
  }
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => 
    props.$active ? props.theme.colors.primary : 
    props.$completed ? props.theme.colors.successBase : 
    props.theme.colors.surface};
  color: ${props => 
    props.$active || props.$completed ? '#fff' : 
    props.theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid ${props => 
    props.$active ? props.theme.colors.primary : 
    props.$completed ? props.theme.colors.successBase : 
    props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.swift};
`;

const StepLabel = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.caption}
  color: ${props => 
    props.$active ? props.theme.colors.primary : 
    props.theme.colors.text.secondary};
  font-weight: ${props => props.$active ? 600 : 400};
  text-align: center;
`;

const StepContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
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

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: ${props => props.theme.spacing.sm};
`;

const DiscountChips = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: ${props => props.theme.spacing.sm};
`;

const Chip = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
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
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  margin-top: ${props => props.theme.spacing.lg};
  position: sticky;
  top: 20px;
`;

const PreviewTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const PreviewPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const OldPrice = styled.span`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
`;

const NewPrice = styled.span`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
`;

const DiscountBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: ${props => props.theme.colors.success[100]};
  color: ${props => props.theme.colors.success[600]};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.caption}
  font-weight: 600;
`;

const WarningBox = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.warning[100]};
  border: 1px solid ${props => props.theme.colors.warning[300]};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.warning[600]};
  ${props => props.theme.typography.body2}
  margin-top: ${props => props.theme.spacing.md};
`;

const ErrorBox = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger[100]};
  border: 1px solid ${props => props.theme.colors.danger[300]};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.danger[600]};
  ${props => props.theme.typography.body2}
  margin-top: ${props => props.theme.spacing.sm};
  font-size: 13px;
`;

const ConflictBox = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.warning[100]};
  border: 2px solid ${props => props.theme.colors.warning[400]};
  border-radius: ${props => props.theme.radii.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ConflictTitle = styled.h4`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.warning[600]};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ConflictList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const ConflictItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
`;

const ConflictItemTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ConflictItemDetails = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

const steps = [
  { number: 1, label: 'Products' },
  { number: 2, label: 'Discount' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Review' },
];

export function CreateDiscountPage({ location }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [storeId] = useState(() => localStorage.getItem('sellerStoreId') || '1');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage', // 'percentage', 'amount', 'new_price'
    discountValue: '',
    minPurchase: 0,
    startDate: '',
    endDate: '',
    showAsDeal: true,
    showOnHomePage: false,
    showOnCategoryPage: true,
    boostInSearch: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateDiscount = () => {
    if (!formData.discountValue || selectedProducts.length === 0) return null;
    
    const product = products.find(p => p.id === selectedProducts[0]);
    if (!product) return null;

    const originalPrice = product.discountPrice || product.price;
    let newPrice = originalPrice;
    let discountPercent = 0;

    if (formData.discountType === 'percentage') {
      discountPercent = parseFloat(formData.discountValue);
      newPrice = originalPrice * (1 - discountPercent / 100);
    } else if (formData.discountType === 'amount') {
      newPrice = originalPrice - parseFloat(formData.discountValue);
      discountPercent = (parseFloat(formData.discountValue) / originalPrice) * 100;
    } else if (formData.discountType === 'new_price') {
      newPrice = parseFloat(formData.discountValue);
      discountPercent = ((originalPrice - newPrice) / originalPrice) * 100;
    }

    return { originalPrice, newPrice, discountPercent };
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setFieldErrors({});
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/seller/promotions');
    }
  };

  const [conflicts, setConflicts] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (selectedProducts.length === 0) {
        errors.products = 'Please select at least one product';
      }
    }
    
    if (step === 2) {
      if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
        errors.discountValue = 'Please enter a valid discount value';
      }
      if (formData.discountType === 'percentage' && parseFloat(formData.discountValue) > 100) {
        errors.discountValue = 'Percentage cannot exceed 100%';
      }
    }
    
    if (step === 3) {
      if (!formData.startDate) {
        errors.startDate = 'Start date is required';
      }
      if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setConflicts(null);
      setFieldErrors({});
      
      const promotionData = {
        type: 'percentage',
        title: formData.title || `Discount on ${selectedProducts.length} products`,
        description: formData.description,
        productIds: selectedProducts,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || null,
        showAsDeal: formData.showAsDeal,
        showOnHomePage: formData.showOnHomePage,
        showOnCategoryPage: formData.showOnCategoryPage,
        boostInSearch: formData.boostInSearch,
        sellerId: parseInt(storeId),
      };

      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Promotion created successfully! 🎉');
        navigate('/seller/promotions');
      } else {
        // Handle conflicts
        if (data.conflicts && data.conflicts.length > 0) {
          setConflicts(data.conflicts);
          toast.error(data.message || 'Promotion conflicts with existing promotions');
        } else if (data.field) {
          // Handle field-specific errors
          setFieldErrors({ [data.field]: data.message });
          toast.error(data.message);
        } else {
          toast.error(data.message || 'Failed to create promotion');
        }
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const discount = calculateDiscount();
  const showWarning = formData.discountType === 'percentage' && 
    parseFloat(formData.discountValue) > 50;

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
          <Title>Create Discount</Title>
          <Subtitle>Offer percentage or fixed amount off your products</Subtitle>
        </Header>

        <StepsIndicator>
          {steps.map((step) => (
            <Step key={step.number}>
              <StepCircle
                $active={currentStep === step.number}
                $completed={currentStep > step.number}
              >
                {currentStep > step.number ? '✓' : step.number}
              </StepCircle>
              <StepLabel $active={currentStep === step.number}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </StepsIndicator>

        <div style={{ display: 'flex', gap: '24px' }}>
          <StepContent style={{ flex: 1 }}>
            {currentStep === 1 && (
              <div>
                <Label>Select Products</Label>
                <p style={{ color: '#667085', fontSize: '14px', marginBottom: '16px' }}>
                  Choose products to include in this discount
                </p>
                {fieldErrors.products && (
                  <ErrorBox>
                    {fieldErrors.products}
                  </ErrorBox>
                )}
                {loading ? (
                  <div>Loading products...</div>
                ) : (
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
                )}
                <div style={{ marginTop: '16px', color: '#667085', fontSize: '14px' }}>
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <FormGroup>
                  <Label>Discount Type</Label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #F2F4F7',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="amount">Amount Off</option>
                    <option value="new_price">New Price</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <Label>
                    {formData.discountType === 'percentage' ? 'Discount Percentage' :
                     formData.discountType === 'amount' ? 'Discount Amount (R)' :
                     'New Price (R)'}
                  </Label>
                  <InputContainer>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? '10' : '0.00'}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #F2F4F7',
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                  </InputContainer>
                  <DiscountChips>
                    {formData.discountType === 'percentage' && ['10', '20', '30'].map(val => (
                      <Chip
                        key={val}
                        $selected={formData.discountValue === val}
                        onClick={() => setFormData({ ...formData, discountValue: val })}
                      >
                        -{val}%
                      </Chip>
                    ))}
                  </DiscountChips>
                </FormGroup>

                {fieldErrors.discountValue && (
                  <ErrorBox>
                    {fieldErrors.discountValue}
                  </ErrorBox>
                )}
                {showWarning && !fieldErrors.discountValue && (
                  <WarningBox>
                    ⚠️ This is unusually high. Are you sure?
                  </WarningBox>
                )}

                {discount && (
                  <PreviewCard>
                    <PreviewTitle>Preview</PreviewTitle>
                    <PreviewPrice>
                      <OldPrice>R{discount.originalPrice.toFixed(2)}</OldPrice>
                      <NewPrice>R{discount.newPrice.toFixed(2)}</NewPrice>
                      <DiscountBadge>
                        {discount.discountPercent.toFixed(0)}% off
                      </DiscountBadge>
                    </PreviewPrice>
                  </PreviewCard>
                )}
                
                {conflicts && conflicts.length > 0 && (
                  <ConflictBox>
                    <ConflictTitle>
                      ⚠️ Promotion Conflicts Detected
                    </ConflictTitle>
                    <div style={{ fontSize: '13px', color: '#667085', marginBottom: '12px' }}>
                      This promotion conflicts with {conflicts.length} existing promotion{conflicts.length > 1 ? 's' : ''}. 
                      Please adjust the dates or products to resolve conflicts.
                    </div>
                    <ConflictList>
                      {conflicts.map((conflict, index) => (
                        <ConflictItem key={index}>
                          <ConflictItemTitle>
                            {conflict.promotionTitle} ({conflict.promotionType})
                          </ConflictItemTitle>
                          <ConflictItemDetails>
                            <div>Status: {conflict.promotionStatus}</div>
                            {conflict.conflictingProductNames && conflict.conflictingProductNames.length > 0 && (
                              <div>Conflicting products: {conflict.conflictingProductNames.join(', ')}</div>
                            )}
                            {conflict.existingStartDate && (
                              <div>Existing period: {new Date(conflict.existingStartDate).toLocaleString()} - {conflict.existingEndDate ? new Date(conflict.existingEndDate).toLocaleString() : 'No end date'}</div>
                            )}
                            {conflict.overlapDetails && conflict.overlapDetails.durationHours && (
                              <div>Overlap duration: {conflict.overlapDetails.durationHours} hours</div>
                            )}
                          </ConflictItemDetails>
                        </ConflictItem>
                      ))}
                    </ConflictList>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => setConflicts(null)}
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                      >
                        Dismiss
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          setCurrentStep(3);
                          setConflicts(null);
                        }}
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                      >
                        Adjust Schedule
                      </Button>
                    </div>
                  </ConflictBox>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <FormGroup>
                  <Label>Start Date & Time</Label>
                  <InputContainer>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData({ ...formData, startDate: e.target.value });
                        setFieldErrors({ ...fieldErrors, startDate: null });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${fieldErrors.startDate ? '#C62850' : '#F2F4F7'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                  </InputContainer>
                  {fieldErrors.startDate && (
                    <ErrorBox>
                      {fieldErrors.startDate}
                    </ErrorBox>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>End Date & Time (Optional)</Label>
                  <InputContainer>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => {
                        setFormData({ ...formData, endDate: e.target.value });
                        setFieldErrors({ ...fieldErrors, endDate: null });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${fieldErrors.endDate ? '#C62850' : '#F2F4F7'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                  </InputContainer>
                  {fieldErrors.endDate && (
                    <ErrorBox>
                      {fieldErrors.endDate}
                    </ErrorBox>
                  )}
                </FormGroup>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <FormGroup>
                  <Label>Promotion Title</Label>
                  <InputContainer>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Summer Sale"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #F2F4F7',
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                  </InputContainer>
                </FormGroup>

                <FormGroup>
                  <Label>Description (Optional)</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a description for this promotion"
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

                <FormGroup>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.showAsDeal}
                      onChange={(e) => setFormData({ ...formData, showAsDeal: e.target.checked })}
                    />
                    <span>Show as "Deal" badge on product card</span>
                  </label>
                </FormGroup>

                <div style={{ marginTop: '24px', padding: '16px', background: '#F9FAFB', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Summary</h4>
                  <div style={{ fontSize: '14px', color: '#667085', lineHeight: '1.8' }}>
                    <div>Products: {selectedProducts.length}</div>
                    <div>Discount: {formData.discountValue}{formData.discountType === 'percentage' ? '%' : ' R'}</div>
                    <div>Duration: {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}</div>
                  </div>
                </div>
              </div>
            )}
          </StepContent>
        </div>

        <Actions>
          <Button variant="outline" onClick={handleBack}>
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={loading}
          >
            {currentStep === 4 ? 'Activate Promotion' : 'Next'}
          </Button>
        </Actions>
      </Content>
    </Container>
  );
}

