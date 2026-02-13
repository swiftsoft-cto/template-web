import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';

import { activateTranscriptionRules } from 'api/users';
import { openSnackbar } from 'api/snackbar';
import useAuth from 'hooks/useAuth';
import UpgradePlansSection from 'sections/transcriptions/UpgradePlansSection';
import BatchOffersSection from 'sections/transcriptions/BatchOffersSection';

export default function UpgradePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      const result = await activateTranscriptionRules();
      await refreshUser();
      openSnackbar({
        open: true,
        message: result.message || `Regras de transcrição ativadas com sucesso (${result.data?.activatedCount ?? 13} regras)`,
        variant: 'alert',
        alert: { color: 'success', variant: 'filled' }
      } as any);
      navigate('/transcriptions');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao ativar regras de transcrição.';
      openSnackbar({
        open: true,
        message: msg,
        variant: 'alert',
        alert: { color: 'error', variant: 'filled' }
      } as any);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        py: 4,
        px: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <UpgradePlansSection onSelectPlan={handleSelectPlan} loadingPlanId={loadingPlanId} />
        <BatchOffersSection />
      </Box>
    </Box>
  );
}
