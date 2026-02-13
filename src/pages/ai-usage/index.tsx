import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from 'components/@extended/Tooltip';

import { listAiUsage } from 'api/aiUsage';
import { searchUsers } from 'api/users';
import type { UserBasic } from 'api/users';
import { AiUsageRecord } from 'types/ai-usage';
import { openSnackbar } from 'api/snackbar';

// Funções auxiliares para formatação
function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR');
}

export default function AiUsagePage() {
  const [items, setItems] = useState<AiUsageRecord[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Autocomplete de usuário
  const [userOptions, setUserOptions] = useState<UserBasic[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBasic | null>(null);

  // Filtros
  const [model, setModel] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [kind, setKind] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Estatísticas
  const [totalCostUsd, setTotalCostUsd] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPromptTokens, setTotalPromptTokens] = useState(0);
  const [totalCompletionTokens, setTotalCompletionTokens] = useState(0);
  const [totalCachedTokens, setTotalCachedTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  // Responsividade
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  async function load() {
    try {
      setLoading(true);
      const res = await listAiUsage({
        model: model || undefined,
        userId: userId || undefined,
        kind: kind || undefined,
        limit,
        offset: page * limit,
        from: fromDate || undefined,
        to: toDate || undefined,
        order
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalCostUsd(res.totalCostUsd);
      setTotalCalls(res.calls);
      setTotalPromptTokens(res.promptTokens);
      setTotalCompletionTokens(res.completionTokens);
      setTotalCachedTokens(res.cachedTokens);
      setTotalTokens(res.totalTokens);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao carregar dados de uso de IA',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    const query = userSearch.trim();

    if (query.length < 2) {
      setUserOptions([]);
      return () => {
        active = false;
      };
    }

    const handle = setTimeout(async () => {
      try {
        setUserLoading(true);
        const res = await searchUsers({ search: query, page: 1, limit: 20 });
        const rows = res?.data || [];

        const options: UserBasic[] = rows.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ?? null,
          avatarFileId: u.avatarFileId ?? null
        }));

        if (active) setUserOptions(options);
      } catch {
        if (active) setUserOptions([]);
      } finally {
        if (active) setUserLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [userSearch]);

  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
    }
  }, [userId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, model, userId, kind, fromDate, toDate, order]);

  // Componente de card para mobile
  const UsageCard = ({ record }: { record: AiUsageRecord }) => (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
      <CardContent sx={{ p: isSmallMobile ? 1.5 : 2 }}>
        <Stack spacing={1.5}>
          {/* Cabeçalho do card */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {record.model}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {record.userName || record.userId || '—'}
              </Typography>
            </Box>
            <Chip label={formatCurrency(record.costUsd)} size="small" color="primary" />
          </Stack>

          {/* Informações do registro */}
          <Stack spacing={isSmallMobile ? 0.5 : 1}>
            <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 70 : 90 }}>
                Tipo:
              </Typography>
              <Chip label={record.kind} size="small" variant="outlined" />
            </Stack>

            {record.callName && (
              <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 70 : 90 }}>
                  Chamada:
                </Typography>
                <Typography variant="body2">{record.callName}</Typography>
              </Stack>
            )}

            <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 70 : 90 }}>
                Tokens:
              </Typography>
              <Typography variant="body2">
                {formatNumber(record.totalTokens)} total
                {record.promptTokens !== undefined && (
                  <span>
                    {' '}
                    ({formatNumber(record.promptTokens)} prompt + {formatNumber(record.completionTokens)} completion)
                  </span>
                )}
              </Typography>
            </Stack>
          </Stack>

          {/* Data de criação */}
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(record.createdAt)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Uso da IA" contentSX={{ p: 0 }}>
          {/* Estatísticas gerais */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Total de Chamadas
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatNumber(totalCalls)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Custo Total
                </Typography>
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  {formatCurrency(totalCostUsd)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Tokens (Prompt)
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatNumber(totalPromptTokens)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Tokens (Completion)
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatNumber(totalCompletionTokens)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Tokens (Cache)
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatNumber(totalCachedTokens)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Total de Tokens
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatNumber(totalTokens)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Filtros */}
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 2 : 1.5}
            sx={{ p: 2, pb: 1 }}
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            <TextField
              label="Modelo"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setPage(0);
              }}
              placeholder="Ex: gpt-4, gpt-3.5-turbo"
              sx={{ minWidth: isMobile ? '100%' : 200 }}
              size="small"
            />

            <Autocomplete
              options={userOptions}
              value={selectedUser}
              loading={userLoading}
              size="small"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? '100%' : 280 }}
              filterOptions={(x) => x}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              getOptionLabel={(opt) => (opt?.name ? `${opt.name}${opt.email ? ` (${opt.email})` : ''}` : opt?.id || '')}
              onChange={(_, val) => {
                setSelectedUser(val);
                setUserId(val?.id ?? '');
                setPage(0);
              }}
              onInputChange={(_, val, reason) => {
                if (reason === 'input') setUserSearch(val);
                if (reason === 'clear') {
                  setUserSearch('');
                  setSelectedUser(null);
                  setUserId('');
                  setPage(0);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuário"
                  placeholder="Digite ao menos 2 letras (nome ou e-mail)"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {userLoading ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />

            <TextField
              label="Tipo"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setPage(0);
              }}
              placeholder="Ex: chat.completions"
              sx={{ minWidth: isMobile ? '100%' : 200 }}
              size="small"
            />

            <TextField
              label="Data Inicial"
              type="datetime-local"
              value={fromDate ? new Date(fromDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                setFromDate(e.target.value ? new Date(e.target.value).toISOString() : '');
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: isMobile ? '100%' : 200 }}
              size="small"
            />

            <TextField
              label="Data Final"
              type="datetime-local"
              value={toDate ? new Date(toDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                setToDate(e.target.value ? new Date(e.target.value).toISOString() : '');
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: isMobile ? '100%' : 200 }}
              size="small"
            />

            <TextField
              select
              label="Ordenação"
              value={order}
              onChange={(e) => {
                setOrder(e.target.value as 'asc' | 'desc');
                setPage(0);
              }}
              sx={{ minWidth: isMobile ? '100%' : 150 }}
              size="small"
            >
              <MenuItem value="desc">Mais recentes</MenuItem>
              <MenuItem value="asc">Mais antigos</MenuItem>
            </TextField>

            <Tooltip title="Recarregar">
              <IconButton onClick={load} disabled={loading}>
                <ReloadOutlined />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider />

          {/* Conteúdo responsivo */}
          {loading && items.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            // Layout de cards para mobile
            <Box sx={{ p: 2 }}>
              {items.map((record) => (
                <UsageCard key={record.id} record={record} />
              ))}

              {!items.length && (
                <Stack alignItems="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum registro encontrado.
                  </Typography>
                </Stack>
              )}
            </Box>
          ) : (
            // Layout de tabela para desktop
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Chamada</TableCell>
                    <TableCell align="right">Tokens (Prompt)</TableCell>
                    <TableCell align="right">Tokens (Completion)</TableCell>
                    <TableCell align="right">Tokens (Cache)</TableCell>
                    <TableCell align="right">Total Tokens</TableCell>
                    <TableCell align="right">Custo (USD)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatDateTime(record.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={record.model} size="small" />
                      </TableCell>
                      <TableCell>{record.userName || record.userId || '—'}</TableCell>
                      <TableCell>
                        <Chip label={record.kind} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{record.callName || '—'}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatNumber(record.promptTokens)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatNumber(record.completionTokens)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatNumber(record.cachedTokens)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {formatNumber(record.totalTokens)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(record.costUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <Stack alignItems="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhum registro encontrado.
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider />

          {/* Paginação responsiva */}
          <Stack
            direction="row"
            justifyContent="center"
            sx={{
              p: isMobile ? 1 : 2,
              '& .MuiTablePagination-root': {
                margin: 0
              }
            }}
          >
            <TablePagination
              component="div"
              rowsPerPageOptions={isMobile ? [10, 25, 50] : [10, 25, 50, 100, 500]}
              count={total}
              rowsPerPage={limit}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage={isMobile ? 'Por página' : 'Linhas por página'}
              labelDisplayedRows={
                isMobile
                  ? ({ from, to, count }) => `${from}-${to} de ${count}`
                  : ({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
