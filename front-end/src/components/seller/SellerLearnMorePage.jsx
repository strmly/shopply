import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';

const Page = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(241, 247, 255, 0.96) 0%, #ffffff 42%, rgba(243, 240, 254, 0.58) 100%);
  color: ${props => props.theme.colors.text.primary};
  padding-bottom: 112px;
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
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
  gap: clamp(20px, 4vw, 44px);
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
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
  font-size: clamp(38px, 7vw, 76px);
  line-height: 0.97;
  font-weight: 950;
  color: #0d1c33;
`;

const Accent = styled.span`
  display: block;
  color: ${props => props.theme.colors.primary};
`;

const Lead = styled.p`
  max-width: 620px;
  margin: 21px 0 0;
  font-size: clamp(15px, 2vw, 19px);
  line-height: 1.58;
  color: ${props => props.theme.colors.text.secondary};
`;

const ActionRow = styled.div`
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
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.28);
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 42px rgba(61, 129, 239, 0.34);
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: #ffffff;
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.2);
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.08);
`;

const VisualPanel = styled.aside`
  border-radius: 30px;
  padding: 18px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.42), rgba(196, 184, 252, 0.42), rgba(126, 193, 246, 0.3)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.13);
`;

const DashboardMock = styled.div`
  min-height: 360px;
  border-radius: 24px;
  padding: 18px;
  background:
    linear-gradient(135deg, #0d1c33 0%, #143056 48%, #1f4c8b 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MockTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
`;

const LogoMark = styled.div`
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: ${props => props.theme.colors.gradient.primary};
  font-size: 19px;
  font-weight: 950;
`;

const MockLabel = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.58);
`;

const MockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const MockCard = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const MockValue = styled.div`
  font-size: 24px;
  font-weight: 950;
`;

const MockCaption = styled.div`
  margin-top: 4px;
  font-size: 11px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
`;

const Section = styled.section`
  margin-top: clamp(30px, 6vw, 72px);
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
  margin-bottom: 18px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  max-width: 560px;
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1.06;
  font-weight: 950;
  color: #0d1c33;
`;

const SectionCopy = styled.p`
  margin: 0;
  max-width: 520px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.55;
  font-weight: 700;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  padding: 20px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.9);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
`;

const CardIcon = styled.div`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primary};
  font-size: 18px;
  font-weight: 950;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 17px;
  line-height: 1.2;
  font-weight: 950;
  color: #0d1c33;
`;

const CardCopy = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.55;
  font-weight: 700;
`;

const StepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 920px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const StepNumber = styled.div`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 950;
  margin-bottom: 14px;
`;

const Economics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const EconomicCard = styled(Card)`
  min-height: 128px;
`;

const EconomicValue = styled.div`
  font-size: 28px;
  line-height: 1;
  font-weight: 950;
  color: ${props => props.theme.colors.primary};
`;

const FaqGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const FaqCard = styled.details`
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.05);
  overflow: hidden;

  summary {
    cursor: pointer;
    padding: 16px 18px;
    font-size: 14px;
    font-weight: 950;
    color: #0d1c33;
  }

  p {
    margin: 0;
    padding: 0 18px 18px;
    color: ${props => props.theme.colors.text.secondary};
    font-size: 13px;
    line-height: 1.55;
    font-weight: 700;
  }
`;

const CtaBand = styled.section`
  margin-top: clamp(34px, 6vw, 72px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 24px;
  border-radius: 28px;
  background: ${props => props.theme.colors.gradient.dark};
  color: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.28);

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const CtaTitle = styled.h2`
  margin: 0 0 6px;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 950;
`;

const CtaCopy = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 14px;
  font-weight: 700;
`;

const defaultContent = {
  hero: {
    eyebrow: 'Sell on Tsenga',
    title: 'A beautiful way to sell furniture locally',
    subtitle: 'Launch a trusted storefront, reach nearby buyers, and manage orders from one calm dashboard.',
  },
  stats: { activeSellers: 500, monthlyPayouts: 2400000, averageSetupMinutes: 7 },
  benefits: [],
  steps: [],
  economics: { listingFee: 'R0', payoutCadence: 'Weekly payouts', setupTime: '7 minutes', monthlyPayouts: 2400000 },
  faqs: [],
};

const money = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `R${(amount / 1000000).toFixed(1)}M`;
  return `R${amount.toLocaleString('en-ZA')}`;
};

export function SellerLearnMorePage({ location }) {
  const navigate = useNavigate();
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/sellers/learn-more`)
      .then(response => response.ok ? response.json() : null)
      .then(json => {
        if (active && json?.success && json.data) setContent(json.data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <Page>
      <TopNavigation location={location} title="Sell on Tsenga" />
      <Shell>
        <Hero>
          <div>
            <Eyebrow><Spark /> {content.hero.eyebrow}</Eyebrow>
            <Title>
              {content.hero.title}
              <Accent>Built for local furniture sellers.</Accent>
            </Title>
            <Lead>{content.hero.subtitle}</Lead>
            <ActionRow>
              <PrimaryButton type="button" onClick={() => navigate('/become-a-seller')}>
                Become a seller
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => document.getElementById('seller-steps')?.scrollIntoView({ behavior: 'smooth' })}>
                See how it works
              </SecondaryButton>
            </ActionRow>
          </div>

          <VisualPanel>
            <DashboardMock>
              <MockTop>
                <LogoMark>T</LogoMark>
                <MockLabel>Seller dashboard preview</MockLabel>
              </MockTop>
              <MockGrid>
                <MockCard>
                  <MockValue>{content.stats.activeSellers}+</MockValue>
                  <MockCaption>active sellers</MockCaption>
                </MockCard>
                <MockCard>
                  <MockValue>{money(content.stats.monthlyPayouts)}</MockValue>
                  <MockCaption>monthly payouts</MockCaption>
                </MockCard>
                <MockCard>
                  <MockValue>{content.stats.averageSetupMinutes} min</MockValue>
                  <MockCaption>average setup</MockCaption>
                </MockCard>
                <MockCard>
                  <MockValue>R0</MockValue>
                  <MockCaption>to list</MockCaption>
                </MockCard>
              </MockGrid>
            </DashboardMock>
          </VisualPanel>
        </Hero>

        <Section>
          <SectionHead>
            <SectionTitle>Why sellers choose Tsenga.</SectionTitle>
            <SectionCopy>Everything is shaped around how furniture is actually bought: by room, distance, trust, delivery, and fit.</SectionCopy>
          </SectionHead>
          <CardGrid>
            {content.benefits.map((benefit, index) => (
              <Card key={benefit.title}>
                <CardIcon>{index + 1}</CardIcon>
                <CardTitle>{benefit.title}</CardTitle>
                <CardCopy>{benefit.description}</CardCopy>
              </Card>
            ))}
          </CardGrid>
        </Section>

        <Section id="seller-steps">
          <SectionHead>
            <SectionTitle>From application to first order.</SectionTitle>
            <SectionCopy>Your Learn more path is powered by the server, then the application continues into the real onboarding flow.</SectionCopy>
          </SectionHead>
          <StepGrid>
            {content.steps.map((step, index) => (
              <Card key={step.title}>
                <StepNumber>{index + 1}</StepNumber>
                <CardTitle>{step.title}</CardTitle>
                <CardCopy>{step.description}</CardCopy>
              </Card>
            ))}
          </StepGrid>
        </Section>

        <Section>
          <SectionHead>
            <SectionTitle>Clear seller economics.</SectionTitle>
            <SectionCopy>Simple enough to understand before applying, connected enough to support a real seller dashboard afterwards.</SectionCopy>
          </SectionHead>
          <Economics>
            <EconomicCard>
              <EconomicValue>{content.economics.listingFee}</EconomicValue>
              <CardCopy>listing fee</CardCopy>
            </EconomicCard>
            <EconomicCard>
              <EconomicValue>{content.economics.payoutCadence}</EconomicValue>
              <CardCopy>seller payout rhythm</CardCopy>
            </EconomicCard>
            <EconomicCard>
              <EconomicValue>{content.economics.setupTime}</EconomicValue>
              <CardCopy>average setup time</CardCopy>
            </EconomicCard>
            <EconomicCard>
              <EconomicValue>{money(content.economics.monthlyPayouts)}</EconomicValue>
              <CardCopy>monthly seller payouts</CardCopy>
            </EconomicCard>
          </Economics>
        </Section>

        <Section>
          <SectionHead>
            <SectionTitle>Seller questions.</SectionTitle>
            <SectionCopy>Quick answers before you start the application.</SectionCopy>
          </SectionHead>
          <FaqGrid>
            {content.faqs.map(faq => (
              <FaqCard key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </FaqCard>
            ))}
          </FaqGrid>
        </Section>

        <CtaBand>
          <div>
            <CtaTitle>Ready to sell on Tsenga?</CtaTitle>
            <CtaCopy>Create a seller draft, then finish verification and payout setup.</CtaCopy>
          </div>
          <PrimaryButton type="button" onClick={() => navigate('/become-a-seller')}>
            Start application
          </PrimaryButton>
        </CtaBand>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
}
