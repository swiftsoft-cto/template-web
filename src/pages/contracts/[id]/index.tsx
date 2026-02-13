import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MainCard from 'components/MainCard';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

import EditOutlined from '@ant-design/icons/EditOutlined';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import FileWordOutlined from '@ant-design/icons/FileWordOutlined';
import FilePdfOutlined from '@ant-design/icons/FilePdfOutlined';

import { exportContractToDocx, exportContractToPdf, getContract, updateContract } from 'api/contracts';
import { Contract } from 'types/contracts';
import { openSnackbar } from 'api/snackbar';
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog';
import { triggerBrowserDownload, formatContractFilename } from 'utils/download';

const STATUS_COLORS: Record<Contract['status'], 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  final: 'success',
  signed: 'primary',
  canceled: 'error'
};

const STATUS_LABELS: Record<Contract['status'], string> = {
  draft: 'Rascunho',
  final: 'Final',
  signed: 'Assinado',
  canceled: 'Cancelado'
};

export default function ContractViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [confirm, setConfirm] = useState<null | {
    title: string;
    description: string;
    confirmText: string;
    action: () => Promise<void>;
  }>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getContract(id)
        .then((data) => {
          setContract(data);
        })
        .catch((err: any) => {
          console.error('Erro ao carregar contrato:', err);
          openSnackbar({
            open: true,
            message: err.response?.data?.message || 'Erro ao carregar contrato',
            variant: 'alert',
            alert: { color: 'error' }
          } as any);
          navigate('/contracts');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contract) {
    return null;
  }

  const canEdit = !contract.isLocked && contract.status !== 'signed';
  const canLock = !contract.isLocked; // bloquear é permitido inclusive se assinado
  const canUnlock = contract.isLocked && contract.status !== 'signed';
  const canMarkFinal = contract.status !== 'signed' && !contract.isLocked && contract.status !== 'final';
  const canSign = contract.status === 'final' && !contract.isLocked;

  const runAction = (action: () => Promise<void>) => async () => {
    try {
      setActionLoading(true);
      await action();
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const downloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const { blob } = await exportContractToDocx(contract.id);
      const filename = formatContractFilename(contract.title, contract.customer?.displayName, 'docx');
      triggerBrowserDownload(blob, filename);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao baixar DOCX',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const { blob } = await exportContractToPdf(contract.id);
      const filename = formatContractFilename(contract.title, contract.customer?.displayName, 'pdf');
      triggerBrowserDownload(blob, filename);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao baixar PDF',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard
          title={
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/contracts')} variant="text">
                Voltar
              </Button>
              <Typography variant="h4">{contract.title || `Contrato #${contract.id.slice(0, 8)}`}</Typography>
              <Chip label={STATUS_LABELS[contract.status]} size="small" color={STATUS_COLORS[contract.status]} />
              {contract.isLocked && <Chip label="Bloqueado" size="small" color="warning" variant="outlined" />}
            </Stack>
          }
          secondary={
            <Stack direction="row" spacing={1}>
              <Button startIcon={<FileWordOutlined />} variant="outlined" onClick={downloadDocx} disabled={downloadingDocx}>
                {downloadingDocx ? 'Baixando...' : 'Baixar DOCX'}
              </Button>
              <Button startIcon={<FilePdfOutlined />} variant="outlined" onClick={downloadPdf} disabled={downloadingPdf}>
                {downloadingPdf ? 'Baixando...' : 'Baixar PDF'}
              </Button>
              <Button
                startIcon={<EditOutlined />}
                variant="contained"
                disabled={!canEdit}
                onClick={() => navigate(`/contracts/${contract.id}/edit`)}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color={contract.isLocked ? 'secondary' : 'warning'}
                disabled={actionLoading || (!canLock && !canUnlock)}
                onClick={() => {
                  if (canLock) {
                    setConfirm({
                      title: 'Bloquear contrato',
                      description: 'Ao bloquear, este contrato não poderá ser editado nem deletado. Deseja continuar?',
                      confirmText: 'Bloquear',
                      action: async () => {
                        const updated = await updateContract(contract.id, { isLocked: true });
                        setContract(updated);
                        openSnackbar({
                          open: true,
                          message: 'Contrato bloqueado com sucesso!',
                          variant: 'alert',
                          alert: { color: 'success' }
                        } as any);
                      }
                    });
                  } else if (canUnlock) {
                    setConfirm({
                      title: 'Desbloquear contrato',
                      description: 'Deseja desbloquear este contrato para permitir edições?',
                      confirmText: 'Desbloquear',
                      action: async () => {
                        const updated = await updateContract(contract.id, { isLocked: false });
                        setContract(updated);
                        openSnackbar({
                          open: true,
                          message: 'Contrato desbloqueado com sucesso!',
                          variant: 'alert',
                          alert: { color: 'success' }
                        } as any);
                      }
                    });
                  }
                }}
              >
                {contract.isLocked ? 'Desbloquear' : 'Bloquear'}
              </Button>
              <Button
                variant="outlined"
                disabled={actionLoading || !canMarkFinal}
                onClick={() =>
                  setConfirm({
                    title: 'Marcar como final',
                    description: 'Deseja marcar este contrato como FINAL?',
                    confirmText: 'Marcar como final',
                    action: async () => {
                      const updated = await updateContract(contract.id, { status: 'final' });
                      setContract(updated);
                      openSnackbar({
                        open: true,
                        message: 'Contrato marcado como FINAL!',
                        variant: 'alert',
                        alert: { color: 'success' }
                      } as any);
                    }
                  })
                }
              >
                Marcar como final
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={actionLoading || !canSign}
                onClick={() =>
                  setConfirm({
                    title: 'Assinar contrato',
                    description: 'Ao assinar, o contrato ficará imutável. Deseja continuar?',
                    confirmText: 'Assinar',
                    action: async () => {
                      const updated = await updateContract(contract.id, { status: 'signed' });
                      setContract(updated);
                      openSnackbar({
                        open: true,
                        message: 'Contrato assinado com sucesso!',
                        variant: 'alert',
                        alert: { color: 'success' }
                      } as any);
                    }
                  })
                }
              >
                Assinar
              </Button>
            </Stack>
          }
        >
          <Stack spacing={3}>
            {/* Informações do contrato */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={4} flexWrap="wrap">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cliente
                      </Typography>
                      <Typography variant="body1">{contract.customer?.displayName || '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Projeto
                      </Typography>
                      <Typography variant="body1">
                        {contract.project ? `${contract.project.projectCode} - ${contract.project.projectName}` : '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Template
                      </Typography>
                      <Typography variant="body1">{contract.template?.name || '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1">
                        <Chip label={STATUS_LABELS[contract.status]} size="small" color={STATUS_COLORS[contract.status]} />
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Autentique Document ID
                      </Typography>
                      <Typography variant="body1">{contract.autentiqueDocumentId || '—'}</Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={4} flexWrap="wrap">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Criado em
                      </Typography>
                      <Typography variant="body1">{new Date(contract.createdAt).toLocaleString('pt-BR')}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Atualizado em
                      </Typography>
                      <Typography variant="body1">{new Date(contract.updatedAt).toLocaleString('pt-BR')}</Typography>
                    </Box>
                  </Stack>
                  {contract.unresolvedPlaceholders && contract.unresolvedPlaceholders.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="warning.main" fontWeight={600}>
                          Placeholders não resolvidos:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                          {contract.unresolvedPlaceholders.map((placeholder, idx) => (
                            <Chip key={idx} label={placeholder} size="small" color="warning" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* HTML do Contrato */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Contrato Renderizado
                </Typography>
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
                      minHeight: '1123px',
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
                    dangerouslySetInnerHTML={{ __html: contract.contractHtml }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </MainCard>
      </Grid>

      <ConfirmDeleteDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description={confirm?.description}
        confirmText={confirm?.confirmText}
        cancelText="Cancelar"
        loading={actionLoading}
        variant={confirm?.title?.toLowerCase().includes('assinar') ? 'confirm' : 'delete'}
        confirmColor={confirm?.title?.toLowerCase().includes('assinar') ? 'success' : 'error'}
        onCancel={() => {
          if (actionLoading) return;
          setConfirm(null);
        }}
        onConfirm={() => {
          if (!confirm) return;
          runAction(confirm.action)();
        }}
      />
    </Grid>
  );
}
