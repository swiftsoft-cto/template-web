import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';

import { createContractTemplate, updateContractTemplate } from '../../api/contractTemplates';
import { listProjects } from '../../api/projects';
import { Project } from '../../types/projects';
import { openSnackbar } from '../../api/snackbar';
import useDebounced from '../../utils/useDebounced';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  editingId?: string;
  initial?: {
    name?: string;
    description?: string | null;
    projectId?: string | null;
    templateHtml?: string;
  };
  onSaved: () => void;
};

const schema = Yup.object({
  name: Yup.string().required('Nome do template é obrigatório'),
  description: Yup.string().nullable(),
  projectId: Yup.string().nullable(),
  templateHtml: Yup.string().required('HTML do template é obrigatório')
});

export default function TemplateFormDialog({ open, onClose, editingId, initial, onSaved }: Props) {
  const isEdit = Boolean(editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const debouncedProjectSearch = useDebounced(projectSearch, 500);
  const projectsLoadedRef = React.useRef(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setProjectSearch('');
      setActiveTab(0);
    }
  }, [open]);

  // Carregar projetos quando o termo de busca debounced mudar
  useEffect(() => {
    let alive = true;

    async function run() {
      setProjectLoading(true);
      try {
        const response = await listProjects({
          q: debouncedProjectSearch.trim() || undefined,
          limit: 100
        });
        if (!alive) return;
        setProjects(response.data);
        projectsLoadedRef.current = true;
      } catch (err: any) {
        if (!alive) return;
        console.error('Erro ao carregar projetos:', err);
        setProjects([]);
      } finally {
        if (alive) setProjectLoading(false);
      }
    }

    if (!projectsLoadedRef.current || debouncedProjectSearch.trim()) {
      run();
    }

    return () => {
      alive = false;
    };
  }, [debouncedProjectSearch]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 8
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {isEdit ? <EditOutlined /> : <FileTextOutlined />}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Editar Template' : 'Novo Template'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Atualize as informações do template' : 'Crie um novo template de contrato'}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }
          }}
        >
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <Formik
        enableReinitialize
        initialValues={{
          name: initial?.name || '',
          description: initial?.description || '',
          projectId: initial?.projectId || null,
          templateHtml: initial?.templateHtml || ''
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setIsSubmitting(true);
            setSubmitting(true);

            const payload = {
              name: values.name,
              description: values.description || null,
              projectId: values.projectId || null,
              templateHtml: values.templateHtml
            };

            if (isEdit && editingId) {
              await updateContractTemplate(editingId, payload);
              openSnackbar({
                open: true,
                message: 'Template atualizado com sucesso!',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
            } else {
              await createContractTemplate(payload);
              openSnackbar({
                open: true,
                message: 'Template criado com sucesso!',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
            }

            onSaved();
            handleClose();
          } catch (err: any) {
            openSnackbar({
              open: true,
              message: err?.response?.data?.message || (isEdit ? 'Erro ao atualizar template' : 'Erro ao criar template'),
              variant: 'alert',
              alert: { color: 'error' }
            } as any);
          } finally {
            setIsSubmitting(false);
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting: formikSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Nome do Template *"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    placeholder="Ex: Contrato de Desenvolvimento (Padrão)"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    placeholder="Descrição opcional do template"
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid size={12}>
                  <Autocomplete
                    options={projects}
                    value={projects.find((p) => p.id === values.projectId) || null}
                    onChange={(_, value) => {
                      setFieldValue('projectId', value?.id || null);
                    }}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') {
                        setProjectSearch(value);
                      } else if (reason === 'clear') {
                        setProjectSearch('');
                        setFieldValue('projectId', null);
                      }
                    }}
                    getOptionLabel={(option) => `${option.projectCode} - ${option.projectName}`}
                    loading={projectLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Projeto (opcional)"
                        placeholder="Deixe vazio para template geral ou selecione um projeto específico"
                        helperText="Se não selecionar um projeto, o template ficará disponível para todos os projetos"
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Box sx={{ mb: 2 }}>
                    <Tabs
                      value={activeTab}
                      onChange={(_, newValue) => setActiveTab(newValue)}
                      sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                      <Tab label="Editor" />
                      <Tab label="Preview" />
                    </Tabs>
                  </Box>

                  {activeTab === 0 ? (
                    <TextField
                      fullWidth
                      label="HTML do Template *"
                      name="templateHtml"
                      value={values.templateHtml}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.templateHtml && Boolean(errors.templateHtml)}
                      helperText={
                        touched.templateHtml && errors.templateHtml
                          ? errors.templateHtml
                          : 'Use placeholders como {{CUSTOMER_NAME}}, {{PROJECT_NAME}}, {{SCOPE_HTML}}, etc.'
                      }
                      placeholder="<h1>CONTRATO</h1><p>Cliente: {{CUSTOMER_NAME}}</p><div>{{SCOPE_HTML}}</div>"
                      multiline
                      rows={15}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ) : (
                    <Card variant="outlined" sx={{ minHeight: 400 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                          Preview do HTML
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            overflow: 'auto',
                            p: 2,
                            bgcolor: 'grey.100'
                          }}
                        >
                          <article
                            data-html-lite="1"
                            data-page-w-pt="595.3"
                            data-page-h-pt="841.9"
                            data-page-w-tw="11906"
                            data-page-h-tw="16838"
                            data-header-margin-pt="0"
                            data-footer-margin-pt="28.35"
                            data-gutter-pt="0"
                            data-page-size="A4"
                            data-landscape="false"
                            style={{
                              border: '1px solid #000',
                              whiteSpace: 'normal',
                              fontSize: '11pt',
                              boxSizing: 'border-box',
                              margin: '0 auto',
                              background: 'white',
                              width: '595.3pt',
                              minHeight: '841.9pt',
                              paddingTop: '56.7pt',
                              paddingRight: '56.7pt',
                              paddingBottom: '56.7pt',
                              paddingLeft: '56.7pt',
                              color: '#000000'
                            }}
                            dangerouslySetInnerHTML={{
                              __html:
                                values.templateHtml ||
                                '<p style="color: #999; font-style: italic;">Digite o HTML no editor para ver a pré-visualização...</p>'
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={handleClose} disabled={formikSubmitting || isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={formikSubmitting || isSubmitting}>
                {formikSubmitting || isSubmitting ? <CircularProgress size={20} /> : isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
