import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { ArrowLeftOutlined, FolderOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type {
  SharedWithMeUser,
  TranscriptionsExplorerResponse,
  TranscriptionWithPath,
  TranscriptionStatus
} from '../../types/transcriptions';
import { listSharedWithMeUsers, getSharedWithMeExplorer } from '../../api/transcriptions';
import { openSnackbar } from '../../api/snackbar';
import Chip from '@mui/material/Chip';

type ExplorerState = {
  loading: boolean;
  data: TranscriptionsExplorerResponse | null;
};

type RestoreState = { sharedByUserId: string; folderId?: string | null };

type TranscriptionsSharedWithMeProps = {
  restoreState?: RestoreState | null;
};

// ==============================|| TRANSCRIPTIONS SHARED WITH ME ||============================== //

export default function TranscriptionsSharedWithMe({ restoreState }: TranscriptionsSharedWithMeProps = {}) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<SharedWithMeUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<SharedWithMeUser | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [state, setState] = useState<ExplorerState>({ loading: false, data: null });

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const list = await listSharedWithMeUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
      setUsers([]);
      openSnackbar({
        open: true,
        message: 'Erro ao carregar usuários que compartilharam com você.',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadExplorer = useCallback(
    async (opts?: { folderId?: string | null }) => {
      if (!selectedUser) return;
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const id = opts?.folderId !== undefined ? opts.folderId : folderId;
        const data = await getSharedWithMeExplorer({
          sharedByUserId: selectedUser.id,
          folderId: id ?? undefined
        });
        setState({ loading: false, data });
      } catch (err) {
        console.error(err);
        setState({ loading: false, data: null });
        openSnackbar({
          open: true,
          message: 'Erro ao carregar pasta.',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
    },
    [selectedUser, folderId]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Restaura usuário e pasta ao voltar da página da transcrição
  useEffect(() => {
    if (!restoreState?.sharedByUserId || users.length === 0) return;
    const user = users.find((u) => u.id === restoreState.sharedByUserId);
    if (user) {
      setSelectedUser(user);
      setFolderId(restoreState.folderId ?? null);
    }
  }, [restoreState?.sharedByUserId, restoreState?.folderId, users]);

  useEffect(() => {
    if (!selectedUser) {
      setState({ loading: false, data: null });
      return;
    }
    setFolderId(null);
  }, [selectedUser?.id]);

  useEffect(() => {
    if (!selectedUser) return;
    loadExplorer({ folderId });
  }, [selectedUser?.id, folderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectUser = (user: SharedWithMeUser) => {
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setFolderId(null);
    setState({ loading: false, data: null });
  };

  const handleNavigateFolder = (id: string | null) => {
    setFolderId(id);
  };

  const handleOpenTranscription = (t: TranscriptionWithPath) => {
    const status = (t.status ?? 'processing') as TranscriptionStatus;
    if (status !== 'done') {
      openSnackbar({
        open: true,
        message: 'Aguarde a transcrição ser concluída para abrir.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }
    navigate(`/transcriptions/${t.id}`, {
      state: { fromTab: 'shared', sharedByUserId: selectedUser.id, folderId }
    });
  };

  const pathItems = state.data?.pathItems ?? [];
  const hasContent =
    (state.data?.folders?.length ?? 0) + (state.data?.transcriptions?.length ?? 0) > 0;

  // Tela 1: lista de usuários que compartilharam comigo
  if (!selectedUser) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Compartilhadas comigo
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Escolha o usuário para ver as transcrições que ele compartilhou com você.
        </Typography>
        {loadingUsers ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Nenhum usuário compartilhou transcrições com você ainda.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {users.map((user) => (
              <Card
                key={user.id}
                sx={{
                  minWidth: 200,
                  maxWidth: 280,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSelectUser(user)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={user.imageUrl ?? undefined}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      <UserOutlined />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {user.name}
                      </Typography>
                      {user.email && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  // Tela 2: explorer do usuário selecionado (pastas + transcrições)
  const breadcrumbs = (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        component="button"
        variant="body2"
        color="inherit"
        underline="hover"
        onClick={handleBackToUsers}
        sx={{ cursor: 'pointer' }}
      >
        Compartilhadas comigo
      </Link>
      <Link
        component="button"
        variant="body2"
        color="inherit"
        underline="hover"
        onClick={() => handleNavigateFolder(null)}
        sx={{ cursor: 'pointer' }}
      >
        {selectedUser.name}
      </Link>
      {pathItems.length > 1 &&
        pathItems.slice(1).map((item, idx) => {
          const isLast = idx === pathItems.length - 2;
          if (isLast) {
            return (
              <Typography key={item.id ?? 'root'} variant="body2" color="text.primary">
                {item.name}
              </Typography>
            );
          }
          return (
            <Link
              key={item.id ?? 'root'}
              component="button"
              variant="body2"
              color="inherit"
              underline="hover"
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigateFolder(item.id)}
            >
              {item.name}
            </Link>
          );
        })}
    </Breadcrumbs>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Compartilhadas comigo
          </Typography>
          <Box sx={{ mt: 0.5 }}>{breadcrumbs}</Box>
        </Box>
        <Button variant="text" startIcon={<ArrowLeftOutlined />} onClick={handleBackToUsers} size="small">
          Voltar à lista
        </Button>
      </Stack>

      <Card>
        <CardContent>
          {state.loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : !hasContent ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nenhum item nesta pasta.
              </Typography>
            </Box>
          ) : (
            <List dense>
              {state.data?.folders?.map((folder) => (
                <ListItemButton key={folder.id} onClick={() => handleNavigateFolder(folder.id)}>
                  <ListItemIcon>
                    <FolderOutlined />
                  </ListItemIcon>
                  <ListItemText primary={folder.name} />
                </ListItemButton>
              ))}
              {state.data?.transcriptions?.map((t) => {
                const isDone = t.status === 'done';
                const isError = t.status === 'error';
                const isProcessing = !isDone && !isError;
                return (
                  <ListItemButton
                    key={t.id}
                    onClick={() => handleOpenTranscription(t)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon>
                      <FileTextOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ minWidth: 0, flex: '1 1 auto' }}>
                            {t.title}
                          </Typography>
                          {isProcessing && (
                            <Chip size="small" label="Processando" color="info" sx={{ flexShrink: 0 }} />
                          )}
                          {isDone && (
                            <Chip size="small" label="Pronto" color="success" sx={{ flexShrink: 0 }} />
                          )}
                          {isError && (
                            <Chip size="small" label="Erro" color="error" sx={{ flexShrink: 0 }} />
                          )}
                        </Stack>
                      }
                      secondary={
                        t.pathString ? (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {t.pathString}
                          </Typography>
                        ) : undefined
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
