import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
  Autocomplete,
  Divider,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  PlusOutlined as AddIcon,
  MoreOutlined as MoreVertIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  EyeOutlined as ViewIcon,
  InfoCircleOutlined as InfoIcon,
  CheckCircleOutlined as CheckIcon,
  ClockCircleOutlined as ClockIcon,
  FileTextOutlined as FileIcon
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Scope } from '../../types/scopes';
import { listScopes, deleteScope, updateScope } from '../../api/scopes';
import { listProjects } from '../../api/projects';
import { Project } from '../../types/projects';
import { openSnackbar } from '../../api/snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';
import { formatDateOnlyBR } from 'utils/date';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import Permission from '../../components/Permission';

// ==============================|| SCOPES LIST ||============================== //

export default function ScopesList() {
  const navigate = useNavigate();
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  void setSearchTerm; // reservado para futuro campo de busca
  const [, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [orderBy, setOrderBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Projetos para filtro
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [, setProjectSearch] = useState('');

  // Menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedScope, setSelectedScope] = useState<Scope | null>(null);

  // Dialog de exclusão
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});

  // Modal de informações sobre status
  const [statusInfoDialog, setStatusInfoDialog] = useState(false);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Carregar projetos para filtro
  const loadProjects = async (q?: string) => {
    setProjectLoading(true);
    try {
      const response = await listProjects({ q: q || undefined, limit: 100 });
      setProjects(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar projetos:', err);
      setProjects([]);
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Carregar escopos
  const loadScopes = async () => {
    setLoading(true);
    try {
      const response = await listScopes({
        page: page + 1,
        limit,
        orderBy,
        order,
        projectId: selectedProjectId || undefined
      });
      setScopes(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      console.error('Erro ao carregar escopos:', err);
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao carregar escopos',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
      setScopes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScopes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, orderBy, order, selectedProjectId]);

  // Handlers

  const truncateWithEllipsis = (text: string, maxChars: number) => {
    const t = text.trim();
    if (t.length <= maxChars) return t;
    return `${t.slice(0, Math.max(0, maxChars - 3))}...`;
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, scope: Scope) => {
    setAnchorEl(event.currentTarget);
    setSelectedScope(scope);
  };

  const closeMenu = (clearSelection: boolean = true) => {
    setAnchorEl(null);
    if (clearSelection) setSelectedScope(null);
  };

  const handleMenuClose = () => {
    closeMenu(true);
  };

  const handleView = () => {
    if (selectedScope) {
      navigate(`/scopes/${selectedScope.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedScope) {
      navigate(`/scopes/${selectedScope.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    // Fecha o menu mas mantém o escopo selecionado para o dialog de confirmação
    closeMenu(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedScope?.id) {
      openSnackbar({
        open: true,
        message: 'Nenhum escopo selecionado para excluir.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      setDeleteDialog(false);
      return;
    }

    try {
      setDeleting(true);
      await deleteScope(selectedScope.id);
      await loadScopes();
      setDeleteDialog(false);
      setSelectedScope(null);
      openSnackbar({
        open: true,
        message: 'Escopo excluído com sucesso!',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao excluir escopo',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setSelectedScope(null);
  };

  const handleCreate = () => {
    navigate('/scopes/new');
  };

  const handleOrderChange = (field: 'createdAt' | 'updatedAt') => {
    if (orderBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  const handleStatusChange = async (scopeId: string, newStatus: 'created' | 'in_review' | 'finalized') => {
    setUpdatingStatus((prev) => ({ ...prev, [scopeId]: true }));
    try {
      await updateScope(scopeId, { status: newStatus });
      await loadScopes();
      openSnackbar({
        open: true,
        message: `Status atualizado para ${getStatusLabel(newStatus)}`,
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao atualizar status',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [scopeId]: false }));
    }
  };

  const getStatusLabel = (status: 'created' | 'in_review' | 'finalized') => {
    const labels = {
      created: 'Análise de Produto',
      in_review: 'Análise Técnica',
      finalized: 'Finalizado'
    };
    return labels[status];
  };

  const getStatusColor = (status: 'created' | 'in_review' | 'finalized') => {
    const colors = {
      created: 'default',
      in_review: 'warning',
      finalized: 'success'
    };
    return colors[status] as 'default' | 'warning' | 'success';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Permission rule="projects-management.scopes.create">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo Escopo
          </Button>
        </Permission>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                fullWidth
                options={projects}
                getOptionLabel={(option) => `${option.projectCode} - ${option.projectName}`}
                loading={projectLoading}
                value={projects.find((p) => p.id === selectedProjectId) || null}
                onChange={(_, value) => {
                  setSelectedProjectId(value?.id || null);
                  setPage(0);
                }}
                onInputChange={(_, value) => {
                  setProjectSearch(value);
                  loadProjects(value);
                }}
                renderInput={(params) => <TextField {...params} label="Filtrar por Projeto" placeholder="Selecione um projeto..." />}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Projeto</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Versão</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Status
                    </Typography>
                    <Tooltip title="Informações sobre os status">
                      <IconButton
                        size="small"
                        onClick={() => setStatusInfoDialog(true)}
                        sx={{
                          p: 0.5,
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        }}
                      >
                        <InfoIcon style={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleOrderChange('createdAt')}
                    sx={{ textDecoration: 'none', fontWeight: orderBy === 'createdAt' ? 600 : 400 }}
                  >
                    Criado em {orderBy === 'createdAt' && (order === 'asc' ? '↑' : '↓')}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleOrderChange('updatedAt')}
                    sx={{ textDecoration: 'none', fontWeight: orderBy === 'updatedAt' ? 600 : 400 }}
                  >
                    Atualizado em {orderBy === 'updatedAt' && (order === 'asc' ? '↑' : '↓')}
                  </Link>
                </TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : scopes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">Nenhum escopo encontrado</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                scopes.map((scope) => (
                  <TableRow key={scope.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {scope.project?.projectCode || '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {scope.project?.projectName || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {scope.name || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`v${scope.version}`} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Permission
                        rule="projects-management.scopes.update"
                        fallback={
                          <Chip
                            label={getStatusLabel(scope.status || 'created')}
                            color={getStatusColor(scope.status || 'created')}
                            size="small"
                          />
                        }
                      >
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={scope.status || 'created'}
                            onChange={(e) => {
                              const newStatus = e.target.value as 'created' | 'in_review' | 'finalized';
                              if (newStatus !== scope.status) {
                                handleStatusChange(scope.id, newStatus);
                              }
                            }}
                            disabled={updatingStatus[scope.id]}
                            sx={{
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1
                              }
                            }}
                            renderValue={(value) => {
                              return (
                                <Chip
                                  label={getStatusLabel(value as 'created' | 'in_review' | 'finalized')}
                                  color={getStatusColor(value as 'created' | 'in_review' | 'finalized')}
                                  size="small"
                                />
                              );
                            }}
                          >
                            <MenuItem value="created">
                              <Chip label="Análise de Produto" color="default" size="small" />
                            </MenuItem>
                            <MenuItem value="in_review">
                              <Chip label="Análise Técnica" color="warning" size="small" />
                            </MenuItem>
                            <MenuItem value="finalized">
                              <Chip label="Finalizado" color="success" size="small" />
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Permission>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{scope.user?.name || '—'}</Typography>
                    </TableCell>
                    <TableCell>{formatDateOnlyBR(scope.createdAt)}</TableCell>
                    <TableCell>{formatDateOnlyBR(scope.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Permission
                        rule={['projects-management.scopes.read', 'projects-management.scopes.update', 'projects-management.scopes.delete']}
                      >
                        <IconButton onClick={(e) => handleMenuOpen(e, scope)} size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </Permission>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        {/* Paginação */}
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
            rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 50, 100]}
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
      </Card>

      {/* Menu de ações */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Permission rule="projects-management.scopes.read">
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <ViewIcon />
            </ListItemIcon>
            <ListItemText>Visualizar</ListItemText>
          </MenuItem>
        </Permission>
        <Permission rule="projects-management.scopes.update">
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        </Permission>
        <Permission rule="projects-management.scopes.delete">
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Excluir</ListItemText>
          </MenuItem>
        </Permission>
      </Menu>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDeleteDialog
        open={deleteDialog}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o escopo "${
          selectedScope?.briefText
            ? truncateWithEllipsis(selectedScope.briefText, 20)
            : selectedScope?.project?.projectName
              ? truncateWithEllipsis(selectedScope.project.projectName, 20)
              : selectedScope?.id
                ? truncateWithEllipsis(selectedScope.id, 20)
                : 'selecionado'
        }"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

      {/* Modal de informações sobre status */}
      <Dialog
        open={statusInfoDialog}
        onClose={() => setStatusInfoDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 8
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <InfoIcon style={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status dos Escopos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entenda o significado de cada status
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Status: Análise de Produto */}
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileIcon style={{ fontSize: 24, color: '#666' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip label="Análise de Produto" color="default" size="small" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Fase Inicial
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      O escopo foi criado pelo responsável e está em fase de desenvolvimento inicial. Neste momento, o criador ainda está
                      editando e refinando o conteúdo do escopo, adicionando detalhes técnicos, requisitos e especificações necessárias para
                      o projeto.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Status: Análise Técnica */}
            <Card variant="outlined" sx={{ bgcolor: 'warning.50', borderColor: 'warning.200' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'warning.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <ClockIcon style={{ fontSize: 24, color: '#fff' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip label="Análise Técnica" color="warning" size="small" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Revisão Técnica
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      O escopo foi enviado para análise técnica pelo Tech Lead ou responsável de TI. Nesta fase, o profissional técnico está
                      revisando o conteúdo, validando a viabilidade, verificando a consistência técnica e preparando as observações ou
                      aprovações necessárias para que o escopo possa avançar para a próxima etapa.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Status: Finalizado */}
            <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.200' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CheckIcon style={{ fontSize: 24, color: '#fff' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip label="Finalizado" color="success" size="small" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Concluído
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      Todas as etapas do escopo foram concluídas com sucesso. O criador finalizou o desenvolvimento inicial, o Tech Lead ou
                      responsável de TI completou a análise técnica, e todas as partes envolvidas concluíram suas atividades. O escopo está
                      pronto para ser utilizado e não requer mais alterações na versão atual.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Informação adicional */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'info.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'info.main'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <InfoIcon style={{ fontSize: 20, color: '#1976d2', marginTop: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Dica
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    Você pode alterar o status de um escopo diretamente na tabela usando o campo de seleção na coluna "Status". As
                    alterações são salvas automaticamente e refletem o progresso atual do trabalho no escopo.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStatusInfoDialog(false)} variant="contained" sx={{ minWidth: 120 }}>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
