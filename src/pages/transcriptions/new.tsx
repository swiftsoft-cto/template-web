import React, { useState, useCallback } from 'react';
import { Box, Button, Card, CardContent, Typography, CircularProgress, alpha, useTheme } from '@mui/material';
import { ArrowLeftOutlined, UploadOutlined, AudioOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createTranscription } from '../../api/transcriptions';
import { openSnackbar } from '../../api/snackbar';
import Permission from '../../components/Permission';

// ==============================|| TRANSCRIÇÃO NOVA (UPLOAD) ||============================== //

const ACCEPT = 'audio/*,video/*,.m4a,.mp3,.mp4,.webm,.ogg,.wav';

/** Tamanho máximo do arquivo: 500 MB */
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

/** Diarização sempre ativa nos bastidores (identificação de locutores: Sp1, Sp2, etc.) */
const DIARIZATION_ALWAYS_ENABLED = true;

export default function TranscriptionNewPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = useCallback(
    (f: File | null) => {
      if (f && f.size > MAX_FILE_SIZE_BYTES) {
        openSnackbar({
          open: true,
          message: `Arquivo muito grande. O tamanho máximo permitido é 500 MB. (Selecionado: ${formatFileSize(f.size)})`,
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
        setFile(null);
        return;
      }
      setFile(f ?? null);
    },
    []
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] ?? null);
    e.target.value = ''; // permite reselecionar o mesmo arquivo após erro de tamanho
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files?.[0];
      if (
        dropped &&
        (dropped.type.startsWith('audio/') || dropped.type.startsWith('video/') || /\.(m4a|mp3|mp4|webm|ogg|wav)$/i.test(dropped.name))
      ) {
        handleFileChange(dropped);
      }
    },
    [handleFileChange]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      openSnackbar({
        open: true,
        message: 'Selecione um arquivo de áudio ou vídeo.',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      openSnackbar({
        open: true,
        message: `Arquivo muito grande. O tamanho máximo permitido é 500 MB.`,
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
      return;
    }
    setSubmitting(true);
    try {
      await createTranscription({ file, diarizationEnabled: DIARIZATION_ALWAYS_ENABLED });
      openSnackbar({
        open: true,
        message: 'Transcrição enviada para processamento.',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      navigate('/transcriptions');
    } catch (err) {
      console.error(err);
      openSnackbar({
        open: true,
        message: 'Erro ao criar transcrição.',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => navigate('/transcriptions');

  return (
    <Permission
      rule="transcriptions.create"
      fallback={
        <Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Sem permissão para criar transcrições.
          </Typography>
          <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={handleBack}>
            Voltar
          </Button>
        </Box>
      }
    >
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={600}>
            Nova transcrição
          </Typography>
          <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={handleBack} size="medium">
            Voltar
          </Button>
        </Box>

        <Card
          variant="outlined"
          sx={{
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Envie um arquivo de áudio ou vídeo. A transcrição será gerada com identificação automática dos locutores (Sp1, Sp2, etc.).
            </Typography>

            <Box
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: dragOver ? alpha(theme.palette.primary.main, 0.04) : 'action.hover',
                transition: 'background-color 0.2s, border-color 0.2s',
                py: 4,
                px: 2,
                textAlign: 'center',
                mb: 3
              }}
            >
              <input type="file" id="transcription-file" accept={ACCEPT} onChange={onInputChange} style={{ display: 'none' }} />
              <Button
                variant="outlined"
                component="label"
                htmlFor="transcription-file"
                startIcon={file ? undefined : <UploadOutlined />}
                fullWidth
                sx={{
                  py: 2,
                  textTransform: 'none',
                  justifyContent: 'center',
                  border: 'none',
                  bgcolor: 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: 'none'
                  }
                }}
              >
                {file ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <AudioOutlined style={{ fontSize: 20, color: theme.palette.primary.main }} />
                    <Typography variant="body1" fontWeight={500}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({formatFileSize(file.size)})
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">Clique ou arraste um arquivo aqui</Typography>
                )}
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Formatos: áudio (MP3, WAV, M4A, OGG, WebM) ou vídeo (MP4, WebM). Tamanho máximo: 500 MB.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={handleBack} disabled={submitting}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!file || submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {submitting ? 'Enviando...' : 'Transcrever'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Permission>
  );
}
