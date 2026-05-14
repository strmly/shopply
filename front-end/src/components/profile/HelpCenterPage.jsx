import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import Input from '../ui/Input';

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 104px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 48%, #ffffff 100%);
  animation: ${fadeIn} 0.35s ease;
`;

const Shell = styled.main`
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 28px;

  @media (max-width: 560px) {
    width: min(100% - 22px, 960px);
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 16px;
  padding: clamp(18px, 4vw, 30px);
  border-radius: 28px;
  border: 1px solid transparent;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.94)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(61, 129, 239, 0.18);
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(32px, 7vw, 54px);
  line-height: 1;
  letter-spacing: 0;
  font-weight: 900;
`;

const Subtext = styled.p`
  margin: 0;
  max-width: 680px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const SearchBox = styled.div`
  max-width: 680px;
`;

const Section = styled.section`
  margin-top: 16px;
  display: grid;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 22px;
  font-weight: 900;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  min-height: 126px;
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(16, 24, 40, 0.06);
  text-align: left;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(61, 129, 239, 0.28);
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const CardTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  font-weight: 900;
`;

const CardText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.45;
  font-weight: 750;
`;

const ResultList = styled.div`
  display: grid;
  gap: 8px;
`;

const Result = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const Badge = styled.span`
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 11px;
  font-weight: 900;
`;

const SupportPanel = styled.div`
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(61, 129, 239, 0.16);
  background: ${props => props.theme.colors.gradient.soft};
`;

const Button = styled.button`
  width: fit-content;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
`;

export const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/help/categories`);
        const data = await response.json();
        if (data.success) setCategories(data.data || []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/help/search?q=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        if (data.success) setResults(data.data || []);
      } catch {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <Page>
      <Shell>
        <Hero>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">&lt;</BackButton>
          <div>
            <Title>Help and support</Title>
            <Subtext>Find answers for orders, returns, sellers, payments, and account settings.</Subtext>
          </div>
          <SearchBox>
            <Input
              placeholder="Search help articles"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </SearchBox>
        </Hero>

        {query.trim() && (
          <Section>
            <SectionTitle>Search results</SectionTitle>
            <ResultList>
              {results.length > 0 ? results.map((article) => (
                <Result key={article.id} onClick={() => navigate(`/support/help/article/${article.id}`)}>
                  <div>
                    <CardTitle>{article.title}</CardTitle>
                    <CardText>{article.summary}</CardText>
                  </div>
                  <Badge>Article</Badge>
                </Result>
              )) : (
                <SupportPanel>
                  <CardTitle>No matching articles yet</CardTitle>
                  <CardText>Try another search or contact support and we will help you directly.</CardText>
                  <Button onClick={() => navigate('/support/contact')}>Contact support</Button>
                </SupportPanel>
              )}
            </ResultList>
          </Section>
        )}

        {!query.trim() && (
          <>
            <Section>
              <SectionTitle>Browse by topic</SectionTitle>
              <Grid>
                {categories.map((category) => (
                  <Card key={category.id} onClick={() => navigate(`/support/help/category/${category.id}`)}>
                    <CardTitle>{category.title}</CardTitle>
                    <CardText>{category.description}</CardText>
                  </Card>
                ))}
              </Grid>
            </Section>

            <Section>
              <SupportPanel>
                <CardTitle>Need a hand from Tsenga?</CardTitle>
                <CardText>Our support flow is ready for order, return, account, and seller questions.</CardText>
                <Button onClick={() => navigate('/support/contact')}>Contact support</Button>
              </SupportPanel>
            </Section>
          </>
        )}
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
