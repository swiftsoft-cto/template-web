import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

// Icons
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import TagOutlined from '@ant-design/icons/TagOutlined';

import { getProject } from '../../api/projects';
import { Project, ProjectType } from '../../types/projects';
import { openSnackbar } from '../../api/snackbar';
import { formatDateOnlyBR } from 'utils/date';

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  onEdit?: () => void;
};

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  SOFTWARE: 'Software',
  AGENTS_AI: 'Agents AI',
  CONSULTING: 'Consultoria',
  OTHER: 'Outro'
};

const PROJECT_TYPE_COLORS: Record<ProjectType, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  SOFTWARE: 'primary',
  AGENTS_AI: 'warning',
  CONSULTING: 'info',
  OTHER: 'secondary'
};

export default function ProjectViewDialog({ open, onClose, projectId, onEdit }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (open && projectId) {
      loadProject();
    } else {
      setProject(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao carregar projeto',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    openSnackbar({
      open: true,
      message: `${label} copiado!`,
      variant: 'alert',
      alert: { color: 'success' }
    } as any);
    setTimeout(() => setCopied(null), 2000);
  };

  const InfoItem = ({
    icon,
    label,
    value,
    copyable = false
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | null | undefined;
    copyable?: boolean;
  }) => {
    if (!value) return null;

    return (
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
            {label}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {value}
            </Typography>
            {copyable && (
              <Tooltip title="Copiar">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(value, label)}
                  sx={{
                    width: 24,
                    height: 24,
                    opacity: copied === value ? 0.5 : 1
                  }}
                >
                  <CopyOutlined style={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Stack>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(156, 39, 176, 0.08) 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                boxShadow: 3
              }}
            >
              <FolderOpenOutlined style={{ fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {project?.projectName || 'Carregando...'}
                    </Typography>
                    {project && (
                      <Chip
                        label={PROJECT_TYPE_LABELS[project.projectType]}
                        color={PROJECT_TYPE_COLORS[project.projectType]}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                  {project?.projectCode && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                        <TagOutlined style={{ fontSize: 14 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {project.projectCode}
                      </Typography>
                    </Stack>
                  )}
                </>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            {project && onEdit && (
              <Tooltip title="Editar">
                <IconButton
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main'
                    }
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'error.lighter',
                  color: 'error.main',
                  '& svg': {
                    color: 'error.main'
                  }
                }
              }}
            >
              <CloseOutlined />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : project ? (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Informações Principais */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: 'background.default',
                    borderColor: 'divider',
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                        <FileTextOutlined style={{ fontSize: 18 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Informações do Projeto
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    <InfoItem icon={<TagOutlined />} label="Código do Projeto" value={project.projectCode} copyable />

                    <InfoItem icon={<FileTextOutlined />} label="Nome do Projeto" value={project.projectName} />

                    {project.description && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'primary.main',
                              flexShrink: 0
                            }}
                          >
                            <FileTextOutlined />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                              Descrição
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6
                              }}
                            >
                              {project.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    <InfoItem icon={<UserOutlined />} label="Cliente" value={project.customer?.displayName} />

                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.lighter',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          flexShrink: 0
                        }}
                      >
                        <FileTextOutlined />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                          Contrato assinado
                        </Typography>
                        <Chip
                          label={project.hasSignedContract ? 'Sim' : 'Não'}
                          size="small"
                          color={project.hasSignedContract ? 'success' : 'default'}
                          variant={project.hasSignedContract ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Informações Adicionais */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: 'background.default',
                    borderColor: 'divider',
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ fontSize: 18 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Datas
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    <InfoItem
                      icon={<CalendarOutlined />}
                      label="Criado em"
                      value={project.createdAt ? formatDateOnlyBR(project.createdAt) : undefined}
                    />

                    <InfoItem
                      icon={<EditOutlined />}
                      label="Atualizado em"
                      value={project.updatedAt ? formatDateOnlyBR(project.updatedAt) : undefined}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Projeto não encontrado</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
