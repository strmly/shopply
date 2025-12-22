import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '../../config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.xs};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  border-radius: ${props => props.theme.radii.sm};
  flex-shrink: 0;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 0;
`;

const Content = styled.main`
  padding: ${props => props.theme.spacing.xl};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
`;

const Intro = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.75;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const DocumentItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DocumentTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 18px;
  margin: 0;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;
`;

const DocumentDescription = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: ${props => props.theme.spacing.xs} 0 0 0;
  line-height: 1.6;
`;

const DocumentMeta = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing.xs};
  font-size: 12px;
`;

const Version = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
  margin-top: ${props => props.theme.spacing.lg};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.dangerBase};
`;

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const getDocumentRoute = (id) => {
  const routes = {
    'terms': '/legal/terms',
    'privacy': '/legal/privacy',
    'community-guidelines': '/legal/community-guidelines',
    'licenses': '/legal/licenses',
  };
  return routes[id] || '/legal';
};

export const LegalListPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/legal`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to load documents');
        }

        setDocuments(data.data);
      } catch (err) {
        console.error('Error fetching legal documents:', err);
        setError(err.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)} aria-label="Back">←</BackButton>
            <Title>Legal & About</Title>
          </HeaderLeft>
        </Header>
        <Content>
          <LoadingContainer>Loading documents...</LoadingContainer>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)} aria-label="Back">←</BackButton>
            <Title>Legal & About</Title>
          </HeaderLeft>
        </Header>
        <Content>
          <ErrorContainer>
            <div>{error}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </ErrorContainer>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">←</BackButton>
          <Title>Legal & About</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Intro>
          Trust, transparency, and accountability at system level. These documents outline your rights, our responsibilities, and how we protect your data.
        </Intro>

        <DocumentList>
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              onClick={() => navigate(getDocumentRoute(doc.id))}
            >
              <DocumentHeader>
                <DocumentTitle>{doc.title}</DocumentTitle>
                <Arrow>→</Arrow>
              </DocumentHeader>
              {doc.description && (
                <DocumentDescription>{doc.description}</DocumentDescription>
              )}
              {doc.lastUpdated && (
                <DocumentMeta>
                  Last updated: {formatDate(doc.lastUpdated)}
                </DocumentMeta>
              )}
            </DocumentItem>
          ))}
        </DocumentList>

        <Version>
          Str3mly ShopLocal v1.0.0
        </Version>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};

