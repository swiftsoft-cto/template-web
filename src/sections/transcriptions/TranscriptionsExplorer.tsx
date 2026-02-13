import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  PlusOutlined,
  FolderOutlined,
  FolderAddOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  AudioOutlined,
  DeleteOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type {
  TranscriptionsExplorerResponse,
  TranscriptionWithPath,
  TranscriptionFolder
} from '../../types/transcriptions';
import {
  getTranscriptionsExplorer,
  createTranscriptionFolder,
  listTranscriptionFolders,
  updateTranscription,
  deleteTranscription
} from '../../api/transcriptions';
import { openSnackbar } from '../../api/snackbar';
import { getRealtimeSocket } from '../../api/realtime';
import Permission from '../../components/Permission';
import ShareTranscriptionDialog from './ShareTranscriptionDialog';
import ShareFolderDialog from './ShareFolderDialog';
import type { TranscriptionStatus } from '../../types/transcriptions';

type ExplorerState = {
  loading: boolean;
  data: TranscriptionsExplorerResponse | null;
};

// ==============================|| TRANSCRIPTIONS EXPLORER (PASTAS + ARQUIVOS) ||============================== //

export default function TranscriptionsExplorer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [state, setState] = useState<ExplorerState>({ loading: true, data: null });
  // Drag & Drop (Explorer-like)
  const [draggingTranscriptionId, setDraggingTranscriptionId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [movingByDnD, setMovingByDnD] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  // Menu de contexto (botão direito) + Colaborar + Excluir
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [contextMenuTranscription, setContextMenuTranscription] = useState<TranscriptionWithPath | null>(null);
  const [contextMenuFolder, setContextMenuFolder] = useState<TranscriptionFolder | null>(null);
  const [shareDialog, setShareDialog] = useState<{ id: string; title: string } | null>(null);
  const [shareFolderDialog, setShareFolderDialog] = useState<{ folderId: string; folderName: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TranscriptionWithPath | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Status em tempo real via WebSocket (sobrescreve o do servidor até o próximo load)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TranscriptionStatus>>({});

  const isSearching = search.trim().length > 0;

  // Sempre mostrar "Raiz\" no caminho (padrão Explorer)
  const withRootPrefix = useCallback((p?: string | null) => {
    if (!p) return 'Raiz';
    const normalized = p.replaceAll('/', '\\');
    if (normalized.toLowerCase().startsWith('raiz\\') || normalized.toLowerCase() === 'raiz') return normalized;
    return `Raiz\\${normalized}`;
  }, []);

  const transcriptionDisplayPath = useCallback(
    (t: TranscriptionWithPath) => {
      // Quando está na raiz, o backend pode mandar pathString null/undefined
      if (!t.pathString) return `Raiz\\${t.title}`;
      return withRootPrefix(t.pathString);
    },
    [withRootPrefix]
  );

  const load = useCallback(
    async (opts?: { folderId?: string | null; search?: string }) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        // IMPORTANTE:
        // - `folderId: null` significa "Raiz"
        // - não podemos usar `??` direto aqui, porque `null ?? folderId` cairia no fallback
        const hasFolderId = !!opts && Object.prototype.hasOwnProperty.call(opts, 'folderId');
        const requestedFolderId = opts?.search ? undefined : hasFolderId ? opts!.folderId : folderId;
        const effectiveFolderId = requestedFolderId == null ? undefined : requestedFolderId;
        const effectiveSearch = (opts?.search ?? search) || undefined;
        const data = await getTranscriptionsExplorer({
          folderId: effectiveFolderId,
          search: effectiveSearch
        });
        setState({ loading: false, data });
        // Limpa overrides dos itens que vieram no load (servidor é fonte da verdade)
        setStatusOverrides((prev) => {
          const ids = new Set(data?.transcriptions?.map((t) => t.id) ?? []);
          const next = { ...prev };
          ids.forEach((id) => delete next[id]);
          return next;
        });
      } catch (err) {
        console.error(err);
        setState({ loading: false, data: null });
        openSnackbar({
          open: true,
          message: 'Erro ao carregar explorador de transcrições.',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
    },
    [folderId, search]
  );

  // ==============================|| DnD Handlers ||============================== //
  const onDragStartTranscription = useCallback((e: React.DragEvent, t: TranscriptionWithPath) => {
    // payload do drag
    e.dataTransfer.setData('application/x-transcription-id', t.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTranscriptionId(t.id);
  }, []);

  const onDragEndTranscription = useCallback(() => {
    setDraggingTranscriptionId(null);
    setDragOverFolderId(null);
    setDragOverRoot(false);
  }, []);

  const dropMoveToFolder = useCallback(
    async (e: React.DragEvent, destinationFolderId: string | null) => {
      e.preventDefault();
      e.stopPropagation();
      const tid =
        e.dataTransfer.getData('application/x-transcription-id') ||
        e.dataTransfer.getData('text/plain');
      if (!tid) return;

      setDragOverFolderId(null);
      setDragOverRoot(false);
      setMovingByDnD(true);
      try {
        await updateTranscription(tid, { folderId: destinationFolderId ?? null });
        openSnackbar({
          open: true,
          message: destinationFolderId ? 'Transcrição movida para a pasta.' : 'Transcrição movida para Raiz.',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
        // Recarrega mantendo o contexto (folder atual ou busca atual)
        await load();
      } catch (err) {
        console.error(err);
        openSnackbar({
          open: true,
          message: 'Erro ao mover transcrição.',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      } finally {
        setMovingByDnD(false);
        setDraggingTranscriptionId(null);
      }
    },
    [load]
  );

  const allowDrop = useCallback((e: React.DragEvent) => {
    // necessário para o drop funcionar no HTML5 DnD
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Sincroniza pasta atual com a URL: ?path=Raiz/C = navegação nas pastas (não é rota, só estado)
  const pathFromUrl = searchParams.get('path') ?? '';
  useEffect(() => {
    const raw = pathFromUrl.trim();
    if (!raw) {
      setFolderId(null);
      setSearch('');
      setPendingSearch('');
      load({ folderId: null, search: '' });
      return;
    }
    const pathStr = decodeURIComponent(raw);
    const segments = pathStr.split('/').filter(Boolean);
    if (segments.length === 0 || (segments.length === 1 && segments[0].toLowerCase() === 'raiz')) {
      setFolderId(null);
      setSearch('');
      setPendingSearch('');
      load({ folderId: null, search: '' });
      return;
    }
    let cancelled = false;
    const resolve = async () => {
      let currentId: string | null = null;
      for (let i = 0; i < segments.length && !cancelled; i++) {
        if (segments[i].toLowerCase() === 'raiz') continue;
        const list = await listTranscriptionFolders(currentId ?? undefined);
        if (cancelled) return;
        const segment = segments[i];
        const found = list.find((f) => f.name.toLowerCase() === segment.toLowerCase());
        if (!found) break;
        currentId = found.id;
      }
      if (cancelled) return;
      setFolderId(currentId);
      setSearch('');
      setPendingSearch('');
      load({ folderId: currentId, search: '' });
    };
    resolve();
    return () => {
      cancelled = true;
    };
  }, [pathFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket: atualiza status em tempo real (Processando → Pronto/Erro)
  useEffect(() => {
    const socket = getRealtimeSocket();
    const handler = (data: { id: string; status: string; title?: string | null; errorMessage?: string | null }) => {
      const status = data.status as TranscriptionStatus;
      setStatusOverrides((prev) => ({ ...prev, [data.id]: status }));
      if (data.status === 'done') {
        openSnackbar({
          open: true,
          message: `Transcrição "${data.title || 'pronta'}" finalizada.`,
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
      } else if (data.status === 'error') {
        openSnackbar({
          open: true,
          message: data.errorMessage || `Transcrição "${data.title || ''}" falhou.`,
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
    };
    socket.on('transcription:status', handler);
    return () => {
      socket.off('transcription:status', handler);
    };
  }, []);

  /** Navega para uma pasta e atualiza a URL (query ?path=). Não usa rota, só estado de navegação. */
  const handleNavigateFolder = (id: string | null, pathForUrl?: string) => {
    if (pathForUrl == null || pathForUrl === '' || pathForUrl.toLowerCase() === 'raiz') {
      setSearchParams({}, { replace: true });
      return;
    }
    setSearchParams({ path: pathForUrl }, { replace: true });
  };

  const handleOpenTranscription = (t: TranscriptionWithPath, effectiveStatus?: TranscriptionStatus) => {
    const status = effectiveStatus ?? t.status;
    if (status !== 'done') {
      openSnackbar({
        open: true,
        message: 'Aguarde a transcrição ser concluída para abrir.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }
    const pathFromUrl = searchParams.get('path') ?? '';
    navigate(`/transcriptions/${t.id}`, {
      state: { fromTab: 'mine', path: pathFromUrl || undefined }
    });
  };

  const handleNew = () => navigate('/transcriptions/new');

  const openCreateFolderDialog = () => {
    setNewFolderName('');
    setCreateDialogOpen(true);
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      openSnackbar({
        open: true,
        message: 'Informe um nome para a pasta.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }
    setCreatingFolder(true);
    try {
      await createTranscriptionFolder({ name, parentId: folderId });
      openSnackbar({
        open: true,
        message: 'Pasta criada com sucesso.',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      setCreateDialogOpen(false);
      setNewFolderName('');
      // Recarrega a pasta atual
      load({ folderId, search: '' });
    } catch (err) {
      console.error(err);
      openSnackbar({
        open: true,
        message: 'Erro ao criar pasta.',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = pendingSearch.trim();
    setSearch(term);
    load({ search: term });
  };

  const handleClearSearch = () => {
    setPendingSearch('');
    setSearch('');
    load({ folderId, search: '' });
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, t: TranscriptionWithPath) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
    setContextMenuTranscription(t);
    setContextMenuFolder(null);
  }, []);

  const handleContextMenuFolder = useCallback((e: React.MouseEvent, folder: TranscriptionFolder) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
    setContextMenuFolder(folder);
    setContextMenuTranscription(null);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setContextMenuTranscription(null);
    setContextMenuFolder(null);
  }, []);

  const handleContextMenuShare = useCallback(() => {
    if (contextMenuFolder) {
      setShareFolderDialog({ folderId: contextMenuFolder.id, folderName: contextMenuFolder.name });
    } else if (contextMenuTranscription) {
      setShareDialog({ id: contextMenuTranscription.id, title: contextMenuTranscription.title });
    }
    closeContextMenu();
  }, [contextMenuFolder, contextMenuTranscription, closeContextMenu]);

  const handleContextMenuDelete = useCallback(() => {
    if (contextMenuTranscription) {
      setDeleteTarget(contextMenuTranscription);
      setDeleteConfirmOpen(true);
    }
    closeContextMenu();
  }, [contextMenuTranscription, closeContextMenu]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      await deleteTranscription(id);
      openSnackbar({
        open: true,
        message: 'Transcrição excluída.',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      load({ folderId, search: '' });
    } catch (err) {
      console.error(err);
      openSnackbar({
        open: true,
        message: 'Erro ao excluir transcrição.',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, folderId, search, load]);

  const breadcrumbs = useMemo(() => {
    const pathItems = state.data?.pathItems ?? [{ id: null, name: 'Raiz' }];
    if (isSearching) {
      return (
        <Typography color="text.secondary">
          Busca: <strong>{search}</strong>
        </Typography>
      );
    }
    return (
      <Breadcrumbs aria-label="breadcrumb">
        {pathItems.map((item, idx) => {
          const isLast = idx === pathItems.length - 1;
          const isRoot = item.id === null;
          const rootIsDropTarget = isRoot && dragOverRoot && !!draggingTranscriptionId;
          if (isLast) {
            return (
              <Typography key={item.id ?? 'root'} color="text.primary">
                {item.name}
              </Typography>
            );
          }
          return (
            <Box
              key={item.id ?? 'root'}
              onDragOver={(e) => {
                if (!isRoot) return;
                allowDrop(e);
                setDragOverRoot(true);
              }}
              onDragLeave={() => {
                if (!isRoot) return;
                setDragOverRoot(false);
              }}
              onDrop={(e) => {
                if (!isRoot) return;
                setDragOverRoot(false);
                dropMoveToFolder(e, null); // soltar em Raiz
              }}
              sx={{
                borderRadius: 1,
                px: 0.5,
                ...(rootIsDropTarget ? { bgcolor: 'action.hover' } : {})
              }}
            >
              <Link
                color="inherit"
                underline="hover"
                sx={{ cursor: 'pointer' }}
                onClick={() =>
                  handleNavigateFolder(
                    item.id ?? null,
                    pathItems
                      .slice(0, idx + 1)
                      .map((p) => p.name)
                      .join('/')
                  )
                }
              >
                {item.name}
              </Link>
            </Box>
          );
        })}
      </Breadcrumbs>
    );
  }, [state.data, isSearching, search, allowDrop, dropMoveToFolder, dragOverRoot, draggingTranscriptionId]);

  const hasContent = (state.data?.folders?.length || 0) + (state.data?.transcriptions?.length || 0) > 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Transcrições
          </Typography>
          <Box sx={{ mt: 0.5 }}>{breadcrumbs}</Box>
        </Box>
        <Permission rule="transcriptions.create">
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FolderAddOutlined />}
              onClick={openCreateFolderDialog}
              size="small"
            >
              Nova pasta
            </Button>
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleNew}>
              Transcrever
            </Button>
          </Stack>
        </Permission>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmitSearch}
            sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <TextField
              size="small"
              placeholder="Buscar por nome de pasta, título ou arquivo..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              sx={{ minWidth: 260, flex: 1 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                type="submit"
                variant="outlined"
                startIcon={<SearchOutlined />}
                size="small"
                disabled={state.loading}
              >
                Buscar
              </Button>
              <IconButton size="small" onClick={handleClearSearch} disabled={!search && !pendingSearch && !isSearching}>
                <ReloadOutlined />
              </IconButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {(movingByDnD || draggingTranscriptionId) && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {movingByDnD ? 'Movendo...' : 'Arraste a transcrição e solte sobre uma pasta (ou em Raiz).'}
            </Typography>
          )}
          {state.loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : !hasContent ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Nenhum item encontrado.
              </Typography>
              {!isSearching && (
                <Permission rule="transcriptions.create">
                  <Button variant="outlined" startIcon={<AudioOutlined />} onClick={handleNew}>
                    Transcrever
                  </Button>
                </Permission>
              )}
            </Box>
          ) : (
            <List dense>
              {/* Pastas primeiro (como Explorer do Windows) */}
              {state.data?.folders?.map((folder) => (
                <ListItemButton
                  key={folder.id}
                  onClick={() =>
                    handleNavigateFolder(
                      folder.id,
                      [...(state.data?.pathItems ?? []).map((p) => p.name), folder.name].join('/')
                    )
                  }
                  onContextMenu={(e) => handleContextMenuFolder(e, folder)}
                  onDragOver={(e) => {
                    // permitir drop de transcrição em cima da pasta
                    allowDrop(e);
                    setDragOverFolderId(folder.id);
                  }}
                  onDragLeave={() => setDragOverFolderId((prev) => (prev === folder.id ? null : prev))}
                  onDrop={(e) => {
                    setDragOverFolderId(null);
                    dropMoveToFolder(e, folder.id);
                  }}
                  sx={{
                    borderRadius: 1,
                    ...(dragOverFolderId === folder.id && draggingTranscriptionId ? { bgcolor: 'action.hover' } : {})
                  }}
                >
                  <ListItemIcon>
                    <FolderOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={folder.name}
                    secondary={
                      isSearching && folder.pathString ? (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {withRootPrefix(folder.pathString)}
                        </Typography>
                      ) : undefined
                    }
                  />
                </ListItemButton>
              ))}

              {/* Depois as transcrições */}
              {state.data?.transcriptions?.map((t) => {
                const effectiveStatus = (statusOverrides[t.id] ?? t.status) as TranscriptionStatus | undefined;
                const isDone = effectiveStatus === 'done';
                const isError = effectiveStatus === 'error';
                const isProcessing = !isDone && !isError;
                return (
                  <ListItem key={t.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleOpenTranscription(t, effectiveStatus)}
                      onContextMenu={(e) => handleContextMenu(e, t)}
                      draggable
                      onDragStart={(e) => onDragStartTranscription(e, t)}
                      onDragEnd={onDragEndTranscription}
                      sx={{
                        cursor: 'pointer',
                        opacity: draggingTranscriptionId === t.id ? 0.6 : 1
                      }}
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
                              <Chip
                                size="small"
                                label="Processando"
                                color="info"
                                icon={<CircularProgress size={14} color="inherit" />}
                                sx={{ flexShrink: 0 }}
                              />
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
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {transcriptionDisplayPath(t)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onClose={() => !creatingFolder && setCreateDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Criar nova pasta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da pasta"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            disabled={creatingFolder}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creatingFolder}>
            Cancelar
          </Button>
          <Button onClick={handleCreateFolder} variant="contained" disabled={creatingFolder}>
            {creatingFolder ? <CircularProgress size={18} color="inherit" /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de contexto (botão direito) — estilo Windows */}
      <Menu
        open={contextMenu !== null}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <Permission rule={['transcription_shares.create', 'transcription_shares.read']}>
          <MenuItem
            onClick={handleContextMenuShare}
            disabled={!!contextMenuTranscription && contextMenuTranscription.status !== 'done'}
          >
            <ListItemIcon>
              <ShareAltOutlined />
            </ListItemIcon>
            Colaborar
          </MenuItem>
        </Permission>
        {contextMenuTranscription && (
          <Permission rule="transcriptions.delete">
            <MenuItem onClick={handleContextMenuDelete}>
              <ListItemIcon>
                <DeleteOutlined />
              </ListItemIcon>
              Excluir
            </MenuItem>
          </Permission>
        )}
      </Menu>

      {/* Confirmação de exclusão */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deletingId && (setDeleteConfirmOpen(false), setDeleteTarget(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Excluir transcrição?</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <Typography color="text.secondary">
              &quot;{deleteTarget.title}&quot; será excluída. Esta ação não pode ser desfeita.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteConfirmOpen(false); setDeleteTarget(null); }} disabled={!!deletingId}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={!!deletingId}
            startIcon={deletingId ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlined />}
          >
            {deletingId ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <ShareTranscriptionDialog
        open={!!shareDialog}
        onClose={() => setShareDialog(null)}
        transcriptionId={shareDialog?.id ?? null}
        transcriptionTitle={shareDialog?.title}
      />

      <ShareFolderDialog
        open={!!shareFolderDialog}
        onClose={() => setShareFolderDialog(null)}
        folderId={shareFolderDialog?.folderId ?? null}
        folderName={shareFolderDialog?.folderName}
      />
    </Box>
  );
}

