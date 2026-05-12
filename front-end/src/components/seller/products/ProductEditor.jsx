import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { ProductInfoSection } from './ProductEditor/ProductInfoSection';
import { MediaSection } from './ProductEditor/MediaSection';
import { PricingSection } from './ProductEditor/PricingSection';
import { InventorySection } from './ProductEditor/InventorySection';
import { CategoriesSection } from './ProductEditor/CategoriesSection';
import { AdvancedSection } from './ProductEditor/AdvancedSection';
import { toast } from '../../ui/Toast';

import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 120px;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const SaveButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  ${props => props.theme.typography.button}
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.md};
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-width: 200px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateX(-50%) translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active {
    transform: translateX(-50%) translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: translateX(-50%);
  }
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger[100]};
  border: 1px solid ${props => props.theme.colors.danger[500]};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.danger[600]};
  ${props => props.theme.typography.body2}
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const ProductEditor = ({ location }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [product, setProduct] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: 0,
    discountPrice: null,
    images: [],
    category: '',
    subcategory: '',
    tags: [],
    stockQuantity: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    isVisible: true,
    sku: '',
    barcode: '',
    weight: null,
    dimensions: null,
    preparationTime: null,
    expiryDate: null,
    batchNumber: null,
    inventoryLocation: null,
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const autoSaveEnabled = useRef(false);

  // Get seller ID
  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };

  // Load product if editing
  useEffect(() => {
    if (isEditing) {
      loadProduct();
      // Enable auto-save after initial load
      setTimeout(() => {
        autoSaveEnabled.current = true;
      }, 1000);
    }
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products/${id}`
      );

      if (!response.ok) {
        throw new Error('Failed to load product');
      }

      const json = await response.json();
      if (json.success) {
        setProduct(json.data);
      } else {
        throw new Error(json.message || 'Failed to load product');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!product.name || !product.name.trim()) {
        setError('Product name is required');
        return;
      }

      if (!product.price || product.price <= 0) {
        setError('Product price must be greater than 0');
        return;
      }

      if (!product.category) {
        setError('Product category is required');
        return;
      }

      const sellerId = getSellerId();
      const url = isEditing
        ? `${API_BASE_URL}/sellers/${sellerId}/products/${id}`
        : `${API_BASE_URL}/sellers/${sellerId}/products`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save product');
      }

      const json = await response.json();
      if (json.success) {
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        // Navigate back to product list after a short delay
        setTimeout(() => {
          navigate('/seller/products');
        }, 500);
      } else {
        throw new Error(json.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.message || 'Failed to save product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setError(null); // Clear error when user makes changes

    // Auto-save for editing mode (debounced)
    if (isEditing && autoSaveEnabled.current) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      const timer = setTimeout(() => {
        // Auto-save silently
        handleAutoSave();
      }, 2000); // 2 second delay
      setAutoSaveTimer(timer);
    }
  };

  const handleAutoSave = async () => {
    if (!isEditing || saving || !hasChanges) return;

    // Don't auto-save if there are validation errors
    if (!product.name || !product.name.trim() || !product.price || product.price <= 0 || !product.category) {
      return;
    }

    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/products/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        }
      );

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setHasChanges(false);
          // Silent auto-save - no toast notification
        }
      }
    } catch (err) {
      // Silent fail for auto-save
      console.error('Auto-save failed:', err);
    }
  };

  const handleNestedFieldChange = (field, nestedField, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [nestedField]: value,
      },
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <Container>
        <TopNavigation />
        <Content>
          <div>Loading...</div>
        </Content>
        <BottomNavigation />
      </Container>
    );
  }

  return (
    <Container>
      <TopNavigation />
      <Content>
        <Header>
          <Title>{isEditing ? 'Edit Product' : 'Add Product'}</Title>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ProductInfoSection
          product={product}
          onChange={handleFieldChange}
        />

        <MediaSection
          product={product}
          onChange={handleFieldChange}
        />

        <PricingSection
          product={product}
          onChange={handleFieldChange}
        />

        <InventorySection
          product={product}
          onChange={handleFieldChange}
        />

        <CategoriesSection
          product={product}
          onChange={handleFieldChange}
        />

        <AdvancedSection
          product={product}
          onChange={handleFieldChange}
          onNestedChange={handleNestedFieldChange}
        />
      </Content>

      {(hasChanges || !isEditing) && (
        <SaveButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
        </SaveButton>
      )}

      <BottomNavigation />
    </Container>
  );
};

