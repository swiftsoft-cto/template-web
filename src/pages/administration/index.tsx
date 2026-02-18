import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import AIIcon from 'components/icons/AIIcon';

import { listRules } from 'api/rules';
import { listRoles } from 'api/roles';
import type { RuleItem } from 'types/rules';
import type { RoleRow } from 'types/roles';
import { openSnackbar } from 'api/snackbar';
import CustomersList from 'sections/customers/CustomersList';
import AiUsagePage from 'pages/ai-usage';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

// ==============================|| ADMINISTRATION - FUNÇÕES (ROLES + TODAS AS REGRAS) ||============================== //

function RolesSection() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listRoles({ limit: 100 })
      .then((res) => setRoles(res.data ?? []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainCard title="Funções (cargos)" contentSX={{ p: 0 }} sx={{ mb: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {r.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {r.description ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Link component={RouterLink} to="/roles" variant="body2">
                      Gerenciar regras
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {!roles.length && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Nenhum cargo cadastrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}

function AllRulesSection() {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await listRules({ search: search || undefined });
      setRules(data);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao carregar regras',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [search]);

  return (
    <MainCard title="Todas as regras" contentSX={{ p: 0 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nome, descrição ou módulo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            )
          }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Módulo</TableCell>
                <TableCell>Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {r.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.moduleName || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {r.description || '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {!rules.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      Nenhuma regra encontrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}

function FunctionsTab() {
  const intl = useIntl();
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {intl.formatMessage({ id: 'administration-functions' })}: cargos (roles) e lista completa de regras do sistema.
      </Typography>
      <RolesSection />
      <AllRulesSection />
    </Box>
  );
}

// ==============================|| ADMINISTRATION - CLIENTES ||============================== //

function ClientsTab() {
  return (
    <Box sx={{ mt: 0 }}>
      <CustomersList />
    </Box>
  );
}

// ==============================|| ADMINISTRATION - USO DA IA ||============================== //

function AiUsageTab() {
  return (
    <Box sx={{ mt: 0 }}>
      <AiUsagePage />
    </Box>
  );
}

// ==============================|| ADMINISTRATION PAGE ||============================== //

type TabId = 'functions' | 'clients' | 'ai-usage';

export default function AdministrationPage() {
  const intl = useIntl();
  const [tab, setTab] = useState<TabId>('functions');

  const tabLabel = (id: TabId) => {
    switch (id) {
      case 'functions':
        return intl.formatMessage({ id: 'administration-functions' });
      case 'clients':
        return intl.formatMessage({ id: 'customer' });
      case 'ai-usage':
        return intl.formatMessage({ id: 'ai-usage' });
      default:
        return id;
    }
  };

  const tabIcon = (id: TabId) => {
    switch (id) {
      case 'functions':
        return <SafetyOutlined />;
      case 'clients':
        return <UserOutlined />;
      case 'ai-usage':
        return <AIIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <MainCard title={intl.formatMessage({ id: 'administration' })}>
        <Tabs
          value={tab}
          onChange={(_, v: TabId) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab value="functions" label={tabLabel('functions')} icon={tabIcon('functions')} iconPosition="start" />
          <Tab value="clients" label={tabLabel('clients')} icon={tabIcon('clients')} iconPosition="start" />
          <Tab value="ai-usage" label={tabLabel('ai-usage')} icon={tabIcon('ai-usage')} iconPosition="start" />
        </Tabs>

        {tab === 'functions' && <FunctionsTab />}
        {tab === 'clients' && <ClientsTab />}
        {tab === 'ai-usage' && <AiUsageTab />}
      </MainCard>
    </Box>
  );
}
