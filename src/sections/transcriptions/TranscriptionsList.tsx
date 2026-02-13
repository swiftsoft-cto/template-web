import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material';
import { PlusOutlined, AudioOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Transcription } from '../../types/transcriptions';
import { listTranscriptions } from '../../api/transcriptions';
import { openSnackbar } from '../../api/snackbar';
import { getRealtimeSocket } from '../../api/realtime';
import Permission from '../../components/Permission';
import ShareTranscriptionDialog from './ShareTranscriptionDialog';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

// ==============================|| TRANSCRIPTIONS LIST ||============================== //

export default function TranscriptionsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTranscriptionStatus = useCallback(
    (data: { id: string; status: string; title?: string | null; errorMessage?: string | null }) => {
      setItems((prev) => {
        const idx = prev.findIndex((t) => t.id === data.id);
        if (idx < 0) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: data.status as Transcription['status'], errorMessage: data.errorMessage ?? null };
        return updated;
      });
      if (data.status === 'done') {
        openSnackbar({
          open: true,
          message: `Transcrição "${data.title || 'pronta'}" finalizada com sucesso.`,
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
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTranscriptions({ page: 1, limit: 50 })
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error(err);
          openSnackbar({
            open: true,
            message: 'Erro ao carregar transcrições.',
            variant: 'alert',
            alert: { color: 'error' }
          } as any);
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getRealtimeSocket();
    socket.on('transcription:status', handleTranscriptionStatus);
    return () => {
      socket.off('transcription:status', handleTranscriptionStatus);
    };
  }, [handleTranscriptionStatus]);

  const handleNew = () => {
    navigate('/transcriptions/new');
  };

  const handleView = (t: Transcription) => {
    if (t.status !== 'done') {
      openSnackbar({
        open: true,
        message: 'Aguarde a transcrição ser concluída para abrir.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }
    navigate(`/transcriptions/${t.id}`);
  };

  const [shareDialog, setShareDialog] = useState<{ id: string; title: string } | null>(null);
  const openShare = (e: React.MouseEvent, t: Transcription) => {
    e.stopPropagation();
    setShareDialog({ id: t.id, title: t.title });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Transcrições
        </Typography>
        <Permission rule="transcriptions.create">
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleNew}>
            Transcrever
          </Button>
        </Permission>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Arquivo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duração</TableCell>
                <TableCell>Diarização</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhuma transcrição. Transcreva um áudio ou vídeo para começar.</Typography>
                    <Permission rule="transcriptions.create">
                      <Button variant="outlined" startIcon={<AudioOutlined />} onClick={handleNew} sx={{ mt: 2 }}>
                        Transcrever
                      </Button>
                    </Permission>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((t) => (
                  <TableRow
                    key={t.id}
                    hover={t.status === 'done'}
                    sx={{ cursor: t.status === 'done' ? 'pointer' : 'default' }}
                    onClick={() => handleView(t)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {t.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t.sourceFileName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {t.status === 'processing' && (
                        <Chip label="Processando" size="small" color="info" icon={<CircularProgress size={14} color="inherit" />} />
                      )}
                      {t.status === 'done' && <Chip label="Pronto" size="small" color="success" />}
                      {t.status === 'error' && <Chip label="Erro" size="small" color="error" />}
                      {!t.status && (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{t.durationFormatted}</TableCell>
                    <TableCell>{t.diarizationEnabled ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{formatDateTime(t.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Permission rule={['transcription_shares.create', 'transcription_shares.read']}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={t.status !== 'done'}
                          onClick={(e) => openShare(e, t)}
                          startIcon={<ShareAltOutlined />}
                        >
                          Compartilhar
                        </Button>
                      </Permission>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ShareTranscriptionDialog
        open={!!shareDialog}
        onClose={() => setShareDialog(null)}
        transcriptionId={shareDialog?.id ?? null}
        transcriptionTitle={shareDialog?.title}
      />
    </Box>
  );
}
