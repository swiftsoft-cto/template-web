import { useCallback, useEffect, useState } from 'react';
import { getMyExtraRules, deleteUserExtraRule } from 'api/users';
import type { UserExtraRule } from 'types/users';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';
import ExtraRulesList from './ExtraRulesList';

export default function MyExtraRulesSection() {
  const { user } = useAuth();
  const [rules, setRules] = useState<UserExtraRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const loadRules = useCallback(() => {
    setLoading(true);
    setError(null);
    getMyExtraRules()
      .then((res) => setRules(res.data ?? []))
      .catch((err: { response?: { data?: { message?: string } }; message?: string }) => {
        setError(err?.response?.data?.message ?? err?.message ?? 'Erro ao carregar regras.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleDelete = useCallback(
    async (ruleId: string) => {
      const userId = user?.id;
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
    [user?.id, loadRules]
  );

  return (
    <ExtraRulesList
      rules={rules}
      loading={loading}
      error={error}
      onDelete={user?.id ? handleDelete : undefined}
      deletingRuleId={deletingRuleId}
    />
  );
}
