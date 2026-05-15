import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';

const Page = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(241, 247, 255, 0.92) 0%, #ffffff 42%, rgba(243, 240, 254, 0.5) 100%);
  color: ${props => props.theme.colors.text.primary};
  padding-bottom: 110px;
`;

const Shell = styled.main`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(22px, 4vw, 46px) 0 52px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1180px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: clamp(22px, 4vw, 46px);
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 560px;
  padding: clamp(24px, 5vw, 48px) 0;

  @media (max-width: 900px) {
    min-height: auto;
    padding-bottom: 4px;
  }
`;

const Eyebrow = styled.div`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(61, 129, 239, 0.1);
  border: 1px solid rgba(61, 129, 239, 0.18);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 18px;
`;

const Spark = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  box-shadow: 0 0 0 5px rgba(61, 129, 239, 0.12);
`;

const Title = styled.h1`
  margin: 0;
  max-width: 760px;
  font-size: clamp(38px, 7vw, 78px);
  line-height: 0.96;
  font-weight: 950;
  color: #0d1c33;
`;

const Accent = styled.span`
  display: block;
  color: ${props => props.theme.colors.primary};
`;

const Lead = styled.p`
  max-width: 620px;
  margin: 22px 0 0;
  font-size: clamp(16px, 2.2vw, 20px);
  line-height: 1.55;
  color: ${props => props.theme.colors.text.secondary};
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
`;

const PrimaryButton = styled.button`
  min-height: 50px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.28);
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 42px rgba(61, 129, 239, 0.34);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.66;
    transform: none;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: #ffffff;
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.2);
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.08);
`;

const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 34px;
  max-width: 680px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TrustItem = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(228, 231, 236, 0.86);
  box-shadow: 0 14px 34px rgba(16, 24, 40, 0.06);
`;

const TrustNumber = styled.div`
  font-size: 22px;
  font-weight: 950;
  color: #0d1c33;
`;

const TrustLabel = styled.div`
  margin-top: 3px;
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.secondary};
`;

const FormCard = styled.aside`
  position: sticky;
  top: 92px;
  align-self: start;
  border-radius: 28px;
  padding: 22px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.44), rgba(196, 184, 252, 0.42), rgba(126, 193, 246, 0.3)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.14);

  @media (max-width: 900px) {
    position: static;
  }

  @media (max-width: 520px) {
    border-radius: 22px;
    padding: 16px;
  }
`;

const CardHead = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
`;

const LogoMark = styled.div`
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 20px;
  font-weight: 950;
  box-shadow: 0 14px 28px rgba(61, 129, 239, 0.28);
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 1.15;
  font-weight: 950;
`;

const CardSub = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: ${props => props.theme.colors.text.secondary};
`;

const Form = styled.form`
  display: grid;
  gap: 13px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  font-size: 12px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 13px;
  border-radius: 15px;
  border: 1px solid ${props => props.$error ? props.theme.colors.dangerBase : 'rgba(228, 231, 236, 0.95)'};
  background: ${props => props.$error ? props.theme.colors.danger[100] : '#f8fafc'};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 700;
  outline: none;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(61, 129, 239, 0.11);
  }
`;

const Select = styled.select`
  width: 100%;
  height: 46px;
  padding: 0 13px;
  border-radius: 15px;
  border: 1px solid ${props => props.$error ? props.theme.colors.dangerBase : 'rgba(228, 231, 236, 0.95)'};
  background: ${props => props.$error ? props.theme.colors.danger[100] : '#f8fafc'};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 700;
  outline: none;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 86px;
  padding: 12px 13px;
  border-radius: 15px;
  border: 1px solid rgba(228, 231, 236, 0.95);
  background: #f8fafc;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 700;
  outline: none;
  resize: vertical;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(61, 129, 239, 0.11);
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CategoryPill = styled.button`
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${props => props.$selected ? 'rgba(61, 129, 239, 0.34)' : 'rgba(228, 231, 236, 0.95)'};
  background: ${props => props.$selected ? props.theme.colors.gradient.soft : '#ffffff'};
  color: ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
`;

const ErrorBox = styled.div`
  padding: 11px 12px;
  border-radius: 14px;
  background: ${props => props.theme.colors.danger[100]};
  color: ${props => props.theme.colors.dangerBase};
  font-size: 13px;
  font-weight: 800;
`;

const SuccessBox = styled.div`
  padding: 16px;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid rgba(61, 129, 239, 0.16);
`;

const SuccessTitle = styled.div`
  font-size: 18px;
  font-weight: 950;
  color: #0d1c33;
`;

const SuccessCopy = styled.p`
  margin: 7px 0 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.5;
  font-weight: 700;
`;

const Section = styled.section`
  margin-top: clamp(28px, 6vw, 70px);
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
  margin-bottom: 18px;

  @media (max-width: 680px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1.05;
  font-weight: 950;
`;

const SectionCopy = styled.p`
  margin: 0;
  max-width: 520px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.55;
  font-weight: 700;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  min-height: 190px;
  padding: 20px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.88);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
`;

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 18px;

  svg {
    width: 22px;
    height: 22px;
    stroke: currentColor;
    stroke-width: 2.2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const FeatureTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 950;
`;

const FeatureCopy = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.55;
  font-weight: 700;
`;

const categories = [
  { id: 'living', label: 'Living' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'dining', label: 'Dining' },
  { id: 'office', label: 'Office' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'storage', label: 'Storage' },
];

const sellerTypes = [
  'Furniture Store',
  'Interior Studio',
  'Reseller',
  'Maker or Workshop',
  'Home Decor Seller',
  'Other',
];

const statsFallback = {
  activeSellers: 500,
  pendingApplications: 0,
  averageSetupMinutes: 7,
  monthlyPayouts: 2400000,
  feeLabel: 'Free to list',
};

const DeliveryIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 7h11v10H3z" />
    <path d="M14 10h4l3 3v4h-7z" />
    <circle cx="7" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 16v-5" />
    <path d="M12 16V8" />
    <path d="M16 16v-7" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 19 6v5c0 4.4-2.8 8.3-7 10-4.2-1.7-7-5.6-7-10V6z" />
    <path d="m9 12 2 2 4-5" />
  </svg>
);

const formatRand = (value) => {
  if (value >= 1000000) return `R${(value / 1000000).toFixed(1)}M`;
  return `R${Number(value || 0).toLocaleString('en-ZA')}`;
};

export function BecomeSellerPage({ location }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(statsFallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdSeller, setCreatedSeller] = useState(null);
  const [form, setForm] = useState({
    storeName: '',
    storeType: '',
    phone: '',
    email: '',
    city: location?.city || 'Johannesburg',
    suburb: location?.suburb || 'Sandton',
    inventoryCount: '10-25',
    sellingTimeline: 'this_week',
    monthlyGoal: '25000',
    notes: '',
  });
  const [selectedCategories, setSelectedCategories] = useState(['living', 'bedroom']);

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE_URL}/sellers/become-a-seller/stats`)
      .then(response => response.ok ? response.json() : null)
      .then(json => {
        if (active && json?.success && json.data) {
          setStats({ ...statsFallback, ...json.data });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const estimatedRevenue = useMemo(() => {
    const goal = Number(form.monthlyGoal || 0);
    return goal > 0 ? goal : 25000;
  }, [form.monthlyGoal]);

  const setValue = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => (
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    ));
  };

  const validate = () => {
    if (form.storeName.trim().length < 2) return 'Add your store name.';
    if (!form.storeType) return 'Choose what kind of seller you are.';
    if (form.phone.trim().length < 8) return 'Add a valid phone number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Add a valid email address.';
    if (!form.city.trim()) return 'Add your city.';
    if (selectedCategories.length === 0) return 'Choose at least one room or category.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/sellers/become-a-seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categories: selectedCategories,
          lat: location?.lat,
          lng: location?.lng,
          source: 'become_seller_page',
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Could not create seller application.');
      }

      const seller = json.data?.seller;
      const sellerId = json.data?.onboardingId || seller?.id;
      const draft = {
        phone: form.phone,
        email: form.email,
        legalBusinessName: form.storeName,
        storeBasicInfo: {
          storeType: form.storeType,
          storePhone: form.phone,
          contactEmail: form.email,
        },
        storeSetup: {
          name: form.storeName,
          description: form.notes || `${form.storeName} is preparing to sell on Shopply.`,
        },
        address: {
          street: '',
          suburb: form.suburb,
          city: form.city,
          lat: location?.lat || -26.1076,
          lng: location?.lng || 28.0567,
        },
        categories: selectedCategories,
      };

      if (sellerId) {
        localStorage.setItem('sellerOnboardingId', String(sellerId));
      }
      localStorage.setItem('sellerOnboardingDraft', JSON.stringify(draft));
      setCreatedSeller(seller || { id: sellerId });
    } catch (err) {
      setError(err.message || 'Could not create seller application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <TopNavigation
        location={location}
        title="Become a seller"
      />
      <Shell>
        <Hero>
          <HeroCopy>
            <Eyebrow><Spark /> Sell on Shopply</Eyebrow>
            <Title>
              Turn beautiful furniture
              <Accent>into local income.</Accent>
            </Title>
            <Lead>
              Launch a refined seller storefront, reach shoppers near you, and manage orders, payouts,
              promotions, and delivery from one simple dashboard.
            </Lead>
            <HeroActions>
              <PrimaryButton type="button" onClick={() => document.getElementById('seller-application')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Start seller application
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => navigate('/seller/onboarding')}>
                Continue setup
              </SecondaryButton>
            </HeroActions>

            <TrustGrid>
              <TrustItem>
                <TrustNumber>{stats.activeSellers}+</TrustNumber>
                <TrustLabel>active local sellers</TrustLabel>
              </TrustItem>
              <TrustItem>
                <TrustNumber>{formatRand(stats.monthlyPayouts)}</TrustNumber>
                <TrustLabel>monthly seller payouts</TrustLabel>
              </TrustItem>
              <TrustItem>
                <TrustNumber>{stats.averageSetupMinutes} min</TrustNumber>
                <TrustLabel>average setup time</TrustLabel>
              </TrustItem>
            </TrustGrid>
          </HeroCopy>

          <FormCard id="seller-application">
            <CardHead>
              <LogoMark>S</LogoMark>
              <div>
                <CardTitle>Apply to sell</CardTitle>
                <CardSub>We will create your seller draft and take you into onboarding.</CardSub>
              </div>
            </CardHead>

            {createdSeller ? (
              <SuccessBox>
                <SuccessTitle>Your seller draft is ready</SuccessTitle>
                <SuccessCopy>
                  Application #{createdSeller.id} has been saved on the server. Finish onboarding to set up
                  your store, payout details, and first listings.
                </SuccessCopy>
                <PrimaryButton type="button" onClick={() => navigate('/seller/onboarding')}>
                  Finish onboarding
                </PrimaryButton>
              </SuccessBox>
            ) : (
              <Form onSubmit={handleSubmit}>
                {error && <ErrorBox>{error}</ErrorBox>}

                <Field>
                  Store name
                  <Input
                    value={form.storeName}
                    onChange={(event) => setValue('storeName', event.target.value)}
                    placeholder="e.g. Sandton Living Studio"
                    $error={error.includes('store name')}
                  />
                </Field>

                <TwoCol>
                  <Field>
                    Seller type
                    <Select
                      value={form.storeType}
                      onChange={(event) => setValue('storeType', event.target.value)}
                      $error={error.includes('seller')}
                    >
                      <option value="">Choose type</option>
                      {sellerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    Inventory
                    <Select value={form.inventoryCount} onChange={(event) => setValue('inventoryCount', event.target.value)}>
                      <option value="1-10">1-10 pieces</option>
                      <option value="10-25">10-25 pieces</option>
                      <option value="25-100">25-100 pieces</option>
                      <option value="100+">100+ pieces</option>
                    </Select>
                  </Field>
                </TwoCol>

                <TwoCol>
                  <Field>
                    Phone
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setValue('phone', event.target.value)}
                      placeholder="+27 82 000 0000"
                      $error={error.includes('phone')}
                    />
                  </Field>
                  <Field>
                    Email
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) => setValue('email', event.target.value)}
                      placeholder="store@example.com"
                      $error={error.includes('email')}
                    />
                  </Field>
                </TwoCol>

                <TwoCol>
                  <Field>
                    Suburb
                    <Input value={form.suburb} onChange={(event) => setValue('suburb', event.target.value)} />
                  </Field>
                  <Field>
                    City
                    <Input value={form.city} onChange={(event) => setValue('city', event.target.value)} $error={error.includes('city')} />
                  </Field>
                </TwoCol>

                <Field>
                  Rooms and categories
                  <CategoryRow>
                    {categories.map(category => (
                      <CategoryPill
                        key={category.id}
                        type="button"
                        $selected={selectedCategories.includes(category.id)}
                        onClick={() => toggleCategory(category.id)}
                      >
                        {category.label}
                      </CategoryPill>
                    ))}
                  </CategoryRow>
                </Field>

                <TwoCol>
                  <Field>
                    Selling timeline
                    <Select value={form.sellingTimeline} onChange={(event) => setValue('sellingTimeline', event.target.value)}>
                      <option value="this_week">This week</option>
                      <option value="this_month">This month</option>
                      <option value="exploring">Just exploring</option>
                    </Select>
                  </Field>
                  <Field>
                    Monthly goal
                    <Input
                      inputMode="numeric"
                      value={form.monthlyGoal}
                      onChange={(event) => setValue('monthlyGoal', event.target.value)}
                      placeholder="25000"
                    />
                  </Field>
                </TwoCol>

                <Field>
                  Notes
                  <TextArea
                    value={form.notes}
                    onChange={(event) => setValue('notes', event.target.value)}
                    placeholder="Tell us about your furniture, workshop, showroom, or delivery needs."
                  />
                </Field>

                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Creating seller draft...' : `Create draft for ${formatRand(estimatedRevenue)}/mo goal`}
                </PrimaryButton>
              </Form>
            )}
          </FormCard>
        </Hero>

        <Section>
          <SectionHead>
            <SectionTitle>Everything a local seller needs.</SectionTitle>
            <SectionCopy>
              The seller flow keeps the same polished Shopply home styling while giving sellers real tools
              for discovery, trust, fulfillment, and growth.
            </SectionCopy>
          </SectionHead>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon><DeliveryIcon /></FeatureIcon>
              <FeatureTitle>Local delivery built in</FeatureTitle>
              <FeatureCopy>Show nearby availability, offer pickup, and manage delivery-ready orders from the seller dashboard.</FeatureCopy>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon><ChartIcon /></FeatureIcon>
              <FeatureTitle>Demand-led selling</FeatureTitle>
              <FeatureCopy>Use trending rooms, flash deals, bundles, and analytics to move the right furniture faster.</FeatureCopy>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon><ShieldIcon /></FeatureIcon>
              <FeatureTitle>Verified storefronts</FeatureTitle>
              <FeatureCopy>Onboarding captures payout, address, and category details so buyers can trust every store.</FeatureCopy>
            </FeatureCard>
          </FeatureGrid>
        </Section>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
}
