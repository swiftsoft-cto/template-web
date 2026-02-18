import { useCallback, useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { getUserExtraRules, deleteUserExtraRule, addUserExtraRule } from 'api/users';
import { listRules } from 'api/rules';
import type { UserExtraRule } from 'types/users';
import type { RuleItem } from 'types/rules';
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

  const [allRules, setAllRules] = useState<RuleItem[]>([]);
  const [loadingAllRules, setLoadingAllRules] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<RuleItem[]>([]);
  const [expiresAtLocal, setExpiresAtLocal] = useState<string>(''); // datetime-local value, vazio = sem expiração
  const [adding, setAdding] = useState(false);

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
      setSelectedToAdd([]);
      setExpiresAtLocal('');
      return;
    }
    loadRules();
  }, [open, userId, loadRules]);

  useEffect(() => {
    if (!open) return;
    setLoadingAllRules(true);
    listRules()
      .then(setAllRules)
      .catch(() => setAllRules([]))
      .finally(() => setLoadingAllRules(false));
  }, [open]);

  const availableRules = useMemo(() => {
    const assignedIds = new Set(rules.map((r) => r.id));
    return allRules.filter((r) => !assignedIds.has(r.id));
  }, [allRules, rules]);

  const handleAdd = useCallback(async () => {
    if (!userId || selectedToAdd.length === 0) return;
    const expiresAt = expiresAtLocal ? new Date(expiresAtLocal).toISOString() : null;
    setAdding(true);
    try {
      for (const rule of selectedToAdd) {
        await addUserExtraRule(userId, { ruleId: rule.id, source: 'manual', expiresAt });
      }
      openSnackbar({
        open: true,
        message:
          selectedToAdd.length === 1
            ? 'Regra adicionada com sucesso.'
            : `${selectedToAdd.length} regras adicionadas com sucesso.`,
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      setSelectedToAdd([]);
      setExpiresAtLocal('');
      loadRules();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      openSnackbar({
        open: true,
        message: e?.response?.data?.message ?? e?.message ?? 'Erro ao adicionar regras.',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setAdding(false);
    }
  }, [userId, selectedToAdd, expiresAtLocal, loadRules]);

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
        {userId && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Adicionar regras
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  label="Expira em"
                  type="datetime-local"
                  value={expiresAtLocal}
                  onChange={(e) => setExpiresAtLocal(e.target.value)}
                  disabled={adding}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 220 }}
                  helperText="Opcional. Deixe em branco para sem expiração."
                />
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={handleAdd}
                  disabled={selectedToAdd.length === 0 || adding}
                  sx={{ flexShrink: 0 }}
                >
                  {adding ? 'Adicionando...' : 'Adicionar regras'}
                </Button>
              </Box>
              <Typography variant="subtitle2" color="text.secondary">
                Regras disponíveis (marque uma ou mais)
              </Typography>
              {loadingAllRules ? (
                <Typography variant="body2" color="text.secondary">
                  Carregando regras...
                </Typography>
              ) : (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    maxHeight: 220,
                    overflow: 'auto',
                    p: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <FormGroup>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedToAdd(availableRules.slice())}
                        disabled={adding || availableRules.length === 0}
                      >
                        Selecionar todas
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedToAdd([])}
                        disabled={adding}
                      >
                        Desmarcar todas
                      </Button>
                    </Box>
                    {availableRules.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        Nenhuma regra disponível para adicionar (todas já estão vinculadas).
                      </Typography>
                    ) : (
                      availableRules.map((rule) => (
                        <FormControlLabel
                          key={rule.id}
                          control={
                            <Checkbox
                              checked={selectedToAdd.some((r) => r.id === rule.id)}
                              onChange={(_, checked) => {
                                if (checked) {
                                  setSelectedToAdd((prev) => [...prev, rule]);
                                } else {
                                  setSelectedToAdd((prev) => prev.filter((r) => r.id !== rule.id));
                                }
                              }}
                              disabled={adding}
                            />
                          }
                          label={
                            <Typography variant="body2" component="span">
                              {rule.name}
                              {rule.description ? (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                  — {rule.description}
                                </Typography>
                              ) : null}
                            </Typography>
                          }
                        />
                      ))
                    )}
                  </FormGroup>
                </Box>
              )}
            </Box>
          </Box>
        )}
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
