import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * Furniture Product Template for Sellers
 * Guided form for adding furniture products with required fields
 */

const FurnitureProductTemplate = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    condition: 'new',
    room: category?.room || 'living',
    furnitureCategory: category?.id || 'sofa',
    style: '',
    materialPrimary: '',
    color: '',
    dimensionsW: '',
    dimensionsD: '',
    dimensionsH: '',
    weight: '',
    assemblyRequired: false,
    assemblyFee: '',
    deliveryEligible: true,
    leadTimeDaysMin: '0',
    leadTimeDaysMax: '3',
    stockType: 'in_stock',
    stockQuantity: '',
    images: [],
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare product data
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      dimensionsSnippet: `W${formData.dimensionsW}×D${formData.dimensionsD}×H${formData.dimensionsH}cm`,
      dimensions: {
        w: parseInt(formData.dimensionsW),
        d: parseInt(formData.dimensionsD),
        h: parseInt(formData.dimensionsH),
      },
      weight: formData.weight ? parseFloat(formData.weight) : null,
      assemblyFee: formData.assemblyFee ? parseFloat(formData.assemblyFee) : null,
      leadTimeDaysMin: parseInt(formData.leadTimeDaysMin),
      leadTimeDaysMax: parseInt(formData.leadTimeDaysMax),
      stockQuantity: parseInt(formData.stockQuantity),
    };

    onSubmit(productData);
  };

  const isValid = () => {
    return (
      formData.name &&
      formData.price &&
      formData.dimensionsW &&
      formData.dimensionsD &&
      formData.dimensionsH &&
      formData.stockQuantity &&
      formData.images.length >= 4
    );
  };

  return (
    <Container>
      <Header>
        <Title>📦 Add Furniture Product</Title>
        <CloseButton onClick={onCancel}>✕</CloseButton>
      </Header>

      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionTitle>Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>Product Name *</Label>
            <Input
              type="text"
              placeholder="E.g., Modern Fabric 3-Seater Sofa"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              placeholder="Describe the furniture item, its features, and condition..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Price (R) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Condition *</Label>
              <Select
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                required
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </Select>
            </FormGroup>
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>Furniture Details</SectionTitle>
          
          <FormRow>
            <FormGroup>
              <Label>Room *</Label>
              <Select
                value={formData.room}
                onChange={(e) => handleChange('room', e.target.value)}
                required
              >
                <option value="living">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="office">Office</option>
                <option value="dining">Dining</option>
                <option value="outdoor">Outdoor</option>
                <option value="kids">Kids</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Style</Label>
              <Select
                value={formData.style}
                onChange={(e) => handleChange('style', e.target.value)}
              >
                <option value="">Select style</option>
                <option value="modern">Modern</option>
                <option value="scandi">Scandinavian</option>
                <option value="industrial">Industrial</option>
                <option value="traditional">Traditional</option>
                <option value="vintage">Vintage</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Material *</Label>
              <Select
                value={formData.materialPrimary}
                onChange={(e) => handleChange('materialPrimary', e.target.value)}
                required
              >
                <option value="">Select material</option>
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
                <option value="fabric">Fabric</option>
                <option value="leather">Leather</option>
                <option value="glass">Glass</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Color</Label>
              <Input
                type="text"
                placeholder="E.g., Gray, Brown, White"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
              />
            </FormGroup>
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>Dimensions (Required)</SectionTitle>
          <DimensionsGrid>
            <FormGroup>
              <Label>Width (cm) *</Label>
              <Input
                type="number"
                placeholder="120"
                value={formData.dimensionsW}
                onChange={(e) => handleChange('dimensionsW', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Depth (cm) *</Label>
              <Input
                type="number"
                placeholder="80"
                value={formData.dimensionsD}
                onChange={(e) => handleChange('dimensionsD', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Height (cm) *</Label>
              <Input
                type="number"
                placeholder="75"
                value={formData.dimensionsH}
                onChange={(e) => handleChange('dimensionsH', e.target.value)}
                required
              />
            </FormGroup>
          </DimensionsGrid>

          <FormGroup>
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="50"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Delivery & Assembly</SectionTitle>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={formData.assemblyRequired}
              onChange={(e) => handleChange('assemblyRequired', e.target.checked)}
            />
            <CheckboxLabel>Assembly required</CheckboxLabel>
          </CheckboxGroup>

          {formData.assemblyRequired && (
            <FormGroup>
              <Label>Assembly Fee (R)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="150.00"
                value={formData.assemblyFee}
                onChange={(e) => handleChange('assemblyFee', e.target.value)}
              />
            </FormGroup>
          )}

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={formData.deliveryEligible}
              onChange={(e) => handleChange('deliveryEligible', e.target.checked)}
            />
            <CheckboxLabel>Delivery available</CheckboxLabel>
          </CheckboxGroup>

          <FormRow>
            <FormGroup>
              <Label>Lead Time Min (days)</Label>
              <Input
                type="number"
                value={formData.leadTimeDaysMin}
                onChange={(e) => handleChange('leadTimeDaysMin', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Lead Time Max (days)</Label>
              <Input
                type="number"
                value={formData.leadTimeDaysMax}
                onChange={(e) => handleChange('leadTimeDaysMax', e.target.value)}
              />
            </FormGroup>
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>Stock</SectionTitle>
          
          <FormRow>
            <FormGroup>
              <Label>Stock Type *</Label>
              <Select
                value={formData.stockType}
                onChange={(e) => handleChange('stockType', e.target.value)}
                required
              >
                <option value="in_stock">In Stock</option>
                <option value="limited">Limited Stock</option>
                <option value="made_to_order">Made to Order</option>
                <option value="preorder">Pre-order</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Quantity *</Label>
              <Input
                type="number"
                placeholder="1"
                value={formData.stockQuantity}
                onChange={(e) => handleChange('stockQuantity', e.target.value)}
                required
              />
            </FormGroup>
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>Photos (Minimum 4 required)</SectionTitle>
          <ImageUploadBox>
            <UploadIcon>📸</UploadIcon>
            <UploadText>Upload at least 4 clear photos</UploadText>
            <UploadButton type="button">Choose Images</UploadButton>
            <UploadHint>({formData.images.length}/4 uploaded)</UploadHint>
          </ImageUploadBox>
        </Section>

        <ButtonRow>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={!isValid()}>
            Add Product
          </SubmitButton>
        </ButtonRow>
      </Form>
    </Container>
  );
};

// Styled Components (abbreviated for brevity)

const Container = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const Form = styled.form`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1a1a1a;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const DimensionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const ImageUploadBox = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const UploadText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 16px 0;
`;

const UploadButton = styled.button`
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: #999;
  margin: 8px 0 0 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  flex: 2;
  padding: 14px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export default FurnitureProductTemplate;

