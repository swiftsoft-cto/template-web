import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, CircularProgress, Stack, Typography, Chip, Divider } from '@mui/material';
import EditOutlined from '@ant-design/icons/EditOutlined';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import { getScope } from '../../../api/scopes';
import { Scope } from '../../../types/scopes';
import { openSnackbar } from '../../../api/snackbar';
import MainCard from '../../../components/MainCard';
import { formatDateOnlyBR } from 'utils/date';

// ==============================|| SCOPE VIEW PAGE ||============================== //

export default function ScopeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getScope(id)
        .then((data) => {
          setScope(data);
        })
        .catch((err: any) => {
          console.error('Erro ao carregar escopo:', err);
          openSnackbar({
            open: true,
            message: err.response?.data?.message || 'Erro ao carregar escopo',
            variant: 'alert',
            alert: { color: 'error' }
          } as any);
          navigate('/scopes');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, navigate]);

  const handleEdit = () => {
    if (id) {
      navigate(`/scopes/${id}/edit`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!scope) {
    return null;
  }

  return (
    <MainCard
      title={scope.name || 'Visualizar Escopo'}
      secondary={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/scopes')}>
            Voltar
          </Button>
          <Button variant="contained" startIcon={<EditOutlined />} onClick={handleEdit}>
            Editar
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* Informações do Escopo */}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Projeto
                </Typography>
                <Typography variant="h6">
                  {scope.project?.projectCode} - {scope.project?.projectName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nome do Escopo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {scope.name || '—'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Versão
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={`v${scope.version}`} size="small" color="primary" />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Criado por
                </Typography>
                <Typography variant="body1">
                  {scope.user?.name} ({scope.user?.email})
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Criado em
                </Typography>
                <Typography variant="body1">{formatDateOnlyBR(scope.createdAt)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Atualizado em
                </Typography>
                <Typography variant="body1">{formatDateOnlyBR(scope.updatedAt)}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Brief */}
        {scope.briefText && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Brief do Projeto
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {scope.briefText}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* HTML do Escopo */}
        <Card variant="outlined">
          <CardContent>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'transparent',
                p: 3,
                overflow: 'auto'
              }}
            >
              <Box
                sx={{
                  width: '793.72px',
                  minHeight: '1123px', // Altura A4 (793.72 * 1.414)
                  bgcolor: 'white',
                  color: '#000000',
                  p: 4,
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    marginTop: 2,
                    marginBottom: 1,
                    fontFamily: 'inherit'
                  },
                  '& p': {
                    marginBottom: 1,
                    lineHeight: 1.6
                  },
                  '& ul, & ol': {
                    marginLeft: 3,
                    marginBottom: 1,
                    paddingLeft: 2
                  },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: 2,
                    marginTop: 1
                  },
                  '& table th, & table td': {
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'left'
                  },
                  '& table th': {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 600
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: scope.scopeHtml }}
              />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </MainCard>
  );
}
