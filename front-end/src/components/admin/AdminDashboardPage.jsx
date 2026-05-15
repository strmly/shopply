import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import apiFetch from '../../utils/apiClient';
import { getToken } from '../../utils/authState';
import { useUser } from '../../context/UserContext';
import API_BASE_URL from '@config/api';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { toast } from '../ui/Toast';
import { fadeIn } from '../../theme/animations';

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(61,129,239,0.12), transparent 28%),
    radial-gradient(circle at 86% 18%, rgba(21,161,124,0.1), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 48%, #ffffff 100%);
  animation: ${fadeIn} 0.45s ease;
  padding-bottom: 106px;
`;

const Hero = styled.header`
  position: sticky;
  top: 0;
  z-index: 80;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const HeroInner = styled.div`
  width: min(1240px, calc(100% - 32px));
  margin: 0 auto;
  padding: 16px 0;
`;

const HeroTop = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;

  @media (max-width: 760px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228, 231, 236, 0.95);
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 3px 0 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(28px, 6vw, 50px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 760px) {
    grid-column: 1 / -1;
    justify-content: stretch;
  }
`;

const Button = styled.button`
  min-height: 40px;
  border: 1px solid ${props => props.$ghost ? 'rgba(228,231,236,0.95)' : 'transparent'};
  border-radius: 999px;
  padding: 9px 14px;
  background: ${props => props.$ghost ? '#ffffff' : props.theme.colors.gradient.primary};
  color: ${props => props.$ghost ? props.theme.colors.primarySoftText : '#ffffff'};
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: ${props => props.$ghost ? 'none' : '0 16px 30px rgba(61,129,239,0.2)'};
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const SearchShell = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin-top: 16px;
`;

const Search = styled.input`
  width: 100%;
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 999px;
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  padding: 13px 16px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(16,24,40,0.05);
`;

const SearchResults = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 8px;
`;

const SearchHit = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  border: 1px solid rgba(228,231,236,0.9);
  border-radius: 18px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.92);
  text-align: left;
  cursor: pointer;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(228,231,236,0.95)'};
  border-radius: 999px;
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.secondary};
  padding: 11px 15px;
  min-height: 42px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
`;

const Count = styled.span`
  margin-left: 7px;
  padding: 2px 7px;
  border-radius: 999px;
  background: ${props => props.$active ? 'rgba(255,255,255,0.22)' : props.theme.colors.primarySoftBg};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.primarySoftText};
`;

const Main = styled.main`
  width: min(1240px, calc(100% - 32px));
  margin: 0 auto;
  padding: 22px 0 0;
`;

const Panel = styled.section`
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.22), rgba(228,231,236,0.9), rgba(21,161,124,0.16)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 22px);
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  flex: 1;
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  line-height: 1.05;
  font-weight: 900;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  border: 1px solid rgba(228,231,236,0.95);
  border-radius: 999px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 900;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Stat = styled.div`
  min-width: 0;
  background: rgba(255,255,255,0.84);
  border: 1px solid rgba(228,231,236,0.92);
  border-radius: 18px;
  padding: 13px;
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  line-height: 1;
  font-weight: 900;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
  margin-top: 5px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(228,231,236,0.92);
  border-radius: 22px;
  padding: 16px;
`;

const RowList = styled.div`
  display: grid;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(228,231,236,0.8);
  &:last-child { border-bottom: 0; }
`;

const PrimaryText = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SecondaryText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
`;

const Tiny = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(228,231,236,0.92);
  background: rgba(255,255,255,0.78);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
`;

const Th = styled.th`
  padding: 13px 14px;
  text-align: left;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(228,231,236,0.92);
`;

const Td = styled.td`
  padding: 13px 14px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid rgba(228,231,236,0.72);
  vertical-align: middle;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${props => props.$tone === 'danger'
    ? 'rgba(198,40,80,0.1)'
    : props.$tone === 'warning'
      ? 'rgba(245,158,11,0.14)'
      : props.$tone === 'success'
        ? 'rgba(21,161,124,0.12)'
        : props.theme.colors.primarySoftBg};
  color: ${props => props.$tone === 'danger'
    ? (props.theme.colors.dangerBase || '#C62850')
    : props.$tone === 'warning'
      ? props.theme.colors.warningBase
      : props.$tone === 'success'
        ? '#08785f'
        : props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  border: 1px solid ${props => props.$danger ? 'rgba(198,40,80,0.22)' : 'rgba(228,231,236,0.95)'};
  border-radius: 999px;
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : props.$danger ? 'rgba(198,40,80,0.08)' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.$danger ? (props.theme.colors.dangerBase || '#C62850') : props.theme.colors.primarySoftText};
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const DrawerBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(16,24,40,0.32);
  display: flex;
  justify-content: flex-end;
`;

const Drawer = styled.aside`
  width: min(540px, 100%);
  height: 100%;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: -28px 0 70px rgba(16,24,40,0.18);
  padding: 22px;
`;

const DrawerHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const DrawerTitle = styled.h3`
  margin: 0;
  flex: 1;
  font-size: 24px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

const DetailBox = styled.div`
  border: 1px solid rgba(228,231,236,0.92);
  border-radius: 18px;
  background: #fbfdff;
  padding: 13px;
`;

const StatePanel = styled(Panel)`
  min-height: 300px;
  display: grid;
  place-items: center;
  text-align: center;
`;

const tabs = ['Overview', 'Users', 'Sellers', 'Orders', 'Products', 'Issues', 'Finance', 'Delivery', 'Alerts', 'Activity', 'Reports', 'Geo'];
const orderStatuses = ['pending', 'pending_seller_confirmation', 'confirmed', 'processing', 'preparing', 'out_for_delivery', 'ready', 'ready_for_pickup', 'delayed', 'shipped', 'delivered', 'cancelled'];
const sellerStatuses = ['draft', 'in_review', 'approved', 'rejected', 'suspended'];
const userRoles = ['buyer', 'seller', 'admin'];
const userStatuses = ['active', 'inactive', 'suspended'];
const productStatuses = ['pending', 'approved', 'hidden', 'suspended', 'featured'];
const issueStatuses = ['open', 'triage', 'in_progress', 'waiting', 'resolved', 'closed'];
const issuePriorities = ['low', 'medium', 'high', 'urgent'];

const money = value => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
const label = (value = '') => String(value).replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
const date = value => value ? new Date(value).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';
const toneFor = (value = '') => {
  if (['cancelled', 'rejected', 'suspended', 'inactive', 'danger'].includes(value)) return 'danger';
  if (['pending', 'pending_seller_confirmation', 'in_review', 'delayed', 'draft', 'warning'].includes(value)) return 'warning';
  if (['approved', 'delivered', 'active', 'success'].includes(value)) return 'success';
  return 'primary';
};

const includes = (item, fields, query) => fields.some(field => String(field(item) || '').toLowerCase().includes(query));

function GeoTab() {
  const [data, setData] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    setGeoLoading(true);
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    fetch(`${API_BASE_URL}/hyperlocal/heatmap`, { headers })
      .then(r => r.json())
      .then(res => {
        if (res.success) setData(res.data);
        else setGeoError(res.error || 'Failed to load geo data');
      })
      .catch(() => setGeoError('Network error'))
      .finally(() => setGeoLoading(false));
  }, []);

  if (geoLoading) {
    return (
      <StatePanel>
        <div>
          <PanelTitle>Loading geo analytics</PanelTitle>
          <SecondaryText>Fetching H3 heatmap data...</SecondaryText>
        </div>
      </StatePanel>
    );
  }

  if (geoError) {
    return (
      <StatePanel>
        <div>
          <PanelTitle>Failed to load geo data</PanelTitle>
          <SecondaryText>{geoError}</SecondaryText>
        </div>
      </StatePanel>
    );
  }

  const cells = data?.cells || [];
  const totalCells = data?.totalCells ?? cells.length;
  const totalProducts = cells.reduce((s, c) => s + (c.productCount || 0), 0);
  const activeCells = cells.filter(c => (c.views || 0) > 0).length;
  const maxViews = Math.max(...cells.map(c => c.views || 0), 1);
  const topCells = [...cells].sort((a, b) => (b.productCount || 0) - (a.productCount || 0)).slice(0, 20);

  return (
    <>
      <StatGrid>
        <Stat><StatValue>{totalCells}</StatValue><StatLabel>Indexed cells</StatLabel></Stat>
        <Stat><StatValue>{totalProducts}</StatValue><StatLabel>Indexed products</StatLabel></Stat>
        <Stat><StatValue>{activeCells}</StatValue><StatLabel>Active cells</StatLabel></Stat>
      </StatGrid>
      <TableWrap style={{ marginTop: 16 }}>
        <Table style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <Th>H3 Cell</Th>
              <Th>Products</Th>
              <Th>Stores</Th>
              <Th>Views (1h)</Th>
              <Th>Carts (1h)</Th>
              <Th>Orders (1h)</Th>
              <Th>Activity</Th>
            </tr>
          </thead>
          <tbody>
            {topCells.map(cell => (
              <tr key={cell.h3Cell}>
                <Td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {String(cell.h3Cell || '').slice(0, 14)}
                  </span>
                </Td>
                <Td>{cell.productCount ?? 0}</Td>
                <Td>{cell.storeCount ?? 0}</Td>
                <Td>{cell.views ?? 0}</Td>
                <Td>{cell.carts ?? 0}</Td>
                <Td>{cell.orders ?? 0}</Td>
                <Td>
                  <div style={{
                    height: 8,
                    borderRadius: 999,
                    background: 'rgba(228,231,236,0.8)',
                    width: 80,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #3d81ef, #15a17c)',
                      width: `${Math.round(((cell.views || 0) / maxViews) * 100)}%`,
                    }} />
                  </div>
                </Td>
              </tr>
            ))}
            {topCells.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <SecondaryText>No geo cells indexed yet.</SecondaryText>
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [issues, setIssues] = useState([]);
  const [finance, setFinance] = useState(null);
  const [deliveryEvents, setDeliveryEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalResults, setGlobalResults] = useState([]);
  const [filters, setFilters] = useState({ role: 'all', userStatus: 'all', sellerStatus: 'all', orderStatus: 'all', dateRange: 'all' });
  const [drawer, setDrawer] = useState(null);
  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState({});
  const [noteText, setNoteText] = useState('');

  const can = useCallback((permission) => {
    if (!permissions?.permissions) return true;
    return permissions.permissions.includes(permission);
  }, [permissions]);

  const readJson = async (response, fallback) => {
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || fallback);
    return data.data;
  };

  const loadAdmin = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, sellersRes, ordersRes, productsRes, issuesRes, financeRes, deliveryRes, alertsRes, activityRes, permissionsRes] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/admin/users'),
        apiFetch('/admin/sellers'),
        apiFetch('/admin/orders'),
        apiFetch('/admin/products'),
        apiFetch('/admin/issues'),
        apiFetch('/admin/finance'),
        apiFetch('/admin/delivery-monitor'),
        apiFetch('/admin/alerts'),
        apiFetch('/admin/activity'),
        apiFetch('/admin/permissions'),
      ]);

      const [statsData, usersData, sellersData, ordersData, productsData, issuesData, financeData, deliveryData, alertsData, activityData, permissionsData] = await Promise.all([
        readJson(statsRes, 'Failed to load stats'),
        readJson(usersRes, 'Failed to load users'),
        readJson(sellersRes, 'Failed to load sellers'),
        readJson(ordersRes, 'Failed to load orders'),
        readJson(productsRes, 'Failed to load products'),
        readJson(issuesRes, 'Failed to load issues'),
        readJson(financeRes, 'Failed to load finance'),
        readJson(deliveryRes, 'Failed to load delivery monitor'),
        readJson(alertsRes, 'Failed to load alerts'),
        readJson(activityRes, 'Failed to load activity'),
        readJson(permissionsRes, 'Failed to load permissions'),
      ]);

      setStats(statsData || {});
      setUsers(usersData || []);
      setSellers(sellersData || []);
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setIssues(issuesData || []);
      setFinance(financeData || null);
      setDeliveryEvents(deliveryData || []);
      setAlerts(alertsData || []);
      setActivity(activityData || []);
      setPermissions(permissionsData || null);
    } catch (err) {
      console.error('Admin dashboard load failed:', err);
      setError(err.message || 'Admin dashboard could not load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  useEffect(() => {
    const q = globalSearch.trim();
    if (q.length < 2) {
      setGlobalResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await apiFetch(`/admin/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = await response.json();
        if (response.ok && data.success) setGlobalResults(data.data || []);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    }, 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [globalSearch]);

  const statCards = [
    { label: 'Today Orders', value: stats?.todaysOrders ?? 0 },
    { label: 'Today Revenue', value: money(stats?.revenueToday ?? 0) },
    { label: 'Total Revenue', value: money(stats?.totalRevenue ?? 0) },
    { label: 'Pending Sellers', value: stats?.pendingSellerApplications ?? 0 },
    { label: 'Open Issues', value: stats?.openIssues ?? issues.filter(issue => !['resolved', 'closed'].includes(issue.status)).length },
    { label: 'Failed Messages', value: stats?.failedMessages ?? deliveryEvents.filter(event => ['failed', 'rejected'].includes(event.status)).length },
  ];

  const q = search.trim().toLowerCase();
  const filterByDate = useCallback((item) => {
    if (filters.dateRange === 'all') return true;
    const created = new Date(item.createdAt);
    const now = new Date();
    const days = filters.dateRange === 'today' ? 1 : filters.dateRange === 'week' ? 7 : 30;
    return created >= new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }, [filters.dateRange]);

  const filteredUsers = useMemo(() => users.filter(item => (
    (!q || includes(item, [x => x.name, x => x.email, x => x.mobile, x => x.role, x => x.status], q))
    && (filters.role === 'all' || item.role === filters.role)
    && (filters.userStatus === 'all' || item.status === filters.userStatus)
    && filterByDate(item)
  )), [users, q, filters.role, filters.userStatus, filterByDate]);

  const filteredSellers = useMemo(() => sellers.filter(item => (
    (!q || includes(item, [x => x.storeSetup?.name || x.legalBusinessName, x => x.email, x => x.phone, x => x.onboardingStatus], q))
    && (filters.sellerStatus === 'all' || item.onboardingStatus === filters.sellerStatus)
    && filterByDate(item)
  )), [sellers, q, filters.sellerStatus, filterByDate]);

  const filteredOrders = useMemo(() => orders.filter(item => (
    (!q || includes(item, [x => x.id, x => x.userId, x => x.status, x => x.contactInfo?.phone, x => x.contactInfo?.email], q))
    && (filters.orderStatus === 'all' || item.status === filters.orderStatus)
    && filterByDate(item)
  )), [orders, q, filters.orderStatus, filterByDate]);

  const filteredProducts = useMemo(() => products.filter(item => (
    (!q || includes(item, [x => x.name, x => x.category, x => x.room, x => x.storeName, x => x.moderationStatus], q))
    && filterByDate(item)
  )), [products, q, filterByDate]);

  const filteredIssues = useMemo(() => issues.filter(item => (
    (!q || includes(item, [x => x.title, x => x.description, x => x.status, x => x.priority, x => x.type], q))
    && filterByDate(item)
  )), [issues, q, filterByDate]);

  const selectedIds = selected[activeTab] || [];
  const toggleSelected = (id) => {
    setSelected(prev => {
      const current = new Set(prev[activeTab] || []);
      current.has(id) ? current.delete(id) : current.add(id);
      return { ...prev, [activeTab]: Array.from(current) };
    });
  };

  const openDetail = async (type, id) => {
    const endpoint = type === 'user'
      ? `/admin/users/${id}/detail`
      : type === 'seller'
        ? `/admin/sellers/${id}/detail`
        : `/admin/orders/${id}/detail`;
    setDrawer({ type, id });
    setDetail(null);
    setNoteText('');
    try {
      const response = await apiFetch(endpoint);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to load details');
      setDetail(data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load details');
      setDrawer(null);
    }
  };

  const refreshActivityAndAlerts = async () => {
    const [activityRes, alertsRes] = await Promise.all([apiFetch('/admin/activity'), apiFetch('/admin/alerts')]);
    setActivity(await readJson(activityRes, 'Failed to load activity'));
    setAlerts(await readJson(alertsRes, 'Failed to load alerts'));
  };

  const updateUser = async (target, patch) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/users/${target.id}`, { method: 'PUT', body: JSON.stringify(patch) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update user');
      setUsers(prev => prev.map(item => item.id === target.id ? { ...item, ...data.data } : item));
      toast.success('User updated');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async (target) => {
    if (!window.confirm(`Delete ${target.name || target.email || 'this user'}?`)) return;
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/users/${target.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete user');
      setUsers(prev => prev.filter(item => item.id !== target.id));
      toast.success('User deleted');
      await loadAdmin();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setBusy(false);
    }
  };

  const updateSellerStatus = async (target, status) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/sellers/${target.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update seller');
      setSellers(prev => prev.map(item => item.id === target.id ? data.data : item));
      toast.success('Seller updated');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to update seller');
    } finally {
      setBusy(false);
    }
  };

  const deleteSeller = async (target) => {
    if (!window.confirm(`Delete ${target.storeSetup?.name || target.legalBusinessName || 'this seller'}?`)) return;
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/sellers/${target.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete seller');
      setSellers(prev => prev.filter(item => item.id !== target.id));
      toast.success('Seller deleted');
      await loadAdmin();
    } catch (err) {
      toast.error(err.message || 'Failed to delete seller');
    } finally {
      setBusy(false);
    }
  };

  const updateOrderStatus = async (target, status) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/orders/${target.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update order');
      setOrders(prev => prev.map(item => item.id === target.id ? { ...item, ...data.data } : item));
      toast.success('Order updated');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setBusy(false);
    }
  };

  const updateProductModeration = async (target, status) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/products/${target.id}/moderation`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to moderate product');
      setProducts(prev => prev.map(item => item.id === target.id ? { ...item, ...data.data } : item));
      toast.success('Product updated');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to moderate product');
    } finally {
      setBusy(false);
    }
  };

  const updateIssue = async (target, patch) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/issues/${target.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update issue');
      setIssues(prev => prev.map(item => item.id === target.id ? data.data : item));
      toast.success('Issue updated');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to update issue');
    } finally {
      setBusy(false);
    }
  };

  const retryDelivery = async (target) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/delivery-monitor/${target.id}/retry`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to retry message');
      setDeliveryEvents(prev => prev.map(item => item.id === target.id ? data.data : item));
      toast.success('Message retried');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to retry message');
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!drawer || !noteText.trim()) return;
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/notes/${drawer.type}/${drawer.id}`, { method: 'POST', body: JSON.stringify({ body: noteText }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to add note');
      setDetail(prev => ({ ...prev, notes: [data.data, ...(prev?.notes || [])] }));
      setNoteText('');
      toast.success('Note added');
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to add note');
    } finally {
      setBusy(false);
    }
  };

  const bulkAction = async (target, action, value) => {
    const ids = selected[activeTab] || [];
    if (ids.length === 0) return toast.error('Select items first');
    setBusy(true);
    try {
      const response = await apiFetch('/admin/bulk', { method: 'POST', body: JSON.stringify({ target, action, value, ids }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Bulk action failed');
      setSelected(prev => ({ ...prev, [activeTab]: [] }));
      toast.success(`Updated ${data.data.count} items`);
      await loadAdmin();
    } catch (err) {
      toast.error(err.message || 'Bulk action failed');
    } finally {
      setBusy(false);
    }
  };

  const exportReport = async (type) => {
    try {
      const response = await apiFetch(`/admin/reports/${type}`);
      if (!response.ok) throw new Error('Report export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tsenga-${type}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${label(type)} report exported`);
      await refreshActivityAndAlerts();
    } catch (err) {
      toast.error(err.message || 'Report export failed');
    }
  };

  const goToResult = (hit) => {
    setGlobalSearch('');
    setGlobalResults([]);
    if (hit.type === 'user') {
      setActiveTab('Users');
      openDetail('user', hit.id);
    } else if (hit.type === 'seller') {
      setActiveTab('Sellers');
      openDetail('seller', hit.id);
    } else if (hit.type === 'order') {
      setActiveTab('Orders');
      openDetail('order', hit.id);
    } else if (hit.type === 'issue') {
      setActiveTab('Issues');
    } else {
      navigate(`/product/${hit.id}`);
    }
  };

  const renderOverview = () => {
    const byStatus = stats?.ordersByStatus || {};
    const byRole = stats?.usersByRole || {};
    return (
      <Grid>
        <Card>
          <PanelTitle>Orders by status</PanelTitle>
          <RowList>
            {Object.keys(byStatus).length === 0 ? <SecondaryText>No orders yet</SecondaryText> : Object.entries(byStatus).map(([status, count]) => (
              <InfoRow key={status}><Pill $tone={toneFor(status)}>{label(status)}</Pill><PrimaryText>{count}</PrimaryText></InfoRow>
            ))}
          </RowList>
        </Card>
        <Card>
          <PanelTitle>Users by role</PanelTitle>
          <RowList>
            {Object.entries(byRole).map(([role, count]) => (
              <InfoRow key={role}><Pill>{label(role)}</Pill><PrimaryText>{count}</PrimaryText></InfoRow>
            ))}
          </RowList>
        </Card>
        <Card>
          <PanelTitle>7 day performance</PanelTitle>
          <RowList>
            {(stats?.dailyOrders || []).map(day => (
              <InfoRow key={day.date}>
                <div><PrimaryText>{date(day.date)}</PrimaryText><SecondaryText>{day.orders} orders</SecondaryText></div>
                <PrimaryText>{money(day.revenue)}</PrimaryText>
              </InfoRow>
            ))}
          </RowList>
        </Card>
        <Card>
          <PanelTitle>Top stores</PanelTitle>
          <RowList>
            {(stats?.topStores || []).length === 0 ? <SecondaryText>No store performance yet</SecondaryText> : stats.topStores.map(store => (
              <InfoRow key={store.id}>
                <div><PrimaryText>{store.name}</PrimaryText><SecondaryText>{store.orders} orders</SecondaryText></div>
                <div style={{ textAlign: 'right' }}><PrimaryText>{money(store.revenue)}</PrimaryText><Pill $tone={toneFor(store.status)}>{label(store.status)}</Pill></div>
              </InfoRow>
            ))}
          </RowList>
        </Card>
        <Card>
          <PanelTitle>Recent orders</PanelTitle>
          <RowList>
            {(stats?.recentOrders || []).map(order => (
              <InfoRow key={order.id}>
                <button type="button" onClick={() => openDetail('order', order.id)} style={{ border: 0, background: 'transparent', textAlign: 'left', padding: 0, cursor: 'pointer' }}>
                  <PrimaryText>#{String(order.id).slice(0, 10)}</PrimaryText>
                  <SecondaryText>{date(order.createdAt)} | {order.itemCount || 0} items</SecondaryText>
                </button>
                <div style={{ textAlign: 'right' }}><PrimaryText>{money(order.total)}</PrimaryText><Pill $tone={toneFor(order.status)}>{label(order.status)}</Pill></div>
              </InfoRow>
            ))}
          </RowList>
        </Card>
        <Card>
          <PanelTitle>Recent sign-ups</PanelTitle>
          <RowList>
            {(stats?.recentUsers || []).map(newUser => (
              <InfoRow key={newUser.id}>
                <button type="button" onClick={() => openDetail('user', newUser.id)} style={{ border: 0, background: 'transparent', textAlign: 'left', padding: 0, cursor: 'pointer' }}>
                  <PrimaryText>{newUser.name || newUser.email}</PrimaryText>
                  <SecondaryText>{newUser.email || 'No email'} | {date(newUser.createdAt)}</SecondaryText>
                </button>
                <Pill>{label(newUser.role)}</Pill>
              </InfoRow>
            ))}
          </RowList>
        </Card>
      </Grid>
    );
  };

  const renderFilters = () => (
    <FilterBar>
      <Search value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter this table..." />
      <Select value={filters.dateRange} onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}>
        <option value="all">All dates</option>
        <option value="today">Today</option>
        <option value="week">7 days</option>
        <option value="month">30 days</option>
      </Select>
      {activeTab === 'Users' && (
        <>
          <Select value={filters.role} onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}>
            <option value="all">All roles</option>
            {userRoles.map(role => <option key={role} value={role}>{label(role)}</option>)}
          </Select>
          <Select value={filters.userStatus} onChange={e => setFilters(prev => ({ ...prev, userStatus: e.target.value }))}>
            <option value="all">All statuses</option>
            {userStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}
          </Select>
        </>
      )}
      {activeTab === 'Sellers' && (
        <Select value={filters.sellerStatus} onChange={e => setFilters(prev => ({ ...prev, sellerStatus: e.target.value }))}>
          <option value="all">All statuses</option>
          {sellerStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}
        </Select>
      )}
      {activeTab === 'Orders' && (
        <Select value={filters.orderStatus} onChange={e => setFilters(prev => ({ ...prev, orderStatus: e.target.value }))}>
          <option value="all">All statuses</option>
          {orderStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}
        </Select>
      )}
    </FilterBar>
  );

  const renderUsers = () => (
    <>
    {renderBulkBar('users', 'status', ['active', 'suspended'])}
    <TableWrap>
      <Table>
        <thead><tr><Th></Th><Th>User</Th><Th>Contact</Th><Th>Role</Th><Th>Status</Th><Th>Verified</Th><Th>Joined</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {filteredUsers.map(item => (
            <tr key={item.id}>
              <Td><input type="checkbox" checked={selectedIds.includes(item.id)} disabled={item.id === user?.id} onChange={() => toggleSelected(item.id)} /></Td>
              <Td><PrimaryText>{item.name || 'Unnamed user'}</PrimaryText><SecondaryText>ID {item.id}</SecondaryText></Td>
              <Td>{item.email || 'No email'}<SecondaryText>{item.mobile || 'No mobile'}</SecondaryText></Td>
              <Td><Select value={item.role || 'buyer'} disabled={busy || item.id === user?.id || !can('users:update')} onChange={e => updateUser(item, { role: e.target.value })}>{userRoles.map(role => <option key={role} value={role}>{label(role)}</option>)}</Select></Td>
              <Td><Select value={item.status || 'active'} disabled={busy || !can('users:update')} onChange={e => updateUser(item, { status: e.target.value })}>{userStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</Select></Td>
              <Td><Pill $tone={item.emailVerified ? 'success' : 'warning'}>{item.emailVerified ? 'Verified' : 'Pending'}</Pill></Td>
              <Td>{date(item.createdAt)}</Td>
              <Td><Actions><ActionButton onClick={() => openDetail('user', item.id)}>Details</ActionButton><ActionButton $danger disabled={busy || item.id === user?.id || !can('users:delete')} onClick={() => deleteUser(item)}>Delete</ActionButton></Actions></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
    </>
  );

  const renderSellers = () => (
    <>
    {renderBulkBar('sellers', 'status', ['approved', 'suspended'])}
    <TableWrap>
      <Table>
        <thead><tr><Th></Th><Th>Store</Th><Th>Contact</Th><Th>Area</Th><Th>Status</Th><Th>Quality</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {filteredSellers.map(item => (
            <tr key={item.id}>
              <Td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelected(item.id)} /></Td>
              <Td><PrimaryText>{item.storeSetup?.name || item.legalBusinessName || 'Seller store'}</PrimaryText><SecondaryText>ID {item.id}</SecondaryText></Td>
              <Td>{item.email || 'No email'}<SecondaryText>{item.phone || item.whatsappNumber || 'No phone'}</SecondaryText></Td>
              <Td>{item.address?.city || item.address?.suburb || 'Unknown'}</Td>
              <Td><Select value={item.onboardingStatus || 'draft'} disabled={busy || !can('sellers:update')} onChange={e => updateSellerStatus(item, e.target.value)}>{sellerStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</Select></Td>
              <Td><Pill>{Number(item.qualityScore || 0)}</Pill></Td>
              <Td><Actions><ActionButton onClick={() => openDetail('seller', item.id)}>Review</ActionButton><ActionButton onClick={() => navigate(`/store/${item.id}`)}>Store</ActionButton><ActionButton $danger disabled={busy || !can('sellers:delete')} onClick={() => deleteSeller(item)}>Delete</ActionButton></Actions></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
    </>
  );

  const renderOrders = () => (
    <>
    {renderBulkBar('orders', 'status', ['processing', 'out_for_delivery', 'delivered', 'cancelled'])}
    <TableWrap>
      <Table>
        <thead><tr><Th></Th><Th>Order</Th><Th>User</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {filteredOrders.map(item => (
            <tr key={item.id}>
              <Td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelected(item.id)} /></Td>
              <Td><PrimaryText>#{String(item.id).slice(0, 10)}</PrimaryText></Td>
              <Td>{item.userId || 'default'}</Td>
              <Td>{item.itemCount ?? (item.items || []).length}</Td>
              <Td>{money(item.total || item.totals?.total)}</Td>
              <Td><Select value={item.status || 'pending'} disabled={busy || !can('orders:update')} onChange={e => updateOrderStatus(item, e.target.value)}>{orderStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</Select></Td>
              <Td>{date(item.createdAt)}</Td>
              <Td><Actions><ActionButton onClick={() => openDetail('order', item.id)}>Inspect</ActionButton><ActionButton onClick={() => navigate(`/orders/${item.id}`)}>Open</ActionButton></Actions></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
    </>
  );

  const renderBulkBar = (target, action, options) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
      <Pill>{selectedIds.length} selected</Pill>
      {options.map(option => (
        <ActionButton key={option} disabled={busy || selectedIds.length === 0} onClick={() => bulkAction(target, action, option)}>
          Set {label(option)}
        </ActionButton>
      ))}
    </div>
  );

  const renderProducts = () => (
    <>
      {renderBulkBar('products', 'moderation', ['approved', 'hidden', 'featured'])}
      <TableWrap>
        <Table>
          <thead><tr><Th></Th><Th>Product</Th><Th>Store</Th><Th>Stock</Th><Th>Price</Th><Th>Moderation</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {filteredProducts.slice(0, 120).map(item => (
              <tr key={item.id}>
                <Td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelected(item.id)} /></Td>
                <Td><PrimaryText>{item.name || 'Product'}</PrimaryText><SecondaryText>ID {item.id} | {item.category || item.room || 'Furniture'}</SecondaryText></Td>
                <Td>{item.storeName || `Store ${item.storeId || ''}`}</Td>
                <Td><Pill $tone={item.stock === 'out' ? 'danger' : item.stock === 'low' ? 'warning' : 'success'}>{item.stock || 'in'}</Pill><SecondaryText>{item.stockQuantity ?? 'No qty'} units</SecondaryText></Td>
                <Td>{money(item.discountPrice || item.price)}</Td>
                <Td><Select value={item.moderationStatus || 'approved'} disabled={busy || !can('products:moderate')} onChange={e => updateProductModeration(item, e.target.value)}>{productStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</Select></Td>
                <Td><Actions><ActionButton onClick={() => navigate(`/product/${item.id}`)}>Open</ActionButton></Actions></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );

  const renderIssues = () => (
    <TableWrap>
      <Table>
        <thead><tr><Th>Issue</Th><Th>Priority</Th><Th>Status</Th><Th>Related</Th><Th>Updated</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {filteredIssues.map(item => (
            <tr key={item.id}>
              <Td><PrimaryText>{item.title}</PrimaryText><SecondaryText>{item.description || item.type}</SecondaryText></Td>
              <Td><Select value={item.priority || 'medium'} disabled={busy || !can('issues:update')} onChange={e => updateIssue(item, { priority: e.target.value })}>{issuePriorities.map(priority => <option key={priority} value={priority}>{label(priority)}</option>)}</Select></Td>
              <Td><Select value={item.status || 'open'} disabled={busy || !can('issues:update')} onChange={e => updateIssue(item, { status: e.target.value })}>{issueStatuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</Select></Td>
              <Td>{item.orderId ? `Order #${item.orderId}` : item.productId ? `Product ${item.productId}` : item.sellerId ? `Seller ${item.sellerId}` : 'General'}</Td>
              <Td>{date(item.updatedAt)}</Td>
              <Td><Actions>{item.orderId && <ActionButton onClick={() => openDetail('order', item.orderId)}>Order</ActionButton>}{item.productId && <ActionButton onClick={() => navigate(`/product/${item.productId}`)}>Product</ActionButton>}</Actions></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );

  const renderFinance = () => (
    <Grid>
      <Card><PanelTitle>Gross revenue</PanelTitle><StatValue>{money(finance?.grossRevenue)}</StatValue><SecondaryText>Total seller-linked order value</SecondaryText></Card>
      <Card><PanelTitle>Platform fees</PanelTitle><StatValue>{money(finance?.platformFees)}</StatValue><SecondaryText>{Math.round((finance?.commissionRate || 0) * 100)}% estimated commission</SecondaryText></Card>
      <Card><PanelTitle>Seller payouts</PanelTitle><StatValue>{money(finance?.estimatedPayouts)}</StatValue><SecondaryText>Estimated amount payable to sellers</SecondaryText></Card>
      <Card><PanelTitle>Finance report</PanelTitle><SecondaryText>Export order data for reconciliation.</SecondaryText><div style={{ marginTop: 12 }}><Button onClick={() => exportReport('orders')}>Export Orders</Button></div></Card>
      <Card style={{ gridColumn: '1 / -1' }}>
        <PanelTitle>Seller payout view</PanelTitle>
        <RowList>{(finance?.rows || []).map(row => <InfoRow key={row.sellerId}><div><PrimaryText>{row.storeName}</PrimaryText><SecondaryText>{row.orderCount} orders | commission {money(row.commission)}</SecondaryText></div><div style={{ textAlign: 'right' }}><PrimaryText>{money(row.estimatedPayout)}</PrimaryText><Pill $tone={row.status === 'payable' ? 'success' : 'warning'}>{label(row.status)}</Pill></div></InfoRow>)}</RowList>
      </Card>
    </Grid>
  );

  const renderDelivery = () => (
    <TableWrap>
      <Table>
        <thead><tr><Th>Message</Th><Th>Recipient</Th><Th>Channel</Th><Th>Status</Th><Th>Attempts</Th><Th>Updated</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {deliveryEvents.map(item => (
            <tr key={item.id}>
              <Td><PrimaryText>{item.subject}</PrimaryText><SecondaryText>{item.provider}{item.lastError ? ` | ${item.lastError}` : ''}</SecondaryText></Td>
              <Td>{item.recipient}</Td>
              <Td><Pill>{label(item.channel)}</Pill></Td>
              <Td><Pill $tone={toneFor(item.status === 'delivered' ? 'success' : item.status === 'failed' || item.status === 'rejected' ? 'danger' : 'warning')}>{label(item.status)}</Pill></Td>
              <Td>{item.attempts}</Td>
              <Td>{date(item.updatedAt)}</Td>
              <Td><ActionButton disabled={busy} onClick={() => retryDelivery(item)}>Retry</ActionButton></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );

  const renderAlerts = () => (
    <Grid>
      {alerts.length === 0 ? <Card><PanelTitle>No active alerts</PanelTitle><SecondaryText>Operations are calm right now.</SecondaryText></Card> : alerts.map(alert => (
        <Card key={alert.id}>
          <InfoRow>
            <div>
              <Pill $tone={toneFor(alert.tone)}>{label(alert.tone)}</Pill>
              <PrimaryText style={{ marginTop: 10 }}>{alert.title}</PrimaryText>
              <SecondaryText>{alert.message}</SecondaryText>
            </div>
            <ActionButton onClick={() => {
              if (alert.targetType === 'seller') openDetail('seller', alert.targetId);
              if (alert.targetType === 'order') openDetail('order', alert.targetId);
              if (alert.targetType === 'product') navigate(`/product/${alert.targetId}`);
              if (alert.targetType === 'issue') setActiveTab('Issues');
              if (alert.targetType === 'delivery') setActiveTab('Delivery');
            }}>{alert.action}</ActionButton>
          </InfoRow>
        </Card>
      ))}
    </Grid>
  );

  const renderActivity = () => (
    <Card>
      <RowList>
        {activity.length === 0 ? <SecondaryText>No admin activity yet.</SecondaryText> : activity.map(item => (
          <InfoRow key={item.id}>
            <div>
              <PrimaryText>{item.summary}</PrimaryText>
              <SecondaryText>{label(item.action)} by {item.actorName || 'Admin'} | {date(item.createdAt)}</SecondaryText>
            </div>
            <Pill>{label(item.targetType)}</Pill>
          </InfoRow>
        ))}
      </RowList>
    </Card>
  );

  const renderReports = () => (
    <Grid>
      {['users', 'sellers', 'orders'].map(type => (
        <Card key={type}>
          <PanelTitle>{label(type)} report</PanelTitle>
          <SecondaryText>Export clean CSV data for operations, support, and weekly reporting.</SecondaryText>
          <div style={{ marginTop: 14 }}>
            <Button disabled={!can('reports:export')} onClick={() => exportReport(type)}>Export {label(type)}</Button>
          </div>
        </Card>
      ))}
      <Card>
        <PanelTitle>Admin permissions</PanelTitle>
        <SecondaryText>Current role: {label(permissions?.role || 'admin')}</SecondaryText>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {(permissions?.permissions || []).map(permission => <Pill key={permission}>{permission}</Pill>)}
        </div>
      </Card>
    </Grid>
  );

  const renderDrawer = () => {
    if (!drawer) return null;
    return (
      <DrawerBackdrop onClick={() => setDrawer(null)}>
        <Drawer onClick={event => event.stopPropagation()}>
          <DrawerHead>
            <DrawerTitle>{label(drawer.type)} details</DrawerTitle>
            <ActionButton onClick={() => setDrawer(null)}>Close</ActionButton>
          </DrawerHead>
          {!detail ? (
            <SecondaryText>Loading details...</SecondaryText>
          ) : drawer.type === 'user' ? (
            <>
              <DetailGrid>
                <DetailBox><Tiny>Name</Tiny><PrimaryText>{detail.user?.name || 'Unnamed user'}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Email</Tiny><PrimaryText>{detail.user?.email || 'No email'}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Total spent</Tiny><PrimaryText>{money(detail.summary?.totalSpent)}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Orders</Tiny><PrimaryText>{detail.summary?.orderCount || 0}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Vouchers</Tiny><PrimaryText>{detail.summary?.activeVoucherCount || 0} active</PrimaryText></DetailBox>
                <DetailBox><Tiny>Reviews</Tiny><PrimaryText>{detail.summary?.reviewCount || 0}</PrimaryText></DetailBox>
              </DetailGrid>
              <Card style={{ marginTop: 14 }}><PanelTitle>Recent orders</PanelTitle><RowList>{(detail.orders || []).slice(0, 5).map(order => <InfoRow key={order.id}><PrimaryText>#{order.id}</PrimaryText><Pill $tone={toneFor(order.status)}>{label(order.status)}</Pill></InfoRow>)}</RowList></Card>
            </>
          ) : drawer.type === 'seller' ? (
            <>
              <DetailGrid>
                <DetailBox><Tiny>Store</Tiny><PrimaryText>{detail.seller?.storeSetup?.name || detail.seller?.legalBusinessName}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Status</Tiny><Pill $tone={toneFor(detail.seller?.onboardingStatus)}>{label(detail.seller?.onboardingStatus)}</Pill></DetailBox>
                <DetailBox><Tiny>Products</Tiny><PrimaryText>{detail.summary?.productCount || 0}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Revenue</Tiny><PrimaryText>{money(detail.summary?.revenue)}</PrimaryText></DetailBox>
                <DetailBox><Tiny>WhatsApp</Tiny><PrimaryText>{detail.seller?.storeBasicInfo?.storePhone || detail.seller?.phone || 'Not set'}</PrimaryText></DetailBox>
                <DetailBox><Tiny>City</Tiny><PrimaryText>{detail.seller?.address?.city || 'Unknown'}</PrimaryText></DetailBox>
              </DetailGrid>
              <Card style={{ marginTop: 14 }}><PanelTitle>Application notes</PanelTitle><SecondaryText>{detail.seller?.applicationProfile?.notes || 'No notes added.'}</SecondaryText></Card>
            </>
          ) : (
            <>
              <DetailGrid>
                <DetailBox><Tiny>Order</Tiny><PrimaryText>#{detail.order?.id}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Total</Tiny><PrimaryText>{money(detail.order?.total || detail.order?.totals?.total)}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Status</Tiny><Pill $tone={toneFor(detail.order?.status)}>{label(detail.order?.status)}</Pill></DetailBox>
                <DetailBox><Tiny>Items</Tiny><PrimaryText>{detail.order?.itemCount || 0}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Customer</Tiny><PrimaryText>{detail.user?.name || detail.order?.contactInfo?.name || 'Guest'}</PrimaryText></DetailBox>
                <DetailBox><Tiny>Phone</Tiny><PrimaryText>{detail.order?.contactInfo?.phone || 'Not provided'}</PrimaryText></DetailBox>
              </DetailGrid>
              <Card style={{ marginTop: 14 }}>
                <PanelTitle>Timeline</PanelTitle>
                <RowList>{(detail.timeline || []).map(item => <InfoRow key={item.label}><PrimaryText>{item.label}</PrimaryText><Pill $tone={item.done ? 'success' : 'warning'}>{item.done ? date(item.at) : 'Waiting'}</Pill></InfoRow>)}</RowList>
              </Card>
              <Card style={{ marginTop: 14 }}>
                <PanelTitle>WhatsApp handoff</PanelTitle>
                <RowList>{(detail.order?.whatsappHandoff || []).map(handoff => <InfoRow key={handoff.storeId}><PrimaryText>{handoff.storeName}</PrimaryText>{handoff.href ? <ActionButton onClick={() => window.open(handoff.href, '_blank', 'noopener,noreferrer')}>WhatsApp</ActionButton> : <Pill $tone="warning">No number</Pill>}</InfoRow>)}</RowList>
              </Card>
            </>
          )}
          {detail && (
            <Card style={{ marginTop: 14 }}>
              <PanelTitle>Internal notes</PanelTitle>
              <RowList>
                {(detail.notes || []).length === 0 ? <SecondaryText>No admin notes yet.</SecondaryText> : detail.notes.map(note => (
                  <InfoRow key={note.id}>
                    <div><PrimaryText>{note.body}</PrimaryText><SecondaryText>{note.actorName || 'Admin'} | {date(note.createdAt)}</SecondaryText></div>
                  </InfoRow>
                ))}
              </RowList>
              <textarea
                value={noteText}
                onChange={event => setNoteText(event.target.value)}
                placeholder="Add an internal note..."
                style={{ width: '100%', minHeight: 92, marginTop: 12, border: '1px solid rgba(228,231,236,0.95)', borderRadius: 16, padding: 12, fontWeight: 700 }}
              />
              <div style={{ marginTop: 10 }}>
                <Button disabled={busy || !noteText.trim()} onClick={addNote}>Add note</Button>
              </div>
            </Card>
          )}
        </Drawer>
      </DrawerBackdrop>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === 'Overview') return renderOverview();
    if (activeTab === 'Users') return renderUsers();
    if (activeTab === 'Sellers') return renderSellers();
    if (activeTab === 'Orders') return renderOrders();
    if (activeTab === 'Products') return renderProducts();
    if (activeTab === 'Issues') return renderIssues();
    if (activeTab === 'Finance') return renderFinance();
    if (activeTab === 'Delivery') return renderDelivery();
    if (activeTab === 'Alerts') return renderAlerts();
    if (activeTab === 'Activity') return renderActivity();
    if (activeTab === 'Geo') return <GeoTab />;
    return renderReports();
  };

  if (loading) {
    return (
      <Page><TopNavigation /><Main><StatePanel><div><PanelTitle>Loading admin dashboard</PanelTitle><SecondaryText>Preparing the operations console...</SecondaryText></div></StatePanel></Main><BottomNavigation currentPath="/admin" /></Page>
    );
  }

  if (error) {
    return (
      <Page><TopNavigation /><Main><StatePanel><div><PanelTitle>Admin dashboard could not load</PanelTitle><SecondaryText>{error}</SecondaryText><div style={{ marginTop: 14 }}><Button onClick={loadAdmin}>Try again</Button></div></div></StatePanel></Main><BottomNavigation currentPath="/admin" /></Page>
    );
  }

  const tabCounts = {
    Users: users.length,
    Sellers: sellers.length,
    Orders: orders.length,
    Products: products.length,
    Issues: issues.filter(issue => !['resolved', 'closed'].includes(issue.status)).length,
    Delivery: deliveryEvents.filter(event => ['failed', 'rejected', 'queued'].includes(event.status)).length,
    Alerts: alerts.length,
    Activity: activity.length,
  };

  return (
    <Page>
      <TopNavigation />
      <Hero>
        <HeroInner>
          <HeroTop>
            <BackButton type="button" onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <TitleBlock>
              <Eyebrow>Shopply operations</Eyebrow>
              <Title>Admin Dashboard</Title>
            </TitleBlock>
            <HeaderActions>
              <Button $ghost onClick={() => setActiveTab('Alerts')}>{alerts.length} alerts</Button>
              <Button onClick={loadAdmin} disabled={busy}>Refresh</Button>
            </HeaderActions>
          </HeroTop>
          <StatGrid>{statCards.map(stat => <Stat key={stat.label}><StatValue>{stat.value}</StatValue><StatLabel>{stat.label}</StatLabel></Stat>)}</StatGrid>
          <SearchShell>
            <Search value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Search users, sellers, orders, products..." />
            <Pill>{label(permissions?.role || 'admin')}</Pill>
          </SearchShell>
          {globalResults.length > 0 && (
            <SearchResults>{globalResults.map(hit => <SearchHit key={`${hit.type}-${hit.id}`} onClick={() => goToResult(hit)}><Pill>{label(hit.type)}</Pill><div><PrimaryText>{hit.title}</PrimaryText><SecondaryText>{hit.subtitle}</SecondaryText></div><Tiny>Open</Tiny></SearchHit>)}</SearchResults>
          )}
          <Tabs>
            {tabs.map(tab => <Tab key={tab} $active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}{tabCounts[tab] !== undefined && <Count $active={activeTab === tab}>{tabCounts[tab]}</Count>}</Tab>)}
          </Tabs>
        </HeroInner>
      </Hero>

      <Main>
        <Panel>
          <PanelHeader>
            <PanelTitle>{activeTab}</PanelTitle>
            {['Users', 'Sellers', 'Orders', 'Products', 'Issues'].includes(activeTab) && renderFilters()}
          </PanelHeader>
          {renderActiveTab()}
        </Panel>
      </Main>
      {renderDrawer()}
      <BottomNavigation currentPath="/admin" />
    </Page>
  );
}
