import { useEffect, useMemo, useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '../../components/@extended/Tooltip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import MainCard from '../../components/MainCard';
import Box from '@mui/material/Box';

import SaveOutlined from '@ant-design/icons/SaveOutlined';
import ClearOutlined from '@ant-design/icons/CloseCircleOutlined';

import * as Yup from 'yup';
import { Formik } from 'formik';

import { Company, getCompany, updateCompany } from '../../api/company';
import { openSnackbar } from '../../api/snackbar';
import UserSelect from '../../components/inputs/UserSelect';
import { usePermission } from '../../hooks/usePermission';
import type { UserBasic } from '../../api/users';
import { formatPhoneBR, formatCNPJ, bindMask, digitsOnly } from '../../utils/mask';

const schema = Yup.object({
  name: Yup.string().required('Nome é obrigatório').min(2, 'Mínimo 2 caracteres'),
  tradeName: Yup.string().nullable(),
  website: Yup.string()
    .nullable()
    .test('url-or-null', 'URL deve ser válida (ex.: https://site.com)', (value) => {
      if (!value) return true; // deixa limpar apagando
      try {
        // valida URL; se não tiver protocolo, falha
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }),
  phone: Yup.string()
    .nullable()
    .test('phone-digits', 'Telefone deve ter 10 a 11 dígitos', (v) => {
      if (!v) return true;
      const d = digitsOnly(v);
      return d.length === 10 || d.length === 11;
    }),
  cnpj: Yup.string()
    .nullable()
    .test('cnpj-14', 'CNPJ deve ter exatamente 14 dígitos', (v) => {
      if (!v) return true;
      return digitsOnly(v).length === 14;
    })
});

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<Company | null>(null);
  const [submitting] = useState(false);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const cnpjRef = useRef<HTMLInputElement | null>(null);
  const canUpdate = usePermission('company.update');

  // novo: responsável pela assinatura
  const [resp, setResp] = useState<UserBasic | null>(null);
  const [clearResp, setClearResp] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCompany();
      setInitial(data);
      // pré-preenche o responsável se existir
      if (data.signatureUser) {
        setResp(data.signatureUser);
      } else {
        setResp(null);
      }
      setClearResp(false);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Falha ao carregar empresa',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const initValues = useMemo(
    () => ({
      name: initial?.name || '',
      tradeName: initial?.tradeName ?? '',
      website: initial?.website ?? '',
      phone: initial?.phone ? formatPhoneBR(initial.phone) : '',
      cnpj: initial?.cnpj ? formatCNPJ(initial.cnpj) : ''
    }),
    [initial]
  );

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard title="Empresa" contentSX={{ p: 0 }}>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Box sx={{ p: 2 }}>
              <Formik
                enableReinitialize
                initialValues={initValues}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  try {
                    setSubmitting(true);

                    // Backend aceita máscara para phone/cnpj (serão normalizados para dígitos).
                    // Para limpar phone/cnpj, envie string vazia -> o backend converte em null.
                    // Para website, mantenha vazio para não alterar (o backend atualmente não aceita "" como null).
                    const payload: any = {
                      name: values.name.trim(),
                      tradeName: values.tradeName?.trim() || '',
                      website: values.website?.trim() || undefined,
                      phone: values.phone?.trim() ?? '',
                      cnpj: values.cnpj?.trim() ?? '',
                      // responsável
                      ...(clearResp ? { signatureUserId: null } : resp ? { signatureUserId: resp.id } : {})
                    };

                    const res = await updateCompany(payload);
                    openSnackbar({
                      open: true,
                      message: res.message || 'Empresa atualizada!',
                      variant: 'alert',
                      alert: { color: 'success' }
                    } as any);
                    await fetchData();
                  } catch (err: any) {
                    const msg = err?.response?.data?.message || err.message || 'Falha ao salvar';
                    setErrors({ name: msg });
                    openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, isSubmitting }) => (
                  <Stack spacing={2}>
                    <Stack gap={1}>
                      <InputLabel htmlFor="name">Nome *</InputLabel>
                      <OutlinedInput
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.name && errors.name)}
                        disabled={!canUpdate}
                        readOnly={!canUpdate}
                      />
                      {touched.name && errors.name && <FormHelperText error>{errors.name as string}</FormHelperText>}
                    </Stack>

                    <Stack gap={1}>
                      <InputLabel htmlFor="tradeName">Nome Fantasia</InputLabel>
                      <OutlinedInput
                        id="tradeName"
                        name="tradeName"
                        value={values.tradeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={!canUpdate}
                        readOnly={!canUpdate}
                      />
                    </Stack>

                    <Stack gap={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <InputLabel htmlFor="website">Website</InputLabel>
                        <Tooltip title="Limpar campo (não envia valor)">
                          <span></span>
                        </Tooltip>
                      </Stack>
                      <OutlinedInput
                        id="website"
                        name="website"
                        placeholder="https://minhaempresa.com.br"
                        value={values.website}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.website && errors.website)}
                        disabled={!canUpdate}
                        readOnly={!canUpdate}
                      />
                      {touched.website && errors.website && <FormHelperText error>{errors.website as string}</FormHelperText>}
                    </Stack>

                    <Stack gap={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <InputLabel htmlFor="phone">Telefone</InputLabel>
                        {canUpdate && (
                          <Tooltip title="Limpar telefone">
                            <span>
                              <IconButton size="small" onClick={() => setFieldValue('phone', '')}>
                                <ClearOutlined />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                      <OutlinedInput
                        id="phone"
                        name="phone"
                        inputRef={phoneRef}
                        placeholder="(11) 91234-5678"
                        value={values.phone}
                        onChange={bindMask('phone', setFieldValue, formatPhoneBR, phoneRef)}
                        onBlur={handleBlur}
                        error={Boolean(touched.phone && errors.phone)}
                        disabled={!canUpdate}
                        readOnly={!canUpdate}
                      />
                      {touched.phone && errors.phone && <FormHelperText error>{errors.phone as string}</FormHelperText>}
                    </Stack>

                    <Stack gap={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <InputLabel htmlFor="cnpj">CNPJ</InputLabel>
                        {canUpdate && (
                          <Tooltip title="Limpar CNPJ">
                            <span>
                              <IconButton size="small" onClick={() => setFieldValue('cnpj', '')}>
                                <ClearOutlined />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                      <OutlinedInput
                        id="cnpj"
                        name="cnpj"
                        inputRef={cnpjRef}
                        placeholder="12.345.678/0001-90"
                        value={values.cnpj}
                        onChange={bindMask('cnpj', setFieldValue, formatCNPJ, cnpjRef)}
                        onBlur={handleBlur}
                        error={Boolean(touched.cnpj && errors.cnpj)}
                        disabled={!canUpdate}
                        readOnly={!canUpdate}
                      />
                      {touched.cnpj && errors.cnpj && <FormHelperText error>{errors.cnpj as string}</FormHelperText>}
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Usuário responsável */}
                    <Stack gap={1}>
                      <InputLabel>Usuário responsável</InputLabel>
                      <UserSelect
                        value={resp}
                        onChange={(u) => {
                          setResp(u);
                          setClearResp(false);
                        }}
                        onClear={() => {
                          setResp(null);
                          setClearResp(true);
                        }}
                        placeholder="Digite para buscar usuários…"
                        disabled={!canUpdate}
                      />
                    </Stack>

                    {canUpdate && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          startIcon={<SaveOutlined />}
                          onClick={() => handleSubmit()}
                          disabled={isSubmitting || submitting}
                        >
                          Salvar
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Formik>
            </Box>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
