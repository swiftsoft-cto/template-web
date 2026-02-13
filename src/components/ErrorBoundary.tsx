import { Component, ReactNode } from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Se for erro de importação dinâmica, tenta recarregar após um delay
    if (error.message?.includes('Failed to fetch dynamically imported module')) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('ChunkLoadError');

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
              {isChunkError ? 'Erro ao carregar módulo' : 'Erro inesperado'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isChunkError
                ? 'Ocorreu um erro ao carregar um módulo da aplicação. Isso geralmente acontece após uma atualização. A página será recarregada automaticamente.'
                : 'Ocorreu um erro inesperado na aplicação.'}
            </Typography>
            {this.state.error && (
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
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            <Button variant="contained" startIcon={<ReloadOutlined />} onClick={this.handleReload} size="large">
              Recarregar página
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
