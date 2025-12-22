import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { Input } from '../ui/Input';
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
  flex: 1;
  min-width: 0;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchContainer = styled.div`
  flex-shrink: 0;
  width: 180px;
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

const Meta = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const PlainLanguageSummary = styled.div`
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SummaryTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const SummaryList = styled.ul`
  margin: 0;
  padding-left: ${props => props.theme.spacing.lg};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.75;
`;

const SummaryItem = styled.li`
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TocContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const TocTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: 16px;
`;

const Toc = styled.ul`
  margin: 0;
  padding-left: ${props => props.theme.spacing.lg};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.75;
`;

const TocItem = styled.li`
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.theme.colors.text.secondary};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const DocumentContent = styled.div`
  line-height: 1.75;
  color: ${props => props.theme.colors.text.secondary};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  scroll-margin-top: 100px;
`;

const SectionHeading = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: 20px;
  line-height: 1.4;
`;

const HighlightedSection = styled(Section)`
  background: ${props => props.theme.colors.warning[100]};
  border-left: 4px solid ${props => props.theme.colors.warning[500]};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radii.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Paragraph = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  line-height: 1.75;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
`;

const BulletList = styled.ul`
  margin: ${props => props.theme.spacing.md} 0;
  padding-left: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.75;
`;

const BulletItem = styled.li`
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Highlight = styled.mark`
  background: ${props => props.theme.colors.warning[200]};
  color: inherit;
  padding: 2px 4px;
  border-radius: 2px;
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

// Licenses specific styles
const LicenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const LicenseItem = styled.div`
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
`;

const LicenseHeader = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background};
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const LicenseName = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 16px;
`;

const LicenseMeta = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const LicenseExpandIcon = styled.span`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
  transition: ${props => props.theme.transitions.swift};
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const LicenseContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  white-space: pre-wrap;
  line-height: 1.6;
  max-height: ${props => props.$expanded ? 'none' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

export const LegalDocumentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLicenses, setExpandedLicenses] = useState({});
  const contentRef = useRef(null);

  const documentType = useMemo(() => {
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('privacy')) return 'privacy';
    if (location.pathname.includes('community-guidelines')) return 'community-guidelines';
    if (location.pathname.includes('licenses')) return 'licenses';
    return 'terms';
  }, [location.pathname]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let endpoint = '';
        switch (documentType) {
          case 'terms':
            endpoint = '/legal/terms';
            break;
          case 'privacy':
            endpoint = '/legal/privacy';
            break;
          case 'community-guidelines':
            endpoint = '/legal/community-guidelines';
            break;
          case 'licenses':
            endpoint = '/legal/licenses';
            break;
          default:
            endpoint = '/legal/terms';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to load document');
        }

        setDocument(data.data);
      } catch (err) {
        console.error('Error fetching legal document:', err);
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentType]);

  const filteredSections = useMemo(() => {
    if (!document || !document.sections) return [];
    if (!search.trim()) return document.sections;

    const query = search.toLowerCase();
    return document.sections.filter(section => {
      const headingMatch = section.heading?.toLowerCase().includes(query);
      const contentMatch = Array.isArray(section.content)
        ? section.content.some(line => line.toLowerCase().includes(query))
        : String(section.content || '').toLowerCase().includes(query);
      return headingMatch || contentMatch;
    });
  }, [document, search]);

  // Simple markdown renderer for bold text (**text**)
  const renderMarkdown = (text) => {
    if (typeof text !== 'string') return text;
    
    // Handle bold (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={i}>{boldText}</strong>;
      }
      return part;
    });
  };

  const highlightText = (text) => {
    if (typeof text !== 'string') return text;
    
    if (!search.trim()) {
      return renderMarkdown(text);
    }
    
    // First highlight search, then apply markdown to each part
    const query = search.toLowerCase();
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return parts.map((part, i) => {
      if (part.toLowerCase() === query) {
        return <Highlight key={i}>{part}</Highlight>;
      }
      return <span key={i}>{renderMarkdown(part)}</span>;
    });
  };

  const scrollToSection = (sectionId) => {
    if (!sectionId) return;
    // Use a small delay to ensure DOM is updated
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const toggleLicense = (index) => {
    setExpandedLicenses(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)} aria-label="Back">←</BackButton>
            <Title>Loading...</Title>
          </HeaderLeft>
        </Header>
        <Content>
          <LoadingContainer>Loading document...</LoadingContainer>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  if (error || !document) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)} aria-label="Back">←</BackButton>
            <Title>Error</Title>
          </HeaderLeft>
        </Header>
        <Content>
          <ErrorContainer>
            <div>{error || 'Failed to load document'}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </ErrorContainer>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  const isLicenses = documentType === 'licenses';
  const hasPlainLanguageSummary = document.plainLanguageSummary;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">←</BackButton>
          <Title>{document.title}</Title>
        </HeaderLeft>
        {!isLicenses && (
          <SearchContainer>
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </SearchContainer>
        )}
      </Header>

      <Content ref={contentRef}>
        <Meta>
          Last updated: {formatDate(document.lastUpdated)}
        </Meta>

        {hasPlainLanguageSummary && (
          <PlainLanguageSummary>
            <SummaryTitle>{document.plainLanguageSummary.title}</SummaryTitle>
            <SummaryList>
              {document.plainLanguageSummary.points.map((point, idx) => (
                <SummaryItem key={idx}>{point}</SummaryItem>
              ))}
            </SummaryList>
          </PlainLanguageSummary>
        )}

        {document.openingStatement && (
          <Paragraph style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '24px' }}>
            {document.openingStatement}
          </Paragraph>
        )}

        {document.tableOfContents && document.tableOfContents.length > 0 && (
          <TocContainer>
            <TocTitle>Table of Contents</TocTitle>
            <Toc>
              {document.tableOfContents.map((item, idx) => (
                <TocItem
                  key={idx}
                  onClick={() => {
                    const section = document.sections?.[idx];
                    if (section?.id) {
                      scrollToSection(section.id);
                    }
                  }}
                >
                  {item}
                </TocItem>
              ))}
            </Toc>
          </TocContainer>
        )}

        <DocumentContent>
          {isLicenses ? (
            <LicenseList>
              {document.licenses?.map((license, idx) => (
                <LicenseItem key={idx}>
                  <LicenseHeader onClick={() => toggleLicense(idx)}>
                    <div>
                      <LicenseName>{license.name}</LicenseName>
                      <LicenseMeta>
                        Version {license.version} • {license.license}
                      </LicenseMeta>
                      {license.description && (
                        <LicenseMeta style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          {license.description}
                        </LicenseMeta>
                      )}
                    </div>
                    <LicenseExpandIcon $expanded={expandedLicenses[idx]}>▼</LicenseExpandIcon>
                  </LicenseHeader>
                  {expandedLicenses[idx] && (
                    <LicenseContent $expanded={expandedLicenses[idx]}>
                      {license.licenseText}
                    </LicenseContent>
                  )}
                </LicenseItem>
              ))}
            </LicenseList>
          ) : (
            filteredSections.map((section, idx) => {
              const SectionComponent = section.highlight ? HighlightedSection : Section;
              
              // Process content to group bullet items
              const renderContent = () => {
                if (!Array.isArray(section.content)) {
                  return <Paragraph>{highlightText(String(section.content || ''))}</Paragraph>;
                }

                const elements = [];
                let currentBulletList = null;
                let bulletItems = [];

                section.content.forEach((line, lineIdx) => {
                  if (line.trim() === '') {
                    // If we have accumulated bullet items, render them
                    if (bulletItems.length > 0) {
                      elements.push(
                        <BulletList key={`bullets-${lineIdx}`}>
                          {bulletItems.map((item, itemIdx) => (
                            <BulletItem key={itemIdx}>{highlightText(item)}</BulletItem>
                          ))}
                        </BulletList>
                      );
                      bulletItems = [];
                    }
                    elements.push(<br key={`br-${lineIdx}`} />);
                  } else if (line.startsWith('•') || line.match(/^\d+\./)) {
                    // Add to bullet list
                    const cleaned = line.replace(/^[•\d+\.]\s*/, '');
                    bulletItems.push(cleaned);
                  } else {
                    // If we have accumulated bullet items, render them first
                    if (bulletItems.length > 0) {
                      elements.push(
                        <BulletList key={`bullets-${lineIdx}`}>
                          {bulletItems.map((item, itemIdx) => (
                            <BulletItem key={itemIdx}>{highlightText(item)}</BulletItem>
                          ))}
                        </BulletList>
                      );
                      bulletItems = [];
                    }
                    // Check if it's a heading
                    if (line.startsWith('### ')) {
                      const headingText = line.replace(/^###\s+/, '');
                      elements.push(
                        <strong key={lineIdx} style={{ fontSize: '18px', display: 'block', marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: 'inherit' }}>
                          {highlightText(headingText)}
                        </strong>
                      );
                    } else {
                      // Render as paragraph
                      elements.push(
                        <Paragraph key={lineIdx}>{highlightText(line)}</Paragraph>
                      );
                    }
                  }
                });

                // Render any remaining bullet items
                if (bulletItems.length > 0) {
                  elements.push(
                    <BulletList key={`bullets-final`}>
                      {bulletItems.map((item, itemIdx) => (
                        <BulletItem key={itemIdx}>{highlightText(item)}</BulletItem>
                      ))}
                    </BulletList>
                  );
                }

                return elements;
              };

              return (
                <SectionComponent key={section.id || idx} id={section.id}>
                  <SectionHeading>{highlightText(section.heading)}</SectionHeading>
                  {renderContent()}
                </SectionComponent>
              );
            })
          )}
        </DocumentContent>

        {filteredSections.length === 0 && search && (
          <Paragraph style={{ textAlign: 'center', color: 'inherit' }}>
            No results found for "{search}"
          </Paragraph>
        )}
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};
