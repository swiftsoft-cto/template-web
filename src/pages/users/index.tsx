import { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from 'components/@extended/Tooltip';
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
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';
import useAvatarUrl from 'hooks/useAvatarUrl';

import EditOutlined from '@ant-design/icons/EditOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import KeyOutlined from '@ant-design/icons/KeyOutlined';

import { listUsers, getUser } from 'api/users';
import { blockUser } from 'api/blocks';
import { UserRow } from 'types/users';
import { openSnackbar } from 'api/snackbar';
import { formatDateOnlyBR, toDateOnly } from 'utils/date';
import { formatCPF, formatPhoneBR } from 'utils/mask';
import { FormattedMessage } from 'react-intl';

import UserFormDialog from 'sections/users/UserFormDialog';
import RolePickerDialog from 'sections/users/RolePickerDialog';
import UserExtraRulesDialog from 'sections/users/UserExtraRulesDialog';
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog';
import Permission from 'components/Permission';

// Avatar protegido por token
function UserAvatar({ id, name, size = 36, avatarFileId }: { id: string; name: string; size?: number; avatarFileId?: string | null }) {
  const url = useAvatarUrl(id, avatarFileId);
  return (
    <Avatar src={url ?? undefined} alt={name} size="sm" color="primary">
      {name?.charAt(0) || 'U'}
    </Avatar>
  );
}

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [page, setPage] = useState(0); // zero-based
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<any | null>(null);

  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [roleUserId, setRoleUserId] = useState<string | null>(null);
  const [roleCurrentId, setRoleCurrentId] = useState<string | null>(null);

  const [extraRulesOpen, setExtraRulesOpen] = useState(false);
  const [extraRulesUser, setExtraRulesUser] = useState<{ id: string; name: string } | null>(null);

  // --- Confirmação de bloqueio de conta ---
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState<{ id: string; name: string; email?: string } | null>(null);
  const [blocking, setBlocking] = useState(false);

  // Responsividade
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const hasCPF = useMemo(() => items.some((u) => Object.prototype.hasOwnProperty.call(u, 'cpf')), [items]);
  const hasBirth = useMemo(() => items.some((u) => Object.prototype.hasOwnProperty.call(u, 'birthdate')), [items]);

  async function load() {
    try {
      setLoading(true);
      const res = await listUsers({
        page: page + 1,
        limit,
        search: debouncedSearch.trim() || undefined,
        sortBy,
        sortOrder
      });
      setItems(res.data);
      setTotal(res.pagination.total);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao carregar usuários',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }

  // Estado para o termo de busca com debounce
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce para busca enquanto digita (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset para primeira página quando busca muda
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Carrega dados quando page, limit, sortBy, sortOrder ou debouncedSearch mudam
  useEffect(() => {
    load();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page, limit, sortBy, sortOrder, debouncedSearch]);

  const requestBlock = (u: UserRow) => {
    setBlockTarget({ id: u.id, name: u.name, email: u.email });
    setBlockOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setEditInitial(null);
    setFormOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      setEditId(id);
      const u = await getUser(id);
      // Preserve a AUSÊNCIA do campo (permite esconder no form)
      const initial: any = {
        name: u.name,
        email: u.email,
        emailVerifiedAt: u.emailVerifiedAt ?? null,
        roleId: u.role?.id ?? null,
        roleName: u.role?.name ?? null
      };
      if (Object.prototype.hasOwnProperty.call(u, 'phone')) {
        initial.phone = u.phone || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'cpf')) {
        initial.cpf = u.cpf || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'cnpj')) {
        initial.cnpj = u.cnpj || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'birthdate')) {
        initial.birthdate = toDateOnly(u.birthdate) || '';
      }
      // Novos campos de endereço e serviço
      if (Object.prototype.hasOwnProperty.call(u, 'postalCode')) {
        initial.postalCode = u.postalCode || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'address')) {
        initial.address = u.address || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'addressState')) {
        initial.addressState = u.addressState || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'addressCity')) {
        initial.addressCity = u.addressCity || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'addressNeighborhood')) {
        initial.addressNeighborhood = u.addressNeighborhood || '';
      }
      if (Object.prototype.hasOwnProperty.call(u, 'service')) {
        initial.service = u.service || '';
      }
      setEditInitial(initial);
      setFormOpen(true);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Não foi possível carregar o usuário',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  const openRole = (u: UserRow) => {
    setRoleUserId(u.id);
    setRoleCurrentId(u.role?.id || null);
    setRolePickerOpen(true);
  };

  const openExtraRules = (u: UserRow) => {
    setExtraRulesUser({ id: u.id, name: u.name });
    setExtraRulesOpen(true);
  };

  // Componente de card para mobile
  const UserCard = ({ user }: { user: UserRow }) => (
    <Card
      sx={{
        mb: 2,
        '&:hover': { boxShadow: 3 },
        ...(user.isBlocked && {
          backgroundColor: 'error.lighter',
          '& .MuiTypography-root': {
            color: 'error.contrastText'
          },
          '& .MuiChip-root': {
            backgroundColor: 'error.main',
            color: 'error.contrastText'
          }
        }),
        ...(!user.emailVerifiedAt &&
          !user.isBlocked && {
            backgroundColor: 'warning.lighter',
            //  '& .MuiTypography-root': {
            //    color: 'warning.contrastText',
            //  },
            '& .MuiChip-root': {
              backgroundColor: 'warning.main',
              color: 'warning.contrastText'
            }
          })
      }}
    >
      <CardContent sx={{ p: isSmallMobile ? 1.5 : 2 }}>
        <Stack spacing={1.5}>
          {/* Cabeçalho do card */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <UserAvatar id={user.id} name={user.name} size={48} avatarFileId={user.avatarFileId} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip
                title={
                  user.isBlocked ? (
                    <FormattedMessage id="user-blocked" />
                  ) : !user.emailVerifiedAt ? (
                    <FormattedMessage id="user-unverified" />
                  ) : (
                    ''
                  )
                }
                disableHoverListener={!user.isBlocked && !!user.emailVerifiedAt}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {user.name}
                </Typography>
              </Tooltip>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {user.email}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Permission rule={['users.link_role', 'users.role.update']}>
                <Tooltip title="Definir função">
                  <IconButton size="small" color="primary" onClick={() => openRole(user)}>
                    <TeamOutlined />
                  </IconButton>
                </Tooltip>
              </Permission>
              <Permission rule="users.update">
                <Tooltip title="Regras extras">
                  <IconButton size="small" onClick={() => openExtraRules(user)}>
                    <KeyOutlined />
                  </IconButton>
                </Tooltip>
              </Permission>
              <Permission rule="users.update">
                <Tooltip title="Editar">
                  <IconButton size="small" color="secondary" onClick={() => openEdit(user.id)}>
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
              </Permission>
              <Permission rule="users.delete">
                <Tooltip title="Bloquear">
                  <IconButton size="small" color="warning" onClick={() => requestBlock(user)}>
                    <LockOutlined />
                  </IconButton>
                </Tooltip>
              </Permission>
            </Stack>
          </Stack>

          {/* Informações do usuário */}
          <Stack spacing={isSmallMobile ? 0.5 : 1}>
            {user.phone && (
              <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 50 : 60 }}>
                  Telefone:
                </Typography>
                <Typography variant="body2">{formatPhoneBR(user.phone)}</Typography>
              </Stack>
            )}

            {hasCPF && user.cpf && (
              <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 50 : 60 }}>
                  CPF:
                </Typography>
                <Typography variant="body2">{formatCPF(user.cpf)}</Typography>
              </Stack>
            )}

            {hasBirth && user.birthdate && (
              <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 50 : 60 }}>
                  Nascimento:
                </Typography>
                <Typography variant="body2">{formatDateOnlyBR(user.birthdate)}</Typography>
              </Stack>
            )}

            <Stack direction="row" alignItems="center" spacing={isSmallMobile ? 0.5 : 1}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 50 : 60 }}>
                Função:
              </Typography>
              {user.role ? <Chip label={user.role.name} size="small" /> : <Chip label="—" size="small" variant="outlined" />}
            </Stack>

            {(user.departments || []).length > 0 && (
              <Stack direction="row" alignItems="flex-start" spacing={isSmallMobile ? 0.5 : 1}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: isSmallMobile ? 50 : 60, mt: 0.5 }}>
                  Departamentos:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ flex: 1 }}>
                  {user.departments?.map((d) => (
                    <Chip key={d.id} label={d.name} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>

          {/* Data de criação */}
          <Typography variant="caption" color="text.secondary">
            Criado em {new Date(user.createdAt).toLocaleString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Colaboradores" contentSX={{ p: 0 }}>
          {/* Cabeçalho responsivo */}
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 2 : 1.5}
            sx={{ p: 2, pb: 1 }}
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            {/* Campo de busca */}
            <TextField
              label="Buscar por nome ou e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite para buscar automaticamente..."
              sx={{
                minWidth: isMobile ? '100%' : 280,
                flex: isMobile ? 'none' : 1
              }}
              autoComplete="off"
              inputProps={{
                'data-form-type': 'other',
                autocomplete: 'off'
              }}
            />

            {/* Botões de ação */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: isMobile ? 'space-between' : 'flex-start'
              }}
            >
              <Permission rule="users.create">
                <Button variant="contained" startIcon={<UserAddOutlined />} onClick={openCreate} size={isSmallMobile ? 'small' : 'medium'}>
                  {isSmallMobile ? 'Novo' : 'Novo colaborador'}
                </Button>
              </Permission>
            </Stack>
          </Stack>

          <Divider />

          {/* Conteúdo responsivo */}
          {isMobile ? (
            // Layout de cards para mobile
            <Box sx={{ p: 2 }}>
              {items.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}

              {!items.length && (
                <Stack alignItems="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading ? 'Carregando...' : 'Nenhum colaborador encontrado.'}
                  </Typography>
                </Stack>
              )}
            </Box>
          ) : (
            // Layout de tabela para desktop
            <TableContainer>
              <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      Nome
                    </TableCell>
                    <TableCell
                      onClick={() => {
                        setSortBy('email');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      E-mail
                    </TableCell>
                    <TableCell>Telefone</TableCell>
                    {hasCPF && <TableCell>CPF</TableCell>}
                    {hasBirth && <TableCell>Nascimento</TableCell>}
                    <TableCell>Função</TableCell>
                    <TableCell>Departamentos</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((u) => (
                    <TableRow
                      key={u.id}
                      hover
                      sx={{
                        ...(u.isBlocked && {
                          backgroundColor: 'error.lighter',
                          '&:hover': {
                            backgroundColor: 'error.main'
                          },
                          '& .MuiTableCell-root': {
                            color: 'error.contrastText'
                          }
                        }),
                        ...(!u.emailVerifiedAt &&
                          !u.isBlocked && {
                            backgroundColor: 'warning.lighter',
                            '&:hover': {
                              backgroundColor: 'warning.light'
                            }
                            //  '& .MuiTableCell-root': {
                            //    color: 'warning.contrastText',
                            //  }
                          })
                      }}
                    >
                      <TableCell width={56}>
                        <UserAvatar id={u.id} name={u.name} avatarFileId={u.avatarFileId} />
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            u.isBlocked ? (
                              <FormattedMessage id="user-blocked" />
                            ) : !u.emailVerifiedAt ? (
                              <FormattedMessage id="user-unverified" />
                            ) : (
                              ''
                            )
                          }
                          disableHoverListener={!u.isBlocked && !!u.emailVerifiedAt}
                        >
                          <Stack>
                            <Typography fontWeight={600}>{u.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Criado em {new Date(u.createdAt).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone ? formatPhoneBR(u.phone) : '-'}</TableCell>
                      {hasCPF && <TableCell>{u.cpf ? formatCPF(u.cpf) : '-'}</TableCell>}
                      {hasBirth && <TableCell>{formatDateOnlyBR(u.birthdate)}</TableCell>}
                      <TableCell>
                        {u.role ? <Chip label={u.role.name} size="small" /> : <Chip label="—" size="small" variant="outlined" />}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {(u.departments || []).map((d) => (
                            <Chip key={d.id} label={d.name} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                          ))}
                          {!u.departments?.length && (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Permission rule={['users.link_role', 'users.role.update']}>
                            <Tooltip title="Definir função">
                              <IconButton color="primary" onClick={() => openRole(u)}>
                                <TeamOutlined />
                              </IconButton>
                            </Tooltip>
                          </Permission>
                          <Permission rule="users.update">
                            <Tooltip title="Regras extras">
                              <IconButton onClick={() => openExtraRules(u)}>
                                <KeyOutlined />
                              </IconButton>
                            </Tooltip>
                          </Permission>
                          <Permission rule="users.update">
                            <Tooltip title="Editar">
                              <IconButton color="secondary" onClick={() => openEdit(u.id)}>
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>
                          </Permission>
                          <Permission rule="users.delete">
                            <Tooltip title="Bloquear">
                              <IconButton color="warning" onClick={() => requestBlock(u)}>
                                <LockOutlined />
                              </IconButton>
                            </Tooltip>
                          </Permission>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Stack alignItems="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum colaborador encontrado.'}
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

      {/* Dialogs */}
      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingId={editId}
        initial={editInitial || undefined}
        onSaved={load}
      />
      <RolePickerDialog
        open={rolePickerOpen}
        onClose={() => setRolePickerOpen(false)}
        userId={roleUserId}
        currentRoleId={roleCurrentId || undefined}
        onChanged={load}
      />
      <UserExtraRulesDialog
        open={extraRulesOpen}
        onClose={() => {
          setExtraRulesOpen(false);
          setExtraRulesUser(null);
        }}
        userId={extraRulesUser?.id ?? null}
        userName={extraRulesUser?.name}
      />

      {/* Confirmação de bloqueio de conta */}
      <ConfirmDeleteDialog
        open={blockOpen}
        confirmText="Bloquear"
        confirmColor="warning"
        variant="confirm"
        onCancel={() => {
          if (blocking) return;
          setBlockOpen(false);
          setBlockTarget(null);
        }}
        onConfirm={async () => {
          if (!blockTarget) return;
          try {
            setBlocking(true);
            await blockUser(blockTarget.id, {});
            openSnackbar({
              open: true,
              message: 'Colaborador bloqueado. A conta foi enviada para bloqueio.',
              variant: 'alert',
              alert: { color: 'success' }
            } as any);
            load();
          } catch (err: any) {
            openSnackbar({
              open: true,
              message: err?.response?.data?.message || 'Não foi possível bloquear o colaborador',
              variant: 'alert',
              alert: { color: 'error' }
            } as any);
          } finally {
            setBlocking(false);
            setBlockOpen(false);
            setBlockTarget(null);
          }
        }}
        loading={blocking}
        title="Bloquear colaborador"
        description={
          <span>
            O colaborador <b>{blockTarget?.name}</b>
            {blockTarget?.email ? ` (${blockTarget.email})` : ''} será <b>bloqueado</b> e não poderá acessar o sistema. A conta irá para a lista de bloqueio. Deseja continuar?
          </span>
        }
      />
    </Grid>
  );
}
