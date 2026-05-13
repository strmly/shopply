import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { toast } from '../../ui/Toast';
import API_BASE_URL from '@config/api';
import { uploadImage } from '../../../utils/uploadImage';

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 130px;
  background:
    radial-gradient(circle at top left, rgba(61, 129, 239, 0.14), transparent 36%),
    linear-gradient(180deg, #f7fbff 0%, #ffffff 38%, #f7f5ff 100%);
  animation: ${fadeIn} 0.28s ease-in;
`;

const Shell = styled.main`
  width: min(1220px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(18px, 3.6vw, 38px) 0 0;
  display: grid;
  gap: 16px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1220px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 16px;
  padding: clamp(18px, 3.4vw, 30px);
  border-radius: 28px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(241, 247, 255, 0.94)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.38), rgba(196, 184, 252, 0.4), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.11);
  animation: ${rise} 0.34s ease-out both;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const Badge = styled.div`
  width: fit-content;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 12px;
  font-weight: 950;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(34px, 6vw, 62px);
  line-height: 0.95;
  letter-spacing: 0;
  font-weight: 950;
`;

const Subtitle = styled.p`
  max-width: 650px;
  margin: 14px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 16px 34px rgba(61, 129, 239, 0.24)' : '0 10px 24px rgba(16, 24, 40, 0.06)'};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
  }
`;

const PreviewCard = styled.aside`
  min-width: 0;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  overflow: hidden;
`;

const PreviewImage = styled.div`
  aspect-ratio: 4 / 3;
  background:
    ${props => props.$image ? `url(${props.$image}) center/cover` : props.theme.colors.gradient.soft};
  display: grid;
  place-items: center;
  color: ${props => props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
`;

const PreviewBody = styled.div`
  padding: 16px;
`;

const PreviewName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 950;
  line-height: 1.2;
`;

const PreviewMeta = styled.div`
  margin-top: 6px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
`;

const PreviewPrice = styled.div`
  margin-top: 14px;
  color: ${props => props.theme.colors.primary};
  font-size: 28px;
  font-weight: 950;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`;

const Panel = styled.section`
  padding: 18px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${rise} 0.34s ease-out both;
  animation-delay: ${props => props.$delay || 0}s;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  line-height: 1.2;
  font-weight: 950;
`;

const PanelCopy = styled.p`
  margin: 4px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  font-weight: 750;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols || 2}, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  min-width: 0;
`;

const Label = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 900;
`;

const Hint = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  line-height: 1.35;
  font-weight: 750;
`;

const Required = styled.span`
  color: ${props => props.theme.colors.primary};
`;

const inputStyles = props => `
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid ${props.theme.colors.border.default};
  border-radius: 16px;
  background: #ffffff;
  color: ${props.theme.colors.text.primary};
  font: inherit;
  font-size: 14px;
  font-weight: 750;
  outline: none;
  transition: ${props.theme.transitions.swift};

  &:focus {
    border-color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props.theme.colors.primarySoftBg};
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

const Select = styled.select`
  ${inputStyles}
`;

const TextArea = styled.textarea`
  ${inputStyles}
  min-height: 130px;
  padding-top: 13px;
  resize: vertical;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 12px;
`;

const ImageTile = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid rgba(61, 129, 239, 0.14);
`;

const TileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TileAction = styled.button`
  position: absolute;
  right: 8px;
  top: 8px;
  min-width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: rgba(13, 28, 51, 0.76);
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 950;
`;

const PrimaryPill = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 11px;
  font-weight: 950;
`;

const UploadTile = styled.label`
  aspect-ratio: 1;
  border-radius: 20px;
  border: 1px dashed rgba(61, 129, 239, 0.45);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 14px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 13px;
  font-weight: 950;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ToggleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Toggle = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(61, 129, 239, 0.18)'};
  background: ${props => props.$active ? props.theme.colors.gradient.primary : props.theme.colors.primarySoftBg};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.primarySoftText};
  cursor: pointer;
  font-size: 13px;
  font-weight: 950;
`;

const TagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.button`
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(61, 129, 239, 0.18)'};
  background: ${props => props.$active ? props.theme.colors.gradient.primary : props.theme.colors.primarySoftBg};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.primarySoftText};
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
`;

const ErrorBox = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: ${props => props.theme.colors.warningSoftBg};
  border: 1px solid rgba(245, 158, 11, 0.28);
  color: ${props => props.theme.colors.warningBase};
  font-size: 13px;
  font-weight: 850;
`;

const StickyBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 78px;
  z-index: 120;
  width: min(680px, calc(100% - 28px));
  transform: translateX(-50%);
  padding: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 20px 44px rgba(16, 24, 40, 0.14);
  backdrop-filter: blur(16px);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const DirtyText = styled.div`
  padding-left: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 850;
`;

const ROOMS = ['Living', 'Bedroom', 'Dining', 'Office', 'Outdoor', 'Kids', 'Storage'];
const FURNITURE_TYPES = ['Sofa', 'Table', 'Bed', 'Chair', 'Desk', 'Bookcase', 'Storage', 'Lighting', 'Decor'];
const STYLES = ['Modern', 'Scandi', 'Mid-century', 'Industrial', 'Traditional', 'Minimal'];
const MATERIALS = ['Wood', 'Fabric', 'Leather', 'Metal', 'Glass', 'Rattan', 'Stone'];
const SUGGESTED_TAGS = ['local', 'new', 'solid wood', 'delivery ready', 'small space', 'premium', 'assembled'];

const emptyProduct = {
  name: '',
  subtitle: '',
  description: '',
  price: '',
  discountPrice: '',
  images: [],
  category: 'Home & Furniture',
  room: 'Living',
  furnitureCategory: 'Sofa',
  style: 'Modern',
  condition: 'new',
  materialPrimary: 'Wood',
  colorPrimary: '',
  tags: [],
  stockQuantity: 1,
  lowStockThreshold: 2,
  trackInventory: true,
  isVisible: true,
  deliveryEligible: true,
  assemblyRequired: false,
  assemblyFee: '',
  leadTimeDaysMin: 0,
  leadTimeDaysMax: 3,
  dimensions: { length: '', width: '', height: '' },
  weight: '',
  sku: '',
  barcode: '',
  careNotes: '',
};

const money = value => `R${Number(value || 0).toLocaleString('en-ZA', {
  maximumFractionDigits: 0,
})}`;


const normalizeProduct = (product) => ({
  ...emptyProduct,
  ...product,
  price: product.price ?? '',
  discountPrice: product.discountPrice ?? '',
  images: product.images || (product.image ? [product.image] : []),
  dimensions: product.dimensions || emptyProduct.dimensions,
});

export const ProductEditor = ({ location }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [product, setProduct] = useState(emptyProduct);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(!isEditing);

  const sellerId = localStorage.getItem('sellerOnboardingId') || localStorage.getItem('sellerId') || '1';

  useEffect(() => {
    if (!isEditing) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products/${id}`);
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || 'Failed to load product');
        }

        setProduct(normalizeProduct(json.data));
        setHasChanges(false);
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isEditing, sellerId]);

  const livePrice = useMemo(() => {
    const price = Number(product.price) || 0;
    const sale = product.discountPrice !== '' && product.discountPrice !== null ? Number(product.discountPrice) : null;
    return sale && sale > 0 ? sale : price;
  }, [product.discountPrice, product.price]);

  const change = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setError(null);
  };

  const changeDimension = (field, value) => {
    setProduct(prev => ({
      ...prev,
      dimensions: { ...(prev.dimensions || {}), [field]: value },
    }));
    setHasChanges(true);
  };

  const addImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const valid = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 12MB.`);
        return false;
      }
      return true;
    });

    const remainingSlots = Math.max(0, 8 - (product.images || []).length);
    const filesToAdd = valid.slice(0, remainingSlots);

    if (valid.length > filesToAdd.length) {
      toast.error('You can add up to 8 photos per product.');
    }

    if (filesToAdd.length === 0) {
      event.target.value = '';
      return;
    }

    try {
      const urls = await Promise.all(filesToAdd.map(file => uploadImage(file, 'product')));
      change('images', [...(product.images || []), ...urls].slice(0, 8));
      toast.success(`${urls.length} photo${urls.length === 1 ? '' : 's'} uploaded`);
    } catch {
      toast.error('One or more photos could not be uploaded. Try again.');
    }

    event.target.value = '';
  };

  const removeImage = (index) => {
    change('images', (product.images || []).filter((_, itemIndex) => itemIndex !== index));
  };

  const setPrimaryImage = (index) => {
    if (index === 0) return;
    const images = [...(product.images || [])];
    const [image] = images.splice(index, 1);
    change('images', [image, ...images]);
  };

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase();
    if (!clean || product.tags.includes(clean)) return;
    change('tags', [...product.tags, clean]);
    setTagInput('');
  };

  const removeTag = (tag) => {
    change('tags', product.tags.filter(item => item !== tag));
  };

  const validate = () => {
    if (!product.name.trim()) return 'Product name is required';
    if (!Number(product.price) || Number(product.price) <= 0) return 'Product price must be greater than 0';
    if (!product.category) return 'Product category is required';
    if (product.discountPrice !== '' && Number(product.discountPrice) >= Number(product.price)) {
      return 'Sale price must be lower than the base price';
    }
    if (product.trackInventory && Number(product.stockQuantity) < 0) return 'Stock quantity cannot be negative';
    return null;
  };

  const buildPayload = () => {
    const images = product.images || [];
    const basePrice = Number(product.price) || 0;
    const salePrice = product.discountPrice === '' || product.discountPrice === null ? null : Number(product.discountPrice);

    return {
      ...product,
      category: product.category || 'Home & Furniture',
      price: basePrice,
      originalPrice: salePrice ? basePrice : null,
      discountPrice: salePrice,
      image: images[0] || null,
      coverImage: images[0] || null,
      stockQuantity: product.trackInventory ? Number(product.stockQuantity) || 0 : null,
      lowStockThreshold: Number(product.lowStockThreshold) || 0,
      weight: product.weight === '' ? null : Number(product.weight),
      assemblyFee: product.assemblyFee === '' ? null : Number(product.assemblyFee),
      leadTimeDaysMin: Number(product.leadTimeDaysMin) || 0,
      leadTimeDaysMax: Number(product.leadTimeDaysMax) || 0,
      dimensions: {
        length: product.dimensions?.length || '',
        width: product.dimensions?.width || '',
        height: product.dimensions?.height || '',
      },
      dimensionsSnippet: product.dimensions?.length || product.dimensions?.width || product.dimensions?.height
        ? `L${product.dimensions?.length || '-'} x W${product.dimensions?.width || '-'} x H${product.dimensions?.height || '-'} cm`
        : null,
    };
  };

  const saveProduct = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/sellers/${sellerId}/products/${id}`
          : `${API_BASE_URL}/sellers/${sellerId}/products`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        }
      );
      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to save product');
      }

      toast.success(isEditing ? 'Product updated' : 'Product created');
      setHasChanges(false);
      navigate('/seller/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <TopNavigation location={location} />
        <Shell>
          <Panel>
            <PanelTitle>Loading product...</PanelTitle>
          </Panel>
        </Shell>
        <BottomNavigation currentPath="/seller/products" />
      </Page>
    );
  }

  return (
    <Page>
      <TopNavigation location={location} />
      <Shell>
        <Hero>
          <div>
            <Badge>{isEditing ? 'Edit listing' : 'New seller listing'}</Badge>
            <Title>{isEditing ? 'Edit Product' : 'Add Product'}</Title>
            <Subtitle>
              Create a rich furniture listing with photos, pricing, stock, delivery details, and searchable room styling.
            </Subtitle>
            <HeroActions>
              <Button type="button" onClick={() => navigate('/seller/products')}>Back to products</Button>
              <Button $primary type="button" onClick={saveProduct} disabled={saving}>
                {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create product'}
              </Button>
            </HeroActions>
          </div>
          <PreviewCard>
            <PreviewImage $image={product.images?.[0]}>
              {!product.images?.[0] && 'Product preview'}
            </PreviewImage>
            <PreviewBody>
              <PreviewName>{product.name || 'Beautiful furniture piece'}</PreviewName>
              <PreviewMeta>{product.room} room · {product.style} · {product.condition}</PreviewMeta>
              <PreviewPrice>{money(livePrice)}</PreviewPrice>
            </PreviewBody>
          </PreviewCard>
        </Hero>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Layout>
          <Stack>
            <Panel $delay={0.03}>
              <PanelHeader>
                <div>
                  <PanelTitle>Product Story</PanelTitle>
                  <PanelCopy>Name it clearly and describe what makes the piece worth saving.</PanelCopy>
                </div>
              </PanelHeader>
              <Grid>
                <Field>
                  <Label>Name <Required>*</Required></Label>
                  <Input value={product.name} onChange={(e) => change('name', e.target.value)} placeholder="Mid-Century Storage Coffee Table" />
                </Field>
                <Field>
                  <Label>Subtitle</Label>
                  <Input value={product.subtitle || ''} onChange={(e) => change('subtitle', e.target.value)} placeholder="Walnut finish, local delivery ready" />
                </Field>
              </Grid>
              <Field style={{ marginTop: 12 }}>
                <Label>Description</Label>
                <TextArea value={product.description || ''} onChange={(e) => change('description', e.target.value)} placeholder="Describe materials, condition, size, room fit, and delivery notes." />
                <Hint>Detailed descriptions improve buyer confidence.</Hint>
              </Field>
            </Panel>

            <Panel $delay={0.06}>
              <PanelHeader>
                <div>
                  <PanelTitle>Photos</PanelTitle>
                  <PanelCopy>Add up to 8 images. The first image becomes the product cover.</PanelCopy>
                </div>
              </PanelHeader>
              <ImageGrid>
                {(product.images || []).map((image, index) => (
                  <ImageTile key={`${image}-${index}`}>
                    <TileImage src={image} alt={`Product ${index + 1}`} />
                    <TileAction type="button" onClick={() => removeImage(index)}>x</TileAction>
                    <PrimaryPill onClick={() => setPrimaryImage(index)}>
                      {index === 0 ? 'Cover' : 'Set cover'}
                    </PrimaryPill>
                  </ImageTile>
                ))}
                {(product.images || []).length < 8 && (
                  <UploadTile>
                    <HiddenInput type="file" accept="image/*" multiple onChange={addImages} />
                    Add photos
                  </UploadTile>
                )}
              </ImageGrid>
            </Panel>

            <Panel $delay={0.09}>
              <PanelHeader>
                <div>
                  <PanelTitle>Pricing</PanelTitle>
                  <PanelCopy>Keep pricing simple, then use sale price when you want a visible markdown.</PanelCopy>
                </div>
              </PanelHeader>
              <Grid>
                <Field>
                  <Label>Base price <Required>*</Required></Label>
                  <Input type="number" min="0" step="0.01" value={product.price} onChange={(e) => change('price', e.target.value)} placeholder="1499" />
                </Field>
                <Field>
                  <Label>Sale price</Label>
                  <Input type="number" min="0" step="0.01" value={product.discountPrice ?? ''} onChange={(e) => change('discountPrice', e.target.value)} placeholder="Optional" />
                </Field>
              </Grid>
            </Panel>

            <Panel $delay={0.12}>
              <PanelHeader>
                <div>
                  <PanelTitle>Room & Style</PanelTitle>
                  <PanelCopy>These fields power search, room pages, and recommendations.</PanelCopy>
                </div>
              </PanelHeader>
              <Grid>
                <Field>
                  <Label>Room</Label>
                  <Select value={product.room || ''} onChange={(e) => change('room', e.target.value)}>
                    {ROOMS.map(room => <option key={room} value={room}>{room}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Furniture type</Label>
                  <Select value={product.furnitureCategory || ''} onChange={(e) => change('furnitureCategory', e.target.value)}>
                    {FURNITURE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Style</Label>
                  <Select value={product.style || ''} onChange={(e) => change('style', e.target.value)}>
                    {STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Condition</Label>
                  <Select value={product.condition || 'new'} onChange={(e) => change('condition', e.target.value)}>
                    <option value="new">New</option>
                    <option value="like-new">Like new</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </Select>
                </Field>
                <Field>
                  <Label>Material</Label>
                  <Select value={product.materialPrimary || ''} onChange={(e) => change('materialPrimary', e.target.value)}>
                    {MATERIALS.map(material => <option key={material} value={material}>{material}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Primary color</Label>
                  <Input value={product.colorPrimary || ''} onChange={(e) => change('colorPrimary', e.target.value)} placeholder="Walnut, cream, charcoal" />
                </Field>
              </Grid>
            </Panel>
          </Stack>

          <Stack>
            <Panel $delay={0.05}>
              <PanelHeader>
                <div>
                  <PanelTitle>Inventory</PanelTitle>
                  <PanelCopy>Control availability and low-stock alerts.</PanelCopy>
                </div>
              </PanelHeader>
              <ToggleRow>
                <Toggle type="button" $active={product.trackInventory} onClick={() => change('trackInventory', !product.trackInventory)}>
                  Track stock
                </Toggle>
                <Toggle type="button" $active={product.isVisible} onClick={() => change('isVisible', !product.isVisible)}>
                  {product.isVisible ? 'Visible' : 'Hidden'}
                </Toggle>
              </ToggleRow>
              <Grid style={{ marginTop: 12 }}>
                <Field>
                  <Label>Stock quantity</Label>
                  <Input type="number" min="0" value={product.stockQuantity ?? 0} onChange={(e) => change('stockQuantity', e.target.value)} disabled={!product.trackInventory} />
                </Field>
                <Field>
                  <Label>Low-stock alert</Label>
                  <Input type="number" min="0" value={product.lowStockThreshold ?? 0} onChange={(e) => change('lowStockThreshold', e.target.value)} disabled={!product.trackInventory} />
                </Field>
              </Grid>
            </Panel>

            <Panel $delay={0.08}>
              <PanelHeader>
                <div>
                  <PanelTitle>Delivery & Assembly</PanelTitle>
                  <PanelCopy>Set buyer expectations before checkout.</PanelCopy>
                </div>
              </PanelHeader>
              <ToggleRow>
                <Toggle type="button" $active={product.deliveryEligible} onClick={() => change('deliveryEligible', !product.deliveryEligible)}>
                  Delivery eligible
                </Toggle>
                <Toggle type="button" $active={product.assemblyRequired} onClick={() => change('assemblyRequired', !product.assemblyRequired)}>
                  Assembly needed
                </Toggle>
              </ToggleRow>
              <Grid style={{ marginTop: 12 }}>
                <Field>
                  <Label>Lead time min days</Label>
                  <Input type="number" min="0" value={product.leadTimeDaysMin ?? 0} onChange={(e) => change('leadTimeDaysMin', e.target.value)} />
                </Field>
                <Field>
                  <Label>Lead time max days</Label>
                  <Input type="number" min="0" value={product.leadTimeDaysMax ?? 0} onChange={(e) => change('leadTimeDaysMax', e.target.value)} />
                </Field>
                <Field>
                  <Label>Assembly fee</Label>
                  <Input type="number" min="0" value={product.assemblyFee ?? ''} onChange={(e) => change('assemblyFee', e.target.value)} placeholder="Optional" />
                </Field>
                <Field>
                  <Label>Weight kg</Label>
                  <Input type="number" min="0" step="0.1" value={product.weight ?? ''} onChange={(e) => change('weight', e.target.value)} placeholder="Optional" />
                </Field>
              </Grid>
            </Panel>

            <Panel $delay={0.11}>
              <PanelHeader>
                <div>
                  <PanelTitle>Dimensions</PanelTitle>
                  <PanelCopy>Useful for furniture buyers checking fit.</PanelCopy>
                </div>
              </PanelHeader>
              <Grid $cols={3}>
                <Field>
                  <Label>Length cm</Label>
                  <Input type="number" min="0" value={product.dimensions?.length || ''} onChange={(e) => changeDimension('length', e.target.value)} />
                </Field>
                <Field>
                  <Label>Width cm</Label>
                  <Input type="number" min="0" value={product.dimensions?.width || ''} onChange={(e) => changeDimension('width', e.target.value)} />
                </Field>
                <Field>
                  <Label>Height cm</Label>
                  <Input type="number" min="0" value={product.dimensions?.height || ''} onChange={(e) => changeDimension('height', e.target.value)} />
                </Field>
              </Grid>
            </Panel>

            <Panel $delay={0.14}>
              <PanelHeader>
                <div>
                  <PanelTitle>Tags & Details</PanelTitle>
                  <PanelCopy>Tags make your listing easier to discover.</PanelCopy>
                </div>
              </PanelHeader>
              <Field>
                <Label>SKU</Label>
                <Input value={product.sku || ''} onChange={(e) => change('sku', e.target.value)} placeholder="Auto-generated if left empty" />
              </Field>
              <Field style={{ marginTop: 12 }}>
                <Label>Care notes</Label>
                <TextArea value={product.careNotes || ''} onChange={(e) => change('careNotes', e.target.value)} placeholder="Wipe clean, avoid direct sunlight, oil wood every few months." />
              </Field>
              <Field style={{ marginTop: 12 }}>
                <Label>Add tag</Label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Type and press Enter"
                />
              </Field>
              <TagWrap style={{ marginTop: 12 }}>
                {SUGGESTED_TAGS.map(tag => (
                  <Tag key={tag} type="button" $active={product.tags.includes(tag)} onClick={() => product.tags.includes(tag) ? removeTag(tag) : addTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </TagWrap>
              {product.tags.length > 0 && (
                <TagWrap style={{ marginTop: 12 }}>
                  {product.tags.map(tag => (
                    <Tag key={tag} type="button" $active onClick={() => removeTag(tag)}>
                      {tag} x
                    </Tag>
                  ))}
                </TagWrap>
              )}
            </Panel>
          </Stack>
        </Layout>
      </Shell>

      {hasChanges && (
        <StickyBar>
          <DirtyText>{isEditing ? 'Unsaved product changes' : 'Ready to create this listing'}</DirtyText>
          <Button $primary type="button" onClick={saveProduct} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create product'}
          </Button>
        </StickyBar>
      )}

      <BottomNavigation currentPath="/seller/products" />
    </Page>
  );
};
