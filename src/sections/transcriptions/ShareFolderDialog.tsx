import { useCallback, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import type { UserBasic } from '../../api/users';
import { listFolderSharedWith, shareFolderWith, unshareFolderWith } from '../../api/transcriptions';
import type { TranscriptionSharedWithItem } from '../../types/transcriptions';
import { openSnackbar } from '../../api/snackbar';
import { usePermission } from '../../hooks/usePermission';
import UserSelect from '../../components/inputs/UserSelect';

type ShareFolderDialogProps = {
  open: boolean;
  onClose: () => void;
  folderId: string | null;
  folderName?: string;
};

export default function ShareFolderDialog({
  open,
  onClose,
  folderId,
  folderName = ''
}: ShareFolderDialogProps) {
  const canRead = usePermission('transcription_shares.read');
  const canCreate = usePermission('transcription_shares.create');
  const canDelete = usePermission('transcription_shares.delete');

  const [sharedWith, setSharedWith] = useState<TranscriptionSharedWithItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBasic | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSharedWith = useCallback(() => {
    if (!folderId || !canRead) return;
    setLoading(true);
    listFolderSharedWith(folderId)
      .then(setSharedWith)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
          (err as { message?: string })?.message ??
          'Erro ao carregar compartilhamentos.';
        openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
        setSharedWith([]);
      })
      .finally(() => setLoading(false));
  }, [folderId, canRead]);

  useEffect(() => {
    if (!open || !folderId) {
      setSharedWith([]);
      setSelectedUser(null);
      return;
    }
    if (canRead) loadSharedWith();
  }, [open, folderId, canRead, loadSharedWith]);

  const handleAdd = useCallback(() => {
    if (!folderId || !selectedUser || !canCreate) return;
    const userId = selectedUser.id;
    if (sharedWith.some((s) => s.sharedWithUserId === userId)) {
      openSnackbar({
        open: true,
        message: 'Esta pasta já está compartilhada com este usuário.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }
    setAdding(true);
    shareFolderWith(folderId, { userId })
      .then(() => {
        openSnackbar({
          open: true,
          message: 'Pasta compartilhada. O usuário terá acesso ao conteúdo atual e futuro.',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
        setSelectedUser(null);
        loadSharedWith();
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
          (err as { message?: string })?.message ??
          'Erro ao compartilhar pasta.';
        openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
      })
      .finally(() => setAdding(false));
  }, [folderId, selectedUser, canCreate, sharedWith, loadSharedWith]);

  const handleRemove = useCallback(
    (sharedWithUserId: string) => {
      if (!folderId || !canDelete) return;
      setRemovingId(sharedWithUserId);
      unshareFolderWith(folderId, sharedWithUserId)
        .then(() => {
          openSnackbar({
            open: true,
            message: 'Compartilhamento da pasta removido.',
            variant: 'alert',
            alert: { color: 'success' }
          } as any);
          loadSharedWith();
        })
        .catch((err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
            (err as { message?: string })?.message ??
            'Erro ao remover compartilhamento.';
          openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
        })
        .finally(() => setRemovingId(null));
    },
    [folderId, canDelete, loadSharedWith]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ pr: 1 }}>
          <Typography variant="h6">Compartilhar pasta</Typography>
          {folderName && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {folderName}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {canCreate && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <UserSelect
                label="Adicionar usuário"
                placeholder="Buscar por nome ou e-mail…"
                value={selectedUser}
                onChange={setSelectedUser}
              />
            </Box>
            <Button variant="contained" onClick={handleAdd} disabled={!selectedUser || adding} sx={{ minWidth: 120, flexShrink: 0 }}>
              {adding ? <CircularProgress size={20} /> : 'Adicionar'}
            </Button>
          </Box>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Compartilhado com
        </Typography>
        {!canRead ? (
          <Typography variant="body2" color="text.secondary">
            Você não tem permissão para ver com quem esta pasta está compartilhada.
          </Typography>
        ) : loading ? (
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : sharedWith.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <UserOutlined style={{ color: 'var(--mui-palette-text-secondary)' }} />
            <Typography variant="body2" color="text.secondary">
              Ninguém além de você tem acesso a esta pasta. Adicione usuários para compartilhar (inclui subpastas e transcrições).
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {sharedWith.map((item) => {
              const name = item.user?.name ?? item.sharedWithUserId;
              const email = item.user?.email ?? '';
              const sharedAt = item.createdAt
                ? new Date(item.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                : null;
              return (
                <ListItem key={item.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      src={item.user?.imageUrl ?? undefined}
                      alt={name}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={name}
                    secondary={
                      <>
                        {email && (
                          <Typography component="span" variant="body2" color="text.secondary" display="block">
                            {email}
                          </Typography>
                        )}
                        {sharedAt && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            Compartilhado em {sharedAt}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  {canDelete && (
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Remover compartilhamento"
                        onClick={() => handleRemove(item.sharedWithUserId)}
                        disabled={removingId === item.sharedWithUserId}
                      >
                        {removingId === item.sharedWithUserId ? <CircularProgress size={18} /> : <DeleteOutlined />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
