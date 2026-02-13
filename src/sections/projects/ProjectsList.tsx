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
  InputAdornment,
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
  Divider
} from '@mui/material';
import {
  PlusOutlined as AddIcon,
  SearchOutlined as SearchIcon,
  MoreOutlined as MoreVertIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  EyeOutlined as ViewIcon
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { Project, ProjectType } from '../../types/projects';
import { listProjects, deleteProject } from '../../api/projects';
import { listCompanies, listPeople, Customer } from '../../api/customers';
import { openSnackbar } from '../../api/snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';
import { formatDateOnlyBR } from 'utils/date';
import ProjectFormDialog from './ProjectFormDialog';
import ProjectViewDialog from './ProjectViewDialog';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import Permission from '../../components/Permission';

// ==============================|| PROJECTS LIST ||============================== //

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  SOFTWARE: 'Software',
  AGENTS_AI: 'Agents AI',
  CONSULTING: 'Consultoria',
  OTHER: 'Outro'
};

const PROJECT_TYPE_COLORS: Record<ProjectType, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  SOFTWARE: 'primary',
  AGENTS_AI: 'warning',
  CONSULTING: 'info',
  OTHER: 'secondary'
};

export default function ProjectsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [orderBy, setOrderBy] = useState<'createdAt' | 'updatedAt' | 'projectName' | 'projectCode'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Clientes para filtro
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [, setCustomerSearch] = useState('');

  // Menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Formulário
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<any | null>(null);

  // Dialog de visualização
  const [viewDialog, setViewDialog] = useState(false);
  const [viewProjectId, setViewProjectId] = useState<string | null>(null);

  // Dialog de exclusão
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  // Verificar query params para abrir dialog automaticamente
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      setViewProjectId(viewId);
      setViewDialog(true);
    }
  }, [searchParams]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Carregar clientes para filtro
  const loadCustomers = async (q: string) => {
    setCustomerLoading(true);
    try {
      const [companies, people] = await Promise.all([listCompanies(q || undefined), listPeople(q || undefined)]);
      setCustomers([...companies, ...people]);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setCustomers([]);
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    if (formOpen) {
      loadCustomers('');
    }
  }, [formOpen]);

  // Carregar projetos
  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await listProjects({
        q: debouncedSearch || undefined,
        page: page + 1,
        limit,
        orderBy,
        order,
        customerId: selectedCustomerId || undefined
      });
      setProjects(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      console.error('Erro ao carregar projetos:', err);
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao carregar projetos',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, orderBy, order, debouncedSearch, selectedCustomerId]);

  // Handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleView = () => {
    if (selectedProject) {
      setViewProjectId(selectedProject.id);
      setViewDialog(true);
      // Atualiza a URL com o query param
      searchParams.set('view', selectedProject.id);
      setSearchParams(searchParams, { replace: true });
    }
    handleMenuClose();
  };

  const handleEdit = async () => {
    if (selectedProject) {
      setEditId(selectedProject.id);
      setEditInitial({
        projectName: selectedProject.projectName,
        projectCode: selectedProject.projectCode,
        description: selectedProject.description || '',
        projectType: selectedProject.projectType,
        customerId: selectedProject.customerId
      });
      setFormOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedProject) {
      try {
        setDeleting(true);
        await deleteProject(selectedProject.id);
        await loadProjects();
        setDeleteDialog(false);
        setSelectedProject(null);
        openSnackbar({
          open: true,
          message: 'Projeto excluído com sucesso!',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
      } catch (err: any) {
        openSnackbar({
          open: true,
          message: err.response?.data?.message || 'Erro ao excluir projeto',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setSelectedProject(null);
  };

  const handleCreate = () => {
    setEditId(null);
    setEditInitial(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditId(null);
    setEditInitial(null);
  };

  const handleFormSaved = () => {
    loadProjects();
  };

  const handleViewClose = () => {
    setViewDialog(false);
    setViewProjectId(null);
    // Remove o query param da URL ao fechar
    if (searchParams.get('view')) {
      searchParams.delete('view');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleEditFromView = () => {
    if (viewProjectId) {
      const projectToEdit = projects.find((p) => p.id === viewProjectId);
      if (projectToEdit) {
        setEditId(projectToEdit.id);
        setEditInitial({
          projectName: projectToEdit.projectName,
          projectCode: projectToEdit.projectCode,
          description: projectToEdit.description || '',
          projectType: projectToEdit.projectType,
          customerId: projectToEdit.customerId
        });
        setFormOpen(true);
      }
    }
  };

  const handleOrderChange = (field: 'createdAt' | 'updatedAt' | 'projectName' | 'projectCode') => {
    if (orderBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Permission rule="projects.create">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo Projeto
          </Button>
        </Permission>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Buscar por nome, código, descrição ou cliente..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                fullWidth
                options={customers}
                getOptionLabel={(option) => option.displayName || ''}
                loading={customerLoading}
                value={customers.find((c) => c.id === selectedCustomerId) || null}
                onChange={(_, value) => {
                  setSelectedCustomerId(value?.id || null);
                  setPage(0);
                }}
                onInputChange={(_, value) => {
                  setCustomerSearch(value);
                  loadCustomers(value);
                }}
                renderInput={(params) => <TextField {...params} label="Filtrar por Cliente" placeholder="Selecione um cliente..." />}
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
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleOrderChange('projectCode')}
                    sx={{ textDecoration: 'none', fontWeight: orderBy === 'projectCode' ? 600 : 400 }}
                  >
                    Código {orderBy === 'projectCode' && (order === 'asc' ? '↑' : '↓')}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleOrderChange('projectName')}
                    sx={{ textDecoration: 'none', fontWeight: orderBy === 'projectName' ? 600 : 400 }}
                  >
                    Nome {orderBy === 'projectName' && (order === 'asc' ? '↑' : '↓')}
                  </Link>
                </TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Contrato assinado</TableCell>
                <TableCell>Descrição</TableCell>
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
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">Nenhum projeto encontrado</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {project.projectCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{project.projectName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PROJECT_TYPE_LABELS[project.projectType]}
                        color={PROJECT_TYPE_COLORS[project.projectType]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{project.customer?.displayName || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.hasSignedContract ? 'Sim' : 'Não'}
                        size="small"
                        color={project.hasSignedContract ? 'success' : 'default'}
                        variant={project.hasSignedContract ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {project.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateOnlyBR(project.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Permission rule={['projects.read', 'projects.update', 'projects.delete']}>
                        <IconButton onClick={(e) => handleMenuOpen(e, project)} size="small">
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
        <Permission rule="projects.read">
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <ViewIcon />
            </ListItemIcon>
            <ListItemText>Visualizar</ListItemText>
          </MenuItem>
        </Permission>
        <Permission rule="projects.update">
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        </Permission>
        <Permission rule="projects.delete">
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
        description={`Tem certeza que deseja excluir o projeto "${selectedProject?.projectName}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

      {/* Dialog de visualização */}
      <ProjectViewDialog open={viewDialog} onClose={handleViewClose} projectId={viewProjectId} onEdit={handleEditFromView} />

      {/* Dialog de formulário */}
      <ProjectFormDialog
        open={formOpen}
        onClose={handleFormClose}
        editingId={editId}
        initial={editInitial}
        onSaved={handleFormSaved}
        customers={customers}
        customerLoading={customerLoading}
        onCustomerSearch={loadCustomers}
      />
    </Box>
  );
}
