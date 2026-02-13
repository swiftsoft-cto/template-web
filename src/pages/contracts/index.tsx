import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Tooltip from 'components/@extended/Tooltip';
import MainCard from 'components/MainCard';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';

import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import FilePdfOutlined from '@ant-design/icons/FilePdfOutlined';

import { listContracts, deleteContract, exportContractToPdf } from 'api/contracts';
import { Contract, ContractStatus } from 'types/contracts';
import { openSnackbar } from 'api/snackbar';
import { useNavigate } from 'react-router-dom';

import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog';
import Permission from 'components/Permission';
import { triggerBrowserDownload, formatContractFilename } from 'utils/download';

const STATUS_OPTIONS: { value: ContractStatus | ''; label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }[] = [
  { value: '', label: 'Todos', color: 'default' },
  { value: 'draft', label: 'Rascunho', color: 'default' },
  { value: 'final', label: 'Final', color: 'success' },
  { value: 'signed', label: 'Assinado', color: 'primary' },
  { value: 'canceled', label: 'Cancelado', color: 'error' }
];

const STATUS_COLORS: Record<ContractStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  final: 'success',
  signed: 'primary',
  canceled: 'error'
};

const STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Rascunho',
  final: 'Final',
  signed: 'Assinado',
  canceled: 'Cancelado'
};

export default function ContractsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Contract[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  async function load() {
    try {
      setLoading(true);
      const res = await listContracts({
        page: page + 1,
        limit,
        status: statusFilter || undefined,
        orderBy: 'createdAt',
        order: 'desc'
      });
      setItems(res.data);
      setTotal(res.pagination.total);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao carregar contratos',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter]);

  const requestDelete = (contract: Contract) => {
    setDeleteTarget({ id: contract.id, name: contract.title || `Contrato #${contract.id.slice(0, 8)}` });
    setDeleteOpen(true);
  };

  const openCreate = () => {
    navigate('/contracts/new');
  };

  const openEdit = (id: string) => {
    navigate(`/contracts/${id}/edit`);
  };

  const openView = (id: string) => {
    navigate(`/contracts/${id}`);
  };

  const downloadPdf = async (contract: Contract) => {
    try {
      setDownloadingId(contract.id);
      const { blob } = await exportContractToPdf(contract.id);
      const filename = formatContractFilename(contract.title, contract.customer?.displayName, 'pdf');
      triggerBrowserDownload(blob, filename);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao baixar PDF',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Contratos" contentSX={{ p: 0 }}>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 2 : 1.5}
            sx={{ p: 2, pb: 1 }}
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ContractStatus | '');
                setPage(0);
              }}
              sx={{ minWidth: isMobile ? '100%' : 200 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1}>
              <Permission rule="projects-management.contracts.create">
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
                  Novo Contrato
                </Button>
              </Permission>
            </Stack>
          </Stack>

          <Divider />

          {loading && items.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Projeto</TableCell>
                    <TableCell>Template</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bloqueado</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{item.title || `Contrato #${item.id.slice(0, 8)}`}</Typography>
                      </TableCell>
                      <TableCell>{item.customer?.displayName || '—'}</TableCell>
                      <TableCell>{item.project ? `${item.project.projectCode} - ${item.project.projectName}` : '—'}</TableCell>
                      <TableCell>{item.template?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip label={STATUS_LABELS[item.status]} size="small" color={STATUS_COLORS[item.status]} />
                      </TableCell>
                      <TableCell>{item.isLocked ? <Chip label="Sim" size="small" color="warning" variant="outlined" /> : '—'}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString('pt-BR')}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Permission rule="projects-management.contracts.read">
                            <Tooltip title="Visualizar">
                              <IconButton color="primary" onClick={() => openView(item.id)}>
                                <EyeOutlined />
                              </IconButton>
                            </Tooltip>
                          </Permission>
                          <Permission rule="projects-management.contracts.download.read">
                            <Tooltip title="Baixar PDF">
                              <span>
                                <IconButton color="info" onClick={() => downloadPdf(item)} disabled={downloadingId === item.id}>
                                  <FilePdfOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Permission>
                          <Permission rule="projects-management.contracts.update">
                            <Tooltip title={item.isLocked || item.status === 'signed' ? 'Contrato bloqueado/assinado' : 'Editar'}>
                              <span>
                                <IconButton
                                  color="secondary"
                                  onClick={() => openEdit(item.id)}
                                  disabled={item.isLocked || item.status === 'signed'}
                                >
                                  <EditOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Permission>
                          <Permission rule="projects-management.contracts.delete">
                            <Tooltip
                              title={
                                item.isLocked || item.status === 'signed' ? 'Não é possível excluir contrato bloqueado/assinado' : 'Excluir'
                              }
                            >
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => requestDelete(item)}
                                  disabled={item.isLocked || item.status === 'signed'}
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Permission>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Stack alignItems="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum contrato encontrado.'}
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
              rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 20, 50]}
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

      <ConfirmDeleteDialog
        open={deleteOpen}
        onCancel={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            setDeleting(true);
            await deleteContract(deleteTarget.id);
            openSnackbar({
              open: true,
              message: 'Contrato removido com sucesso!',
              variant: 'alert',
              alert: { color: 'success' }
            } as any);
            if (items.length === 1 && page > 0) setPage((p) => p - 1);
            else load();
          } catch (err: any) {
            openSnackbar({
              open: true,
              message: err?.response?.data?.message || 'Não foi possível remover',
              variant: 'alert',
              alert: { color: 'error' }
            } as any);
          } finally {
            setDeleting(false);
            setDeleteOpen(false);
            setDeleteTarget(null);
          }
        }}
        loading={deleting}
        title="Remover contrato"
        description={
          <span>
            Esta ação <b>não pode ser desfeita</b>. Deseja remover o contrato <b>{deleteTarget?.name}</b>?
          </span>
        }
      />
    </Grid>
  );
}
