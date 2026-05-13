import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProfileHeader } from './ProfileHeader';
import { QuickActions } from './QuickActions';
import { AccountSection } from './AccountSection';
import { OrdersCommunity } from './OrdersCommunity';
import { PaymentAddresses } from './PaymentAddresses';
import { AppPreferences } from './AppPreferences';
import { SupportHelp } from './SupportHelp';
import { LegalAbout } from './LegalAbout';
import { SellerSection } from './SellerSection';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 54%, #F8FAFC 100%);
  animation: ${fadeIn} 0.5s ease-in;
  padding: 24px min(5vw, 48px);
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 390px);
  gap: 24px;
  align-items: start;

  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0;
`;

const SideColumn = styled.aside`
  position: sticky;
  top: 88px;
  display: grid;
  gap: 16px;

  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    position: static;
  }
`;

export const ProfilePage = ({ location }) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Container>
        <Content>
          <MainColumn>
            <div>Loading profile...</div>
          </MainColumn>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <MainColumn>
          <ProfileHeader user={user} location={location} />
          <QuickActions navigate={navigate} />
          <SellerSection navigate={navigate} />
          <OrdersCommunity
            navigate={navigate}
            orders={[]}
            reviews={[]}
            communityActivity={{ posts: 0, questions: 0, answers: 0 }}
          />
        </MainColumn>
        <SideColumn>
          <AccountSection user={user} navigate={navigate} />
          <PaymentAddresses navigate={navigate} />
          <AppPreferences />
          <SupportHelp />
          <LegalAbout />
        </SideColumn>
      </Content>
      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};
