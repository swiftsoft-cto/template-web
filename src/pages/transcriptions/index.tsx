import React, { useState, useEffect } from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { ArrowLeftOutlined, FolderOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Permission from '../../components/Permission';
import TranscriptionsExplorer from '../../sections/transcriptions/TranscriptionsExplorer';
import TranscriptionsSharedWithMe from '../../sections/transcriptions/TranscriptionsSharedWithMe';

type TabValue = 'mine' | 'shared';

type RestoreSharedState = { sharedByUserId: string; folderId?: string | null };

// ==============================|| TRANSCRIPTIONS PAGE (EXPLORER) ||============================== //

export default function TranscriptionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<TabValue>('mine');

  const state = location.state as { tab?: TabValue; sharedByUserId?: string; folderId?: string | null } | undefined;
  const restoreSharedState: RestoreSharedState | undefined =
    state?.tab === 'shared' && state?.sharedByUserId
      ? { sharedByUserId: state.sharedByUserId, folderId: state.folderId ?? null }
      : undefined;

  useEffect(() => {
    if (state?.tab === 'shared') setTab('shared');
    if (state?.tab === 'mine') setTab('mine');
  }, [state?.tab]);

  return (
    <Permission
      rule="transcriptions.read"
      fallback={
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Sem permissão para visualizar transcrições.
          </Typography>
          <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Box>
      }
    >
      <Box>
        <Tabs
          value={tab}
          onChange={(_, v: TabValue) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab value="mine" label="Minhas transcrições" icon={<FolderOutlined />} iconPosition="start" />
          <Tab value="shared" label="Compartilhadas comigo" icon={<TeamOutlined />} iconPosition="start" />
        </Tabs>
        {tab === 'mine' && <TranscriptionsExplorer />}
        {tab === 'shared' && <TranscriptionsSharedWithMe restoreState={restoreSharedState} />}
      </Box>
    </Permission>
  );
}
