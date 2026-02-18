import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { listRoles, setUserRole } from 'api/users';
import { openSnackbar } from 'api/snackbar';
import { isAdminRoleName } from '../../utils/roles';
import useAuth from 'hooks/useAuth';

const MSG_NAO_PODE_REMOVER_ADM_CONTA = 'Você não pode remover a função de administrador da sua própria conta.';

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  currentRoleId?: string | null;
  /** Nome da função atual (para avisar quando administrador for removido) */
  currentRoleName?: string | null;
  onChanged: () => void;
};

export default function RolePickerDialog({ open, onClose, userId, currentRoleId, currentRoleName, onChanged }: Props) {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; description?: string | null }>>([]);

  const isEditingSelf = Boolean(userId && currentUser?.id && userId === currentUser.id);

  async function load() {
    try {
      setLoading(true);
      const res = await listRoles({ page: 1, limit: 20, search });
      setRoles(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selecionar Função</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          {loading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {roles.map((r) => (
                <ListItemButton
                  key={r.id}
                  selected={r.id === currentRoleId}
                  onClick={async () => {
                    if (!userId) return;
                    const removendoAdmin = isAdminRoleName(currentRoleName) && !isAdminRoleName(r.name);
                    if (isEditingSelf && removendoAdmin) {
                      openSnackbar({
                        open: true,
                        message: MSG_NAO_PODE_REMOVER_ADM_CONTA,
                        variant: 'alert',
                        alert: { color: 'error' }
                      } as any);
                      return;
                    }
                    try {
                      await setUserRole(userId, r.id);
                      if (removendoAdmin) {
                        openSnackbar({
                          open: true,
                          message: 'Atenção: administrador removido deste usuário.',
                          variant: 'alert',
                          alert: { color: 'warning' }
                        } as any);
                      } else {
                        openSnackbar({
                          open: true,
                          message: 'Função definida!',
                          variant: 'alert',
                          alert: { color: 'success' }
                        } as any);
                      }
                      onChanged();
                      onClose();
                    } catch (err: any) {
                      openSnackbar({
                        open: true,
                        message: err?.response?.data?.message || 'Não foi possível alterar a função.',
                        variant: 'alert',
                        alert: { color: 'error' }
                      } as any);
                    }
                  }}
                >
                  <ListItemText primary={<Typography fontWeight={600}>{r.name}</Typography>} secondary={r.description || ''} />
                </ListItemButton>
              ))}
              {!roles.length && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum role encontrado.
                </Typography>
              )}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Fechar
        </Button>
        <Button onClick={load}>Recarregar</Button>
      </DialogActions>
    </Dialog>
  );
}
