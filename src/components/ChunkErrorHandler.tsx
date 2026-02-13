import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { Button, Stack, Typography, Box } from '@mui/material';
import { ReloadOutlined } from '@ant-design/icons';

export default function ChunkErrorHandler() {
  const error = useRouteError();

  useEffect(() => {
    // Detecta erros de importação dinâmica
    const isChunkError =
      (error instanceof Error &&
        (error.message?.includes('Failed to fetch dynamically imported module') ||
          error.message?.includes('Loading chunk') ||
          error.message?.includes('ChunkLoadError'))) ||
      (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        String(error.message).includes('Failed to fetch dynamically imported module'));

    if (isChunkError) {
      // Limpa cache do Service Worker se existir
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name.includes('chunk') || name.includes('index') || name.includes('vite')) {
              caches.delete(name);
            }
          });
        });
      }

      // Tenta recarregar automaticamente após 2 segundos
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const isChunkError =
    (error instanceof Error &&
      (error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('ChunkLoadError'))) ||
    (typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      String(error.message).includes('Failed to fetch dynamically imported module'));

  const handleReload = () => {
    // Limpa cache antes de recarregar
    const reload = () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    if (typeof window !== 'undefined' && 'caches' in window && window.caches) {
      window.caches
        .keys()
        .then((names) => {
          names.forEach((name) => window.caches?.delete(name));
        })
        .finally(() => {
          reload();
        });
    } else {
      reload();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        bgcolor: 'background.default'
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          {isChunkError ? 'Erro ao carregar módulo' : 'Erro na aplicação'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isChunkError
            ? 'Ocorreu um erro ao carregar um módulo da aplicação. Isso geralmente acontece após uma atualização. A página será recarregada automaticamente em alguns segundos.'
            : 'Ocorreu um erro inesperado na aplicação.'}
        </Typography>
        {error instanceof Error && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              width: '100%',
              textAlign: 'left'
            }}
          >
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {error.message}
            </Typography>
          </Box>
        )}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<ReloadOutlined />} onClick={handleReload} size="large">
            Recarregar página agora
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
