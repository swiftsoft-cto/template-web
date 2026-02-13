import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';

import EyeOutlined from '@ant-design/icons/EyeOutlined';

import { createContract, updateContract, getContract, previewContract } from '../../api/contracts';
import { listProjects } from '../../api/projects';
import { listCustomers } from '../../api/customers';
import { listContractTemplates } from '../../api/contractTemplates';
import { listScopes } from '../../api/scopes';
import { searchUsers } from '../../api/users';
import { Project } from '../../types/projects';
import { Customer } from '../../api/customers';
import { UserRow } from '../../types/users';
import { ContractTemplate } from '../../types/contracts';
import { Scope } from '../../types/scopes';
import { ContractStatus } from '../../types/contracts';
import { openSnackbar } from '../../api/snackbar';
import MainCard from '../../components/MainCard';
import useDebounced from '../../utils/useDebounced';
import React from 'react';

const schema = Yup.object()
  .shape({
    projectId: Yup.string().nullable(),
    customerId: Yup.string().nullable(),
    userId: Yup.string().nullable(),
    templateId: Yup.string().required('Template é obrigatório'),
    scopeId: Yup.string().nullable(),
    title: Yup.string().nullable()
  })
  .test('contract-type-validation', 'É necessário fornecer (Projeto e Cliente) ou Colaborador', function (value) {
    const hasProjectAndCustomer = Boolean(value?.projectId && value?.customerId);
    const hasUser = Boolean(value?.userId);
    return hasProjectAndCustomer || hasUser;
  });

export default function ContractForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contractHtml, setContractHtml] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Autocompletes
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const debouncedProjectSearch = useDebounced(projectSearch, 500);
  const projectsLoadedRef = useRef(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomerSearch = useDebounced(customerSearch, 500);
  const customersLoadedRef = useRef(false);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebounced(userSearch, 500);
  const usersLoadedRef = useRef(false);

  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [, setTemplateSearch] = useState('');
  const templatesLoadedRef = useRef(false);

  const [scopes, setScopes] = useState<Scope[]>([]);
  const [scopeLoading, setScopeLoading] = useState(false);
  const [scopeSearch, setScopeSearch] = useState('');
  const debouncedScopeSearch = useDebounced(scopeSearch, 500);
  const scopesLoadedRef = useRef(false);

  const [variables, setVariables] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);

  const [initialData, setInitialData] = useState<{
    projectId?: string | null;
    customerId?: string | null;
    userId?: string | null;
    templateId?: string;
    scopeId?: string | null;
    title?: string | null;
    autentiqueDocumentId?: string | null;
    monthlyValue?: number | null;
    monthsCount?: number | null;
    firstPaymentDay?: number | null;
    status?: ContractStatus;
    isLocked?: boolean;
  } | null>(null);

  const isReadOnly = Boolean(isEdit && (initialData?.isLocked || initialData?.status === 'signed'));

  // Carregar contrato existente para edição
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getContract(id)
        .then((contract) => {
          setInitialData({
            projectId: contract.projectId || null,
            customerId: contract.customerId || null,
            userId: contract.userId || null,
            templateId: contract.templateId,
            scopeId: contract.scopeId || null,
            title: contract.title || null,
            autentiqueDocumentId: contract.autentiqueDocumentId || null,
            monthlyValue: contract.monthlyValue || null,
            monthsCount: contract.monthsCount || null,
            firstPaymentDay: contract.firstPaymentDay || null,
            status: contract.status,
            isLocked: contract.isLocked
          });
          setContractHtml(contract.contractHtml);
          if (contract.variables) {
            const vars = Object.entries(contract.variables).map(([key, value]) => ({ key, value }));
            setVariables(vars.length > 0 ? vars : [{ key: '', value: '' }]);
          }
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
  }, [isEdit, id, navigate]);

  // Carregar projetos
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

  // Carregar clientes
  useEffect(() => {
    let alive = true;
    async function run() {
      setCustomerLoading(true);
      try {
        const response = await listCustomers({
          search: debouncedCustomerSearch.trim() || undefined,
          limit: 100
        });
        if (!alive) return;
        setCustomers(response.data);
        customersLoadedRef.current = true;
      } catch (err: any) {
        if (!alive) return;
        console.error('Erro ao carregar clientes:', err);
        setCustomers([]);
      } finally {
        if (alive) setCustomerLoading(false);
      }
    }
    if (!customersLoadedRef.current || debouncedCustomerSearch.trim()) {
      run();
    }
    return () => {
      alive = false;
    };
  }, [debouncedCustomerSearch]);

  // Carregar usuários
  useEffect(() => {
    let alive = true;
    async function run() {
      setUserLoading(true);
      try {
        const response = await searchUsers({
          search: debouncedUserSearch.trim() || undefined,
          limit: 100
        });
        if (!alive) return;
        setUsers(response.data);
        usersLoadedRef.current = true;
      } catch (err: any) {
        if (!alive) return;
        console.error('Erro ao carregar usuários:', err);
        setUsers([]);
      } finally {
        if (alive) setUserLoading(false);
      }
    }
    if (!usersLoadedRef.current || debouncedUserSearch.trim()) {
      run();
    }
    return () => {
      alive = false;
    };
  }, [debouncedUserSearch]);

  // Carregar templates
  useEffect(() => {
    let alive = true;
    async function run() {
      setTemplateLoading(true);
      try {
        const response = await listContractTemplates({
          limit: 100
        });
        if (!alive) return;
        setTemplates(response.data);
        templatesLoadedRef.current = true;
      } catch (err: any) {
        if (!alive) return;
        console.error('Erro ao carregar templates:', err);
        setTemplates([]);
      } finally {
        if (alive) setTemplateLoading(false);
      }
    }
    if (!templatesLoadedRef.current) {
      run();
    }
    return () => {
      alive = false;
    };
  }, []);

  // Função para carregar escopos quando projeto mudar
  const selectedProjectIdRef = useRef<string | null>(null);
  const loadScopesForProject = async (projectId: string, nameFilter?: string) => {
    if (!projectId) return;
    selectedProjectIdRef.current = projectId;
    setScopeLoading(true);
    try {
      const response = await listScopes({
        projectId,
        name: nameFilter?.trim() || undefined,
        limit: 100
      });
      setScopes(response.data);
      scopesLoadedRef.current = true;
    } catch (err: any) {
      console.error('Erro ao carregar escopos:', err);
      setScopes([]);
    } finally {
      setScopeLoading(false);
    }
  };

  // Carregar escopos quando projeto inicial for definido na edição
  useEffect(() => {
    if (initialData?.projectId && !scopesLoadedRef.current) {
      loadScopesForProject(initialData.projectId);
    }
  }, [initialData?.projectId]);

  // Recarregar escopos quando a busca por nome mudar (se houver projeto selecionado)
  useEffect(() => {
    if (selectedProjectIdRef.current) {
      loadScopesForProject(selectedProjectIdRef.current, debouncedScopeSearch);
    }
  }, [debouncedScopeSearch]);

  const handlePreview = async (values: any) => {
    const hasProjectAndCustomer = values.projectId && values.customerId;
    const hasUser = values.userId;

    if (!hasProjectAndCustomer && !hasUser) {
      openSnackbar({
        open: true,
        message: 'Preencha (Projeto e Cliente) ou Colaborador, e Template para visualizar o preview',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }

    if (!values.templateId) {
      openSnackbar({
        open: true,
        message: 'Template é obrigatório',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }

    try {
      setPreviewing(true);
      const varsObj: Record<string, string> = {};
      variables.forEach((v) => {
        if (v.key.trim()) {
          varsObj[v.key.trim()] = v.value;
        }
      });

      const preview = await previewContract({
        projectId: values.projectId || null,
        customerId: values.customerId || null,
        userId: values.userId || null,
        templateId: values.templateId,
        scopeId: values.scopeId || null,
        title: values.title || null,
        monthlyValue: values.monthlyValue || null,
        monthsCount: values.monthsCount || null,
        firstPaymentDay: values.firstPaymentDay || null,
        variables: Object.keys(varsObj).length > 0 ? varsObj : undefined
      });

      setPreviewData(preview);
      setContractHtml(preview.contractHtml);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao gerar preview',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit && isReadOnly) {
        openSnackbar({
          open: true,
          message: 'Este contrato está bloqueado ou assinado e não pode ser editado.',
          variant: 'alert',
          alert: { color: 'warning' }
        } as any);
        return;
      }

      setSaving(true);

      const varsObj: Record<string, string> = {};
      variables.forEach((v) => {
        if (v.key.trim()) {
          varsObj[v.key.trim()] = v.value;
        }
      });

      if (isEdit && id) {
        const payload: any = {};
        // Envia título também na edição (permite limpar enviando null)
        const initialTitle = initialData?.title ?? '';
        if ((values.title ?? '') !== initialTitle) {
          payload.title = values.title ? values.title : null;
        }
        // ID do documento no Autentique (permite limpar enviando null)
        const initialAutentiqueId = initialData?.autentiqueDocumentId ?? '';
        if ((values.autentiqueDocumentId ?? '') !== initialAutentiqueId) {
          payload.autentiqueDocumentId = values.autentiqueDocumentId ? values.autentiqueDocumentId : null;
        }
        // Campos de pagamento
        const initialMonthlyValue = initialData?.monthlyValue ?? null;
        if ((values.monthlyValue ?? null) !== initialMonthlyValue) {
          payload.monthlyValue = values.monthlyValue || null;
        }
        const initialMonthsCount = initialData?.monthsCount ?? null;
        if ((values.monthsCount ?? null) !== initialMonthsCount) {
          payload.monthsCount = values.monthsCount || null;
        }
        const initialFirstPaymentDay = initialData?.firstPaymentDay ?? null;
        if ((values.firstPaymentDay ?? null) !== initialFirstPaymentDay) {
          payload.firstPaymentDay = values.firstPaymentDay || null;
        }
        if (Object.keys(varsObj).length > 0) {
          payload.variables = varsObj;
        }
        if (contractHtml) {
          payload.contractHtml = contractHtml;
        }

        await updateContract(id, payload);
        openSnackbar({
          open: true,
          message: 'Contrato atualizado com sucesso!',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
      } else {
        const created = await createContract({
          projectId: values.projectId || null,
          customerId: values.customerId || null,
          userId: values.userId || null,
          templateId: values.templateId,
          scopeId: values.scopeId || null,
          title: values.title || null,
          monthlyValue: values.monthlyValue || null,
          monthsCount: values.monthsCount || null,
          firstPaymentDay: values.firstPaymentDay || null,
          variables: Object.keys(varsObj).length > 0 ? varsObj : undefined
        });
        openSnackbar({
          open: true,
          message: 'Contrato criado com sucesso!',
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
        navigate(`/contracts/${created.id}/edit`);
        return;
      }

      navigate('/contracts');
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err.response?.data?.message || (isEdit ? 'Erro ao atualizar contrato' : 'Erro ao criar contrato'),
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
    <MainCard title={isEdit ? 'Editar Contrato' : 'Novo Contrato'}>
      <Formik
        enableReinitialize
        initialValues={{
          projectId: initialData?.projectId || '',
          customerId: initialData?.customerId || '',
          userId: initialData?.userId || '',
          templateId: initialData?.templateId || '',
          scopeId: initialData?.scopeId || null,
          title: initialData?.title || '',
          autentiqueDocumentId: initialData?.autentiqueDocumentId || '',
          monthlyValue: initialData?.monthlyValue || null,
          monthsCount: initialData?.monthsCount || null,
          firstPaymentDay: initialData?.firstPaymentDay || null
        }}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => {
          const isCollaboratorContract = Boolean(values.userId);
          const isProjectContract = Boolean(values.projectId && values.customerId);

          return (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Tipo de Contrato - Alerta informativo */}
                {!isEdit && (
                  <Grid size={12}>
                    <Alert severity="info">
                      Selecione <strong>(Projeto e Cliente)</strong> para contrato de projeto ou <strong>Colaborador</strong> para contrato
                      de colaborador.
                    </Alert>
                  </Grid>
                )}

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
                      // Se selecionou projeto, limpa colaborador
                      if (value?.id) {
                        setFieldValue('userId', '');
                      }
                      // Recarrega escopos quando projeto mudar
                      if (value?.id) {
                        loadScopesForProject(value.id, debouncedScopeSearch);
                      } else {
                        setScopes([]);
                        setFieldValue('scopeId', null);
                        selectedProjectIdRef.current = null;
                      }
                    }}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') setProjectSearch(value);
                      else if (reason === 'clear') {
                        setProjectSearch('');
                        setFieldValue('projectId', '');
                        setFieldValue('scopeId', null);
                        setScopes([]);
                      }
                    }}
                    disabled={isEdit || isCollaboratorContract}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Projeto"
                        placeholder="Selecione um projeto..."
                        error={touched.projectId && Boolean(errors.projectId)}
                        helperText={
                          (touched.projectId && errors.projectId) ||
                          (isCollaboratorContract ? 'Não disponível para contrato de colaborador' : '')
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Cliente */}
                <Grid size={12}>
                  <Autocomplete
                    fullWidth
                    options={customers}
                    getOptionLabel={(option) => option.displayName || option.name || option.id}
                    loading={customerLoading}
                    value={customers.find((c) => c.id === values.customerId) || null}
                    onChange={(_, value) => {
                      setFieldValue('customerId', value?.id || '');
                      // Se selecionou cliente, limpa colaborador
                      if (value?.id) {
                        setFieldValue('userId', '');
                      }
                    }}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') setCustomerSearch(value);
                      else if (reason === 'clear') {
                        setCustomerSearch('');
                        setFieldValue('customerId', '');
                      }
                    }}
                    disabled={isEdit || isCollaboratorContract}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        placeholder="Selecione um cliente..."
                        error={touched.customerId && Boolean(errors.customerId)}
                        helperText={
                          (touched.customerId && errors.customerId) ||
                          (isCollaboratorContract ? 'Não disponível para contrato de colaborador' : '')
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Colaborador */}
                <Grid size={12}>
                  <Autocomplete
                    fullWidth
                    options={users}
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    loading={userLoading}
                    value={users.find((u) => u.id === values.userId) || null}
                    onChange={(_, value) => {
                      setFieldValue('userId', value?.id || '');
                      // Se selecionou colaborador, limpa projeto e cliente
                      if (value?.id) {
                        setFieldValue('projectId', '');
                        setFieldValue('customerId', '');
                        setFieldValue('scopeId', null);
                        setScopes([]);
                        selectedProjectIdRef.current = null;
                      }
                    }}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') setUserSearch(value);
                      else if (reason === 'clear') {
                        setUserSearch('');
                        setFieldValue('userId', '');
                      }
                    }}
                    disabled={isEdit || isProjectContract}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Colaborador"
                        placeholder="Selecione um colaborador..."
                        error={touched.userId && Boolean(errors.userId)}
                        helperText={
                          (touched.userId && errors.userId) || (isProjectContract ? 'Não disponível para contrato de projeto' : '')
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Template */}
                <Grid size={12}>
                  <Autocomplete
                    fullWidth
                    options={templates.filter((t) => !t.projectId || t.projectId === values.projectId)}
                    getOptionLabel={(option) => option.name}
                    loading={templateLoading}
                    value={templates.find((t) => t.id === values.templateId) || null}
                    onChange={(_, value) => {
                      setFieldValue('templateId', value?.id || '');
                    }}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') setTemplateSearch(value);
                      else if (reason === 'clear') {
                        setTemplateSearch('');
                        setFieldValue('templateId', '');
                      }
                    }}
                    disabled={isEdit}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Template *"
                        placeholder="Selecione um template..."
                        error={touched.templateId && Boolean(errors.templateId)}
                        helperText={touched.templateId && errors.templateId}
                      />
                    )}
                  />
                </Grid>

                {/* Escopo (opcional) - apenas para contratos de projeto */}
                {!isCollaboratorContract && (
                  <Grid size={12}>
                    <Autocomplete
                      fullWidth
                      options={scopes}
                      getOptionLabel={(option) => option.name || `Escopo ${option.id.slice(0, 8)}` || 'Sem nome'}
                      loading={scopeLoading}
                      value={scopes.find((s) => s.id === values.scopeId) || null}
                      onChange={(_, value) => {
                        setFieldValue('scopeId', value?.id || null);
                      }}
                      onInputChange={(_, value, reason) => {
                        if (reason === 'input') setScopeSearch(value);
                        else if (reason === 'clear') {
                          setScopeSearch('');
                          setFieldValue('scopeId', null);
                        }
                      }}
                      disabled={isEdit || !values.projectId}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {option.name || `Escopo ${option.id.slice(0, 8)}`}
                            </Typography>
                            {option.version && (
                              <Typography variant="caption" color="text.secondary">
                                Versão {option.version}
                              </Typography>
                            )}
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Escopo (opcional)"
                          placeholder="Selecione um escopo do projeto..."
                          helperText={
                            isEdit
                              ? 'O escopo não pode ser alterado após a criação do contrato.'
                              : !values.projectId
                                ? 'Selecione um projeto primeiro'
                                : 'O HTML do escopo será inserido no placeholder {{SCOPE_HTML}}'
                          }
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Título */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Título do Contrato (opcional)"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Contrato de Desenvolvimento de Software"
                    disabled={isReadOnly}
                  />
                </Grid>

                {/* Campos de Pagamento */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Valor Mensal (opcional)"
                    name="monthlyValue"
                    type="number"
                    value={values.monthlyValue || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldValue('monthlyValue', val ? parseFloat(val) : null);
                    }}
                    onBlur={handleBlur}
                    placeholder="Ex: 17000"
                    helperText="Valor mensal do contrato em R$"
                    disabled={isReadOnly}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>R$</Typography>
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Quantidade de Meses (opcional)"
                    name="monthsCount"
                    type="number"
                    value={values.monthsCount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldValue('monthsCount', val ? parseInt(val, 10) : null);
                    }}
                    onBlur={handleBlur}
                    placeholder="Ex: 12"
                    helperText="Número de meses de pagamento"
                    disabled={isReadOnly}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Dia do Primeiro Pagamento (opcional)"
                    name="firstPaymentDay"
                    type="number"
                    value={values.firstPaymentDay || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = val ? parseInt(val, 10) : null;
                      if (num === null || (num >= 1 && num <= 31)) {
                        setFieldValue('firstPaymentDay', num);
                      }
                    }}
                    onBlur={handleBlur}
                    placeholder="Ex: 10"
                    helperText="Dia do mês (1-31)"
                    disabled={isReadOnly}
                    inputProps={{ min: 1, max: 31 }}
                  />
                </Grid>

                {/* Autentique Document ID */}
                {isEdit && (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Autentique Document ID (opcional)"
                      name="autentiqueDocumentId"
                      value={values.autentiqueDocumentId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ex: 89c7d2ab31f9f5a13b3d20ecf53319af387e54d240ae7be993"
                      helperText="Use este campo para associar o documento do Autentique a este contrato."
                      disabled={isReadOnly}
                    />
                  </Grid>
                )}

                {/* Variáveis extras */}
                <Grid size={12}>
                  <Accordion>
                    <AccordionSummary>
                      <Typography variant="subtitle1">Variáveis Extras (opcional)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Adicione variáveis customizadas que serão substituídas no template. Ex: CONTRACT_CITY, CONTRACT_DATE, etc.
                        </Typography>
                        {variables.map((variable, index) => (
                          <Stack key={index} direction="row" spacing={2} alignItems="center">
                            <TextField
                              label="Chave"
                              value={variable.key}
                              onChange={(e) => {
                                const newVars = [...variables];
                                newVars[index].key = e.target.value.toUpperCase().replace(/\s/g, '_');
                                setVariables(newVars);
                              }}
                              placeholder="CONTRACT_CITY"
                              sx={{ flex: 1 }}
                              disabled={isReadOnly}
                            />
                            <TextField
                              label="Valor"
                              value={variable.value}
                              onChange={(e) => {
                                const newVars = [...variables];
                                newVars[index].value = e.target.value;
                                setVariables(newVars);
                              }}
                              placeholder="Londrina/PR"
                              sx={{ flex: 1 }}
                              disabled={isReadOnly}
                            />
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                if (variables.length > 1) {
                                  setVariables(variables.filter((_, i) => i !== index));
                                }
                              }}
                              disabled={isReadOnly || variables.length <= 1}
                            >
                              Remover
                            </Button>
                          </Stack>
                        ))}
                        <Button
                          variant="outlined"
                          onClick={() => setVariables([...variables, { key: '', value: '' }])}
                          disabled={isReadOnly}
                        >
                          Adicionar Variável
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Preview e criação */}
                {!isEdit && (
                  <Grid size={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        startIcon={<EyeOutlined />}
                        onClick={() => handlePreview(values)}
                        disabled={previewing || !values.templateId || ((!values.projectId || !values.customerId) && !values.userId)}
                      >
                        {previewing ? <CircularProgress size={20} /> : 'Preview'}
                      </Button>
                    </Stack>
                  </Grid>
                )}

                {/* Alerta de placeholders não resolvidos */}
                {previewData && previewData.unresolvedPlaceholders && previewData.unresolvedPlaceholders.length > 0 && (
                  <Grid size={12}>
                    <Alert severity="warning">
                      <Typography variant="subtitle2" gutterBottom>
                        Placeholders não resolvidos:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {previewData.unresolvedPlaceholders.map((ph: string, idx: number) => (
                          <Chip key={idx} label={ph} size="small" color="warning" variant="outlined" />
                        ))}
                      </Stack>
                    </Alert>
                  </Grid>
                )}

                {/* HTML do Contrato */}
                {contractHtml && (
                  <Grid size={12}>
                    {isEdit && isReadOnly && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Este contrato está <strong>{initialData?.status === 'signed' ? 'assinado' : 'bloqueado'}</strong> e não pode ser
                        editado.
                      </Alert>
                    )}
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
                        contentEditable={isEdit && !isReadOnly}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (isEdit && !isReadOnly) {
                            setContractHtml(e.currentTarget.innerHTML);
                          }
                        }}
                        sx={{
                          width: '793.72px',
                          minHeight: '1123px',
                          bgcolor: 'white',
                          color: '#000000',
                          p: 4,
                          outline: isEdit && !isReadOnly ? 'none' : undefined,
                          '&:focus':
                            isEdit && !isReadOnly
                              ? {
                                  outline: '2px solid',
                                  outlineColor: 'primary.main',
                                  outlineOffset: '2px'
                                }
                              : undefined,
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
                        dangerouslySetInnerHTML={{ __html: contractHtml }}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Botões */}
                <Grid size={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => navigate('/contracts')} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={saving || isReadOnly}>
                      {saving ? <CircularProgress size={20} /> : isEdit ? 'Salvar' : 'Criar Contrato'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          );
        }}
      </Formik>
    </MainCard>
  );
}
