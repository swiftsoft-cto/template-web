import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';

import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

import { listContractTemplates, deleteContractTemplate, getContractTemplate } from 'api/contractTemplates';
import { ContractTemplate } from 'types/contracts';
import { openSnackbar } from 'api/snackbar';
import useDebounced from 'utils/useDebounced';

import TemplateFormDialog from 'sections/contracts/TemplateFormDialog';
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog';
import Permission from 'components/Permission';

export default function ContractTemplatesPage() {
  const [items, setItems] = useState<ContractTemplate[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 500);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<any | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  async function load() {
    try {
      setLoading(true);
      const res = await listContractTemplates({
        page: page + 1,
        limit,
        orderBy: 'createdAt',
        order: 'desc'
      });
      setItems(res.data);
      setTotal(res.pagination.total);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao carregar templates',
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
  }, [page, limit]);

  const requestDelete = (template: ContractTemplate) => {
    setDeleteTarget({ id: template.id, name: template.name });
    setDeleteOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setEditInitial(null);
    setFormOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      setEditId(id);
      const template = await getContractTemplate(id);
      setEditInitial({
        name: template.name,
        description: template.description || '',
        projectId: template.projectId || null,
        templateHtml: template.templateHtml
      });
      setFormOpen(true);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Não foi possível carregar o template',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Templates de Contratos" contentSX={{ p: 0 }}>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 2 : 1.5}
            sx={{ p: 2, pb: 1 }}
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            <TextField
              label="Buscar por nome"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Digite para buscar..."
              sx={{ minWidth: isMobile ? '100%' : 280, flex: isMobile ? 'none' : 1 }}
            />
            <Stack direction="row" spacing={1}>
              <Permission rule="projects-management.contracts.templates.create">
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
                  Novo Template
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
                    <TableCell>Nome</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Projeto</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items
                    .filter((item) => !debouncedSearch || item.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
                    .map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{item.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.description || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.project ? `${item.project.projectCode} - ${item.project.projectName}` : 'Geral'}</TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleString('pt-BR')}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Permission rule="projects-management.contracts.templates.update">
                              <Tooltip title="Editar">
                                <IconButton color="secondary" onClick={() => openEdit(item.id)}>
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>
                            </Permission>
                            <Permission rule="projects-management.contracts.templates.delete">
                              <Tooltip title="Excluir">
                                <IconButton color="error" onClick={() => requestDelete(item)}>
                                  <DeleteOutlined />
                                </IconButton>
                              </Tooltip>
                            </Permission>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Stack alignItems="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum template encontrado.'}
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

      <TemplateFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
          setEditInitial(null);
        }}
        editingId={editId || undefined}
        initial={editInitial || undefined}
        onSaved={load}
      />

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
            await deleteContractTemplate(deleteTarget.id);
            openSnackbar({
              open: true,
              message: 'Template removido com sucesso!',
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
        title="Remover template"
        description={
          <span>
            Esta ação <b>não pode ser desfeita</b>. Deseja remover o template <b>{deleteTarget?.name}</b>?
          </span>
        }
      />
    </Grid>
  );
}
