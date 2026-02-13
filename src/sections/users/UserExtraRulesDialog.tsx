import { useCallback, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { getUserExtraRules, deleteUserExtraRule } from 'api/users';
import type { UserExtraRule } from 'types/users';
import { openSnackbar } from 'api/snackbar';
import ExtraRulesList from 'sections/account/ExtraRulesList';

type UserExtraRulesDialogProps = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
};

export default function UserExtraRulesDialog({ open, onClose, userId, userName }: UserExtraRulesDialogProps) {
  const [rules, setRules] = useState<UserExtraRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const loadRules = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getUserExtraRules(userId)
      .then((res) => setRules(res.data ?? []))
      .catch((err: { response?: { data?: { message?: string } }; message?: string }) => {
        setError(err?.response?.data?.message ?? err?.message ?? 'Erro ao carregar regras.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!open || !userId) {
      setRules([]);
      setError(null);
      return;
    }
    loadRules();
  }, [open, userId, loadRules]);

  const handleDelete = useCallback(
    async (ruleId: string) => {
      if (!userId) return;
      setDeletingRuleId(ruleId);
      try {
        const res = await deleteUserExtraRule(userId, ruleId);
        openSnackbar({
          open: true,
          message: res.message || 'Regra desvinculada com sucesso.',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
        loadRules();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        openSnackbar({
          open: true,
          message: e?.response?.data?.message ?? e?.message ?? 'Erro ao revogar regra.',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      } finally {
        setDeletingRuleId(null);
      }
    },
    [userId, loadRules]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Regras extras{userName ? ` – ${userName}` : ''}
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <ExtraRulesList
          rules={rules}
          loading={loading}
          error={error}
          onDelete={userId ? handleDelete : undefined}
          deletingRuleId={deletingRuleId}
        />
      </DialogContent>
    </Dialog>
  );
}
