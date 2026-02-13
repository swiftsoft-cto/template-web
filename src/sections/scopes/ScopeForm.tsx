import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Grid, Stack, TextField, Typography, Autocomplete, Alert } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { createScope, updateScope, getScope } from '../../api/scopes';
import { listProjects } from '../../api/projects';
import { Project } from '../../types/projects';
import { openSnackbar } from '../../api/snackbar';
import MainCard from '../../components/MainCard';
import useDebounced from '../../utils/useDebounced';

// ==============================|| SCOPE FORM ||============================== //

const schema = Yup.object().shape({
  projectId: Yup.string().required('Projeto é obrigatório'),
  name: Yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  briefText: Yup.string().when('isEdit', {
    is: false,
    then: (schema) => schema.required('Brief é obrigatório para criar um novo escopo'),
    otherwise: (schema) => schema
  })
});

export default function ScopeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scopeHtml, setScopeHtml] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const debouncedProjectSearch = useDebounced(projectSearch, 500);
  const projectsLoadedRef = useRef(false);
  const [initialData, setInitialData] = useState<{
    projectId?: string;
    name?: string;
    briefText?: string;
    scopeHtml?: string;
  } | null>(null);

  // Carregar escopo existente para edição
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getScope(id)
        .then((scope) => {
          setInitialData({
            projectId: scope.projectId,
            name: scope.name,
            briefText: scope.briefText,
            scopeHtml: scope.scopeHtml
          });
          setScopeHtml(scope.scopeHtml);
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
  }, [isEdit, id, navigate]);

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

    // Carrega projetos iniciais na primeira vez ou quando há busca
    if (!projectsLoadedRef.current || debouncedProjectSearch.trim()) {
      run();
    }

    return () => {
      alive = false;
    };
  }, [debouncedProjectSearch]);

  const handleSubmit = async (values: { projectId: string; name: string; briefText: string }) => {
    try {
      setSaving(true);

      if (isEdit && id) {
        // Atualizar escopo
        const payload: any = {};

        // Se o name foi alterado, inclui
        if (values.name && values.name !== initialData?.name) {
          payload.name = values.name;
        }

        // Se o briefText foi alterado, inclui para regenerar o HTML
        if (values.briefText && values.briefText !== initialData?.briefText) {
          payload.briefText = values.briefText;
        }

        // Se o HTML foi editado manualmente, inclui
        if (scopeHtml && scopeHtml !== initialData?.scopeHtml) {
          payload.scopeHtml = scopeHtml;
        }

        await updateScope(id, payload);
        openSnackbar({
          open: true,
          message: 'Escopo atualizado com sucesso!',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
      } else {
        // Criar novo escopo
        const createdScope = await createScope({
          projectId: values.projectId,
          name: values.name,
          briefText: values.briefText
        });
        openSnackbar({
          open: true,
          message: 'Escopo criado com sucesso!',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
        // Redirecionar para a página de edição para que o usuário possa editar o HTML gerado
        navigate(`/scopes/${createdScope.id}/edit`);
        return;
      }

      navigate('/scopes');
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err.response?.data?.message || (isEdit ? 'Erro ao atualizar escopo' : 'Erro ao criar escopo'),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainCard title={isEdit ? 'Editar Escopo' : 'Novo Escopo'}>
      <Formik
        enableReinitialize
        initialValues={{
          projectId: initialData?.projectId || '',
          name: initialData?.name || '',
          briefText: initialData?.briefText || ''
        }}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Projeto */}
              <Grid size={12}>
                <Autocomplete
                  fullWidth
                  options={projects}
                  getOptionLabel={(option) => `${option.projectCode} - ${option.projectName}`}
                  loading={projectLoading}
                  value={projects.find((p) => p.id === values.projectId) || null}
                  onChange={(_, value) => {
                    setFieldValue('projectId', value?.id || '');
                    // Não limpar o search aqui para evitar loop
                  }}
                  onInputChange={(_, value, reason) => {
                    // Só atualiza o search quando o usuário digita, não quando seleciona
                    if (reason === 'input') {
                      setProjectSearch(value);
                    } else if (reason === 'clear') {
                      setProjectSearch('');
                      setFieldValue('projectId', '');
                    }
                  }}
                  disabled={isEdit}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Projeto *"
                      placeholder="Selecione um projeto..."
                      error={touched.projectId && Boolean(errors.projectId)}
                      helperText={touched.projectId && errors.projectId}
                    />
                  )}
                />
              </Grid>

              {/* Nome do Escopo */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Nome do Escopo *"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={(touched.name && errors.name) || 'Identificação do escopo (ex: Escopo Inicial, Escopo v2.0, etc.)'}
                  placeholder="Ex: Escopo Inicial do Projeto"
                />
              </Grid>

              {/* Brief Text - Obrigatório apenas na criação */}
              {!isEdit && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Brief do Projeto *"
                    name="briefText"
                    value={values.briefText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.briefText && Boolean(errors.briefText)}
                    helperText={
                      (touched.briefText && errors.briefText) ||
                      'Descreva o projeto em linguagem natural. A IA irá gerar o escopo automaticamente.'
                    }
                    placeholder="Ex: Preciso de um sistema de gestão de vendas para minha empresa. O sistema deve ter cadastro de clientes, produtos, pedidos e relatórios..."
                  />
                </Grid>
              )}

              {/* Brief Text - Opcional na edição */}
              {isEdit && (
                <Grid size={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Para regenerar o HTML automaticamente, atualize o campo Brief abaixo. Caso contrário, edite o HTML diretamente no
                    editor.
                  </Alert>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Brief do Projeto (opcional - regenera HTML)"
                    name="briefText"
                    value={values.briefText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Atualize o brief para regenerar o HTML automaticamente..."
                  />
                </Grid>
              )}

              {/* HTML do Escopo */}
              <Grid size={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Texto do Escopo {isEdit ? '' : '(gerado automaticamente)'}
                </Typography>

                {!isEdit && !scopeHtml ? (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'action.hover'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      O HTML será gerado automaticamente pela IA após criar o escopo com o brief acima.
                    </Typography>
                  </Box>
                ) : scopeHtml ? (
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
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        setScopeHtml(e.currentTarget.innerHTML);
                      }}
                      sx={{
                        width: '793.72px',
                        minHeight: '1123px', // Altura A4 (793.72 * 1.414)
                        bgcolor: 'white',
                        color: '#000000',
                        p: 4,
                        outline: 'none',
                        '&:focus': {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                          outlineOffset: '2px'
                        },
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
                      dangerouslySetInnerHTML={{ __html: scopeHtml }}
                    />
                  </Box>
                ) : null}
                {!isEdit && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Após criar o escopo, você será redirecionado para a página de edição onde poderá editar o HTML gerado.
                  </Typography>
                )}
              </Grid>

              {/* Botões */}
              <Grid size={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/scopes')} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? <CircularProgress size={20} /> : isEdit ? 'Salvar' : 'Criar'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </MainCard>
  );
}
