import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MainCard from '../../components/MainCard';
import TabMicRecorderDialog from '../../sections/recorder/TabMicRecorderDialog';
import AudioOutlined from '@ant-design/icons/AudioOutlined';

// ==============================|| RECORDER TEST PAGE ||============================== //

export default function RecorderTestPage() {
  const [recOpen, setRecOpen] = useState(false);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Teste de Gravação de Áudio (Aba + Microfone)">
          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary">
              Esta página permite testar a gravação combinada de áudio da aba do navegador e microfone.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Requisitos:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Chrome ou Edge (suporte a getDisplayMedia + MediaRecorder)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                HTTPS ou localhost
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Permissões de microfone e compartilhamento de aba com áudio
              </Typography>
            </Stack>
            <Button variant="contained" startIcon={<AudioOutlined />} onClick={() => setRecOpen(true)} sx={{ alignSelf: 'flex-start' }}>
              Abrir Gravador de Áudio
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      {/* Dialog de gravação */}
      <TabMicRecorderDialog open={recOpen} onClose={() => setRecOpen(false)} />
    </Grid>
  );
}
