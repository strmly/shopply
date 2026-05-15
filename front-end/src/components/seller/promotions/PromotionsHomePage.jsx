import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { SkeletonCard, SkeletonText } from '../../ui/Skeleton';
import { toast } from '../../ui/Toast';
import API_BASE_URL from '@config/api';

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: clamp(18px, 3.4vw, 30px);
  border-radius: 28px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(241, 247, 255, 0.94)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.38), rgba(196, 184, 252, 0.4), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.11);
  animation: ${rise} 0.34s ease-out both;

  @media (max-width: 820px) {
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
  max-width: 680px;
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
  justify-content: flex-end;
  align-content: start;

  @media (max-width: 820px) {
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.$danger ? props.theme.colors.warningBase : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 16px 34px rgba(61, 129, 239, 0.24)' : '0 10px 24px rgba(16, 24, 40, 0.06)'};
  transition: ${props => props.theme.transitions.swift};

  &:hover { transform: translateY(-1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatCard = styled.div`
  min-height: 104px;
  padding: 15px;
  border-radius: 22px;
  border: 1px solid rgba(228, 231, 236, 0.92);
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 26px;
  font-weight: 950;
  line-height: 1;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.25;
  font-weight: 850;
`;

const Workspace = styled.section`
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  padding: 18px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${rise} 0.34s ease-out both;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 950;
`;

const PanelCopy = styled.p`
  margin: 4px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  font-weight: 750;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const TypeButton = styled.button`
  min-height: 92px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.42)' : 'rgba(228, 231, 236, 0.92)'};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover { transform: translateY(-1px); border-color: rgba(61, 129, 239, 0.34); }
`;

const TypeTitle = styled.div`
  font-size: 14px;
  font-weight: 950;
`;

const TypeCopy = styled.div`
  margin-top: 5px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  line-height: 1.35;
  font-weight: 750;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const Label = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 900;
`;

const inputStyles = props => `
  width: 100%;
  min-height: 44px;
  padding: 0 13px;
  border: 1px solid ${props.theme.colors.border.default};
  border-radius: 16px;
  background: #ffffff;
  color: ${props.theme.colors.text.primary};
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  outline: none;
  transition: ${props.theme.transitions.swift};

  &:focus {
    border-color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props.theme.colors.primarySoftBg};
  }
`;

const Input = styled.input`${inputStyles}`;
const Select = styled.select`${inputStyles}`;
const TextArea = styled.textarea`
  ${inputStyles}
  min-height: 84px;
  padding-top: 12px;
`;

const ProductPicker = styled.div`
  max-height: 270px;
  overflow: auto;
  display: grid;
  gap: 8px;
  padding-right: 4px;
`;

const ProductOption = styled.button`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid ${props => props.$selected ? 'rgba(61, 129, 239, 0.42)' : 'rgba(228, 231, 236, 0.92)'};
  background: ${props => props.$selected ? props.theme.colors.primarySoftBg : '#ffffff'};
  cursor: pointer;
  text-align: left;
`;

const ProductThumb = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: ${props => props.$image ? `url(${props.$image}) center/cover` : props.theme.colors.gradient.soft};
  display: grid;
  place-items: center;
  color: ${props => props.theme.colors.primary};
  font-size: 10px;
  font-weight: 950;
`;

const ProductName = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductPrice = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 800;
`;

const Check = styled.div`
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: ${props => props.$selected ? props.theme.colors.gradient.primary : props.theme.colors.gradient.soft};
  color: ${props => props.$selected ? '#ffffff' : props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 950;
`;

const List = styled.div`
  display: grid;
  gap: 10px;
`;

const PromoCard = styled.article`
  padding: 14px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 14px 30px rgba(16, 24, 40, 0.06);
  display: grid;
  gap: 10px;
`;

const PromoTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const PromoTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 950;
`;

const PromoMeta = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.4;
  font-weight: 750;
`;

const Status = styled.span`
  height: 28px;
  padding: 0 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${props => props.$status === 'active' ? props.theme.colors.primarySoftBg : props.theme.colors.gradient.soft};
  color: ${props => props.$status === 'active' ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 950;
  white-space: nowrap;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

const EmptyState = styled.div`
  padding: 28px;
  border-radius: 22px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  font-size: 14px;
  font-weight: 800;
`;

const PROMO_TYPES = [
  { id: 'percentage', title: 'Percent Discount', copy: 'Percentage off selected products.' },
  { id: 'amount', title: 'Amount Off', copy: 'Fixed rand discount on products.' },
  { id: 'flash', title: 'Flash Deal', copy: 'Time-boxed deal with stock cap.' },
  { id: 'bundle', title: 'Bundle Price', copy: 'Package 2+ products together.' },
  { id: 'buy_x_get_y', title: 'Buy X Get Y', copy: 'Reward multi-item baskets.' },
  { id: 'free_delivery', title: 'Free Delivery', copy: 'Free delivery above threshold.' },
];

const nowLocal = () => {
  const date = new Date(Date.now() + 15 * 60 * 1000);
  date.setSeconds(0, 0);
  return date.toISOString().slice(0, 16);
};

const tomorrowLocal = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setSeconds(0, 0);
  return date.toISOString().slice(0, 16);
};

const formatMoney = (value) => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
const imageOf = product => product.image || product.coverImage || product.images?.[0] || null;
const labelType = type => PROMO_TYPES.find(item => item.id === type)?.title || type;

export function PromotionsHomePage({ location }) {
  const navigate = useNavigate();
  const storeId = localStorage.getItem('sellerStoreId') || localStorage.getItem('sellerOnboardingId') || '1';
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    type: 'percentage',
    title: '',
    description: '',
    productIds: [],
    discountValue: 15,
    discountType: 'percentage',
    bundlePrice: '',
    bundleName: '',
    maxInventory: 5,
    buyX: 2,
    getY: 1,
    getYDiscount: 100,
    freeDeliveryThreshold: 1500,
    startDate: nowLocal(),
    endDate: tomorrowLocal(),
    isActive: true,
    boostInSearch: true,
    showOnHomePage: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [promoRes, statsRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sellers/${storeId}/promotions?activeOnly=false&limit=50&sortBy=newest`),
        fetch(`${API_BASE_URL}/sellers/${storeId}/promotions/stats`),
        fetch(`${API_BASE_URL}/sellers/${storeId}/products?limit=100&sortBy=newest`),
      ]);
      const [promoJson, statsJson, productsJson] = await Promise.all([
        promoRes.json(),
        statsRes.json(),
        productsRes.json(),
      ]);
      if (!promoRes.ok || !promoJson.success) throw new Error(promoJson.message || 'Failed to load promotions');
      setPromotions(promoJson.data || []);
      if (statsRes.ok && statsJson.success) setStats(statsJson.data);
      if (productsRes.ok && productsJson.success) setProducts(productsJson.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedProducts = useMemo(() => products.filter(product => form.productIds.includes(product.id)), [form.productIds, products]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const selectType = (type) => {
    setForm(prev => ({
      ...prev,
      type,
      discountType: type === 'amount' ? 'amount' : 'percentage',
      title: prev.title || labelType(type),
      productIds: type === 'free_delivery' ? [] : prev.productIds,
    }));
  };

  const toggleProduct = (productId) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const validate = () => {
    if (!form.title.trim()) return 'Promotion title is required';
    if (form.type !== 'free_delivery' && form.productIds.length === 0) return 'Select at least one product';
    if (['percentage', 'amount', 'flash'].includes(form.type) && Number(form.discountValue) <= 0) return 'Discount value must be greater than zero';
    if (form.type === 'percentage' && Number(form.discountValue) > 100) return 'Percentage discount cannot exceed 100%';
    if (form.type === 'bundle' && form.productIds.length < 2) return 'Bundles need at least two products';
    if (form.type === 'bundle' && Number(form.bundlePrice) <= 0) return 'Bundle price must be greater than zero';
    if (form.type === 'flash' && Number(form.maxInventory) <= 0) return 'Flash deals need inventory';
    if (form.type === 'free_delivery' && Number(form.freeDeliveryThreshold) <= 0) return 'Free delivery threshold is required';
    return null;
  };

  const buildPayload = () => ({
    ...form,
    productIds: form.productIds.map(Number),
    sellerId: Number(storeId),
    discountValue: Number(form.discountValue) || 0,
    minPurchase: 0,
    bundlePrice: form.type === 'bundle' ? Number(form.bundlePrice) : null,
    bundleName: form.type === 'bundle' ? (form.bundleName || form.title) : null,
    maxInventory: form.type === 'flash' ? Number(form.maxInventory) : null,
    buyX: form.type === 'buy_x_get_y' ? Number(form.buyX) : null,
    getY: form.type === 'buy_x_get_y' ? Number(form.getY) : null,
    getYDiscount: form.type === 'buy_x_get_y' ? Number(form.getYDiscount) : null,
    freeDeliveryThreshold: form.type === 'free_delivery' ? Number(form.freeDeliveryThreshold) : null,
    startDate: new Date(form.startDate).toISOString(),
    endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
  });

  const createPromotion = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) throw new Error(json.message || 'Failed to create promotion');
      toast.success('Promotion created');
      setForm(prev => ({ ...prev, title: '', description: '', productIds: [] }));
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create promotion');
      toast.error(err.message || 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  const promotionAction = async (promotion, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/promotions/${promotion.id}/${action}`, { method: 'POST' });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) throw new Error(json.message || `Failed to ${action} promotion`);
      toast.success(`Promotion ${action === 'end' ? 'ended' : action + 'd'}`);
      loadData();
    } catch (err) {
      toast.error(err.message || `Failed to ${action} promotion`);
    }
  };

  const deletePromotion = async (promotion) => {
    if (!window.confirm(`Delete "${promotion.title}"?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${storeId}/promotions/${promotion.id}`, { method: 'DELETE' });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.success === false) throw new Error(json.message || 'Failed to delete promotion');
      toast.success('Promotion deleted');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete promotion');
    }
  };

  const statItems = [
    { label: 'Total campaigns', value: stats?.total ?? promotions.length },
    { label: 'Active now', value: stats?.active ?? promotions.filter(p => p.status === 'active').length },
    { label: 'Scheduled', value: stats?.scheduled ?? promotions.filter(p => p.status === 'scheduled').length },
    { label: 'Promo revenue', value: formatMoney(stats?.totalRevenue || 0) },
  ];

  return (
    <Page>
      <TopNavigation location={location} />
      <Shell>
        <Hero>
          <div>
            <Badge>Seller marketing</Badge>
            <Title>Promotions</Title>
            <Subtitle>
              Launch discounts, flash deals, bundles, basket rewards, and free delivery campaigns from one beautiful Shopply workspace.
            </Subtitle>
          </div>
          <HeroActions>
            <Button type="button" onClick={() => navigate('/seller/dashboard')}>Dashboard</Button>
            <Button type="button" onClick={() => navigate('/seller/promotions/calendar')}>Calendar</Button>
            <Button $primary type="button" onClick={createPromotion} disabled={saving}>{saving ? 'Creating...' : 'Create campaign'}</Button>
          </HeroActions>
        </Hero>

        <StatsGrid>
          {statItems.map(item => (
            <StatCard key={item.label}>
              <StatValue>{item.value}</StatValue>
              <StatLabel>{item.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Workspace>
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Create Promotion</PanelTitle>
                <PanelCopy>Choose a campaign type, select products, and publish instantly.</PanelCopy>
              </div>
            </PanelHeader>

            <TypeGrid>
              {PROMO_TYPES.map(type => (
                <TypeButton key={type.id} type="button" $active={form.type === type.id} onClick={() => selectType(type.id)}>
                  <TypeTitle>{type.title}</TypeTitle>
                  <TypeCopy>{type.copy}</TypeCopy>
                </TypeButton>
              ))}
            </TypeGrid>

            <FormGrid style={{ marginTop: 16 }}>
              <Field>
                <Label>Campaign title</Label>
                <Input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Winter lounge refresh" />
              </Field>
              <Field>
                <Label>Discount type</Label>
                <Select value={form.discountType} onChange={(event) => update('discountType', event.target.value)} disabled={!['percentage', 'amount', 'flash'].includes(form.type)}>
                  <option value="percentage">Percentage</option>
                  <option value="amount">Amount</option>
                  <option value="new_price">New price</option>
                </Select>
              </Field>
              {['percentage', 'amount', 'flash'].includes(form.type) && (
                <Field>
                  <Label>Discount value</Label>
                  <Input type="number" min="0" value={form.discountValue} onChange={(event) => update('discountValue', event.target.value)} />
                </Field>
              )}
              {form.type === 'bundle' && (
                <>
                  <Field>
                    <Label>Bundle name</Label>
                    <Input value={form.bundleName} onChange={(event) => update('bundleName', event.target.value)} placeholder="Living room starter set" />
                  </Field>
                  <Field>
                    <Label>Bundle price</Label>
                    <Input type="number" min="0" value={form.bundlePrice} onChange={(event) => update('bundlePrice', event.target.value)} />
                  </Field>
                </>
              )}
              {form.type === 'flash' && (
                <Field>
                  <Label>Flash inventory</Label>
                  <Input type="number" min="1" value={form.maxInventory} onChange={(event) => update('maxInventory', event.target.value)} />
                </Field>
              )}
              {form.type === 'buy_x_get_y' && (
                <>
                  <Field><Label>Buy quantity</Label><Input type="number" min="1" value={form.buyX} onChange={(event) => update('buyX', event.target.value)} /></Field>
                  <Field><Label>Get quantity</Label><Input type="number" min="1" value={form.getY} onChange={(event) => update('getY', event.target.value)} /></Field>
                  <Field><Label>Discount on reward</Label><Input type="number" min="0" max="100" value={form.getYDiscount} onChange={(event) => update('getYDiscount', event.target.value)} /></Field>
                </>
              )}
              {form.type === 'free_delivery' && (
                <Field>
                  <Label>Order threshold</Label>
                  <Input type="number" min="1" value={form.freeDeliveryThreshold} onChange={(event) => update('freeDeliveryThreshold', event.target.value)} />
                </Field>
              )}
              <Field>
                <Label>Starts</Label>
                <Input type="datetime-local" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} />
              </Field>
              <Field>
                <Label>Ends</Label>
                <Input type="datetime-local" value={form.endDate} onChange={(event) => update('endDate', event.target.value)} />
              </Field>
            </FormGrid>

            <Field style={{ marginTop: 10 }}>
              <Label>Description</Label>
              <TextArea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Short campaign note for your own team." />
            </Field>

            {form.type !== 'free_delivery' && (
              <div style={{ marginTop: 16 }}>
                <PanelTitle style={{ fontSize: 16 }}>Products</PanelTitle>
                <PanelCopy>{selectedProducts.length} selected</PanelCopy>
                <ProductPicker style={{ marginTop: 10 }}>
                  {products.map(product => {
                    const selected = form.productIds.includes(product.id);
                    return (
                      <ProductOption key={product.id} type="button" $selected={selected} onClick={() => toggleProduct(product.id)}>
                        <ProductThumb $image={imageOf(product)}>{!imageOf(product) && 'PR'}</ProductThumb>
                        <div>
                          <ProductName>{product.name}</ProductName>
                          <ProductPrice>{formatMoney(product.discountPrice ?? product.price)}</ProductPrice>
                        </div>
                        <Check $selected={selected}>{selected ? '✓' : '+'}</Check>
                      </ProductOption>
                    );
                  })}
                </ProductPicker>
              </div>
            )}

            <ActionRow style={{ marginTop: 16 }}>
              <Button $primary type="button" onClick={createPromotion} disabled={saving}>{saving ? 'Creating...' : 'Create promotion'}</Button>
              <Button type="button" onClick={() => loadData()}>Refresh data</Button>
            </ActionRow>
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Campaigns</PanelTitle>
                <PanelCopy>Pause, resume, duplicate, end, or delete server-backed promotions.</PanelCopy>
              </div>
            </PanelHeader>

            {loading ? (
              <List>
                {[1, 2, 3].map(item => (
                  <SkeletonCard key={item} style={{ minHeight: 104, borderRadius: 20 }}>
                    <SkeletonText $size="large" />
                    <SkeletonText />
                  </SkeletonCard>
                ))}
              </List>
            ) : promotions.length === 0 ? (
              <EmptyState>No promotions yet. Create your first campaign on the left.</EmptyState>
            ) : (
              <List>
                {promotions.map(promo => (
                  <PromoCard key={promo.id}>
                    <PromoTop>
                      <div>
                        <PromoTitle>{promo.title}</PromoTitle>
                        <PromoMeta>
                          {labelType(promo.type)} · {promo.productIds?.length || 0} products ·
                          {' '}ends {promo.endDate ? new Date(promo.endDate).toLocaleDateString('en-ZA') : 'never'}
                        </PromoMeta>
                      </div>
                      <Status $status={promo.status}>{promo.status}</Status>
                    </PromoTop>
                    <ActionRow>
                      {promo.status === 'active' && <Button type="button" onClick={() => promotionAction(promo, 'pause')}>Pause</Button>}
                      {promo.status === 'paused' && <Button type="button" onClick={() => promotionAction(promo, 'resume')}>Resume</Button>}
                      {promo.status !== 'inactive' && <Button type="button" onClick={() => promotionAction(promo, 'end')}>End</Button>}
                      <Button type="button" onClick={() => promotionAction(promo, 'duplicate')}>Duplicate</Button>
                      <Button $danger type="button" onClick={() => deletePromotion(promo)}>Delete</Button>
                    </ActionRow>
                  </PromoCard>
                ))}
              </List>
            )}
          </Panel>
        </Workspace>
      </Shell>
      <BottomNavigation currentPath="/seller/promotions" />
    </Page>
  );
}
