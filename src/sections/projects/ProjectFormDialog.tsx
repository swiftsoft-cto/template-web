import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Icons
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';

import { createProject, updateProject } from '../../api/projects';
import { ProjectType } from '../../types/projects';
import { Customer } from '../../api/customers';
import { openSnackbar } from '../../api/snackbar';

type Props = {
  open: boolean;
  onClose: () => void;
  editingId?: string | null;
  initial?: {
    projectName?: string;
    projectCode?: string;
    description?: string | null;
    projectType?: ProjectType;
    customerId?: string;
  };
  onSaved: () => void;
  customers: Customer[];
  customerLoading: boolean;
  onCustomerSearch: (q: string) => void;
};

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'AGENTS_AI', label: 'Agents AI' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'OTHER', label: 'Outro' }
];

const schema = Yup.object({
  projectName: Yup.string().required('Nome do projeto é obrigatório'),
  projectCode: Yup.string().required('Código do projeto é obrigatório'),
  description: Yup.string().nullable(),
  projectType: Yup.string().oneOf(['SOFTWARE', 'AGENTS_AI', 'CONSULTING', 'OTHER']).required('Tipo do projeto é obrigatório'),
  customerId: Yup.string().required('Cliente é obrigatório')
});

export default function ProjectFormDialog({
  open,
  onClose,
  editingId,
  initial,
  onSaved,
  customers,
  customerLoading,
  onCustomerSearch
}: Props) {
  const isEdit = Boolean(editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const findCustomerById = (id?: string | null) => {
    if (!id) return null;
    return customers.find((c) => c.id === id) || null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
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
            {isEdit ? <EditOutlined /> : <FolderOpenOutlined />}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Atualize as informações do projeto' : 'Configure um novo projeto'}
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
          projectName: initial?.projectName || '',
          projectCode: initial?.projectCode || '',
          description: initial?.description || '',
          projectType: initial?.projectType || 'SOFTWARE',
          customerId: initial?.customerId || ''
        }}
        validationSchema={schema}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            setIsSubmitting(true);
            const payload = {
              projectName: values.projectName.trim(),
              projectCode: values.projectCode.trim(),
              description: values.description?.trim() || null,
              projectType: values.projectType as ProjectType,
              customerId: values.customerId
            };

            if (isEdit && editingId) {
              await updateProject(editingId, payload);
              openSnackbar({
                open: true,
                message: 'Projeto atualizado com sucesso!',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
            } else {
              await createProject(payload);
              openSnackbar({
                open: true,
                message: 'Projeto criado com sucesso!',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
            }

            onSaved();
            onClose();
          } catch (err: any) {
            const msg = err?.response?.data?.message || err.message || 'Erro ao salvar projeto';
            // Tenta identificar qual campo causou o erro
            if (msg.toLowerCase().includes('código') || msg.toLowerCase().includes('projectcode')) {
              setErrors({ projectCode: msg });
            } else if (msg.toLowerCase().includes('cliente') || msg.toLowerCase().includes('customer')) {
              setErrors({ customerId: msg });
            } else {
              openSnackbar({
                open: true,
                message: msg,
                variant: 'alert',
                alert: { color: 'error' }
              } as any);
            }
          } finally {
            setIsSubmitting(false);
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue }) => (
          <>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="projectName">Nome do Projeto *</InputLabel>
                    <OutlinedInput
                      id="projectName"
                      name="projectName"
                      value={values.projectName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.projectName && errors.projectName)}
                      placeholder="Ex: Sistema de Gestão"
                      fullWidth
                    />
                    {touched.projectName && errors.projectName && <FormHelperText error>{errors.projectName}</FormHelperText>}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="projectCode">Código do Projeto *</InputLabel>
                    <OutlinedInput
                      id="projectCode"
                      name="projectCode"
                      value={values.projectCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.projectCode && errors.projectCode)}
                      placeholder="Ex: SG-001"
                      fullWidth
                    />
                    {touched.projectCode && errors.projectCode && <FormHelperText error>{errors.projectCode}</FormHelperText>}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="projectType">Tipo do Projeto *</InputLabel>
                    <FormControl fullWidth error={Boolean(touched.projectType && errors.projectType)}>
                      <Select
                        id="projectType"
                        name="projectType"
                        value={values.projectType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        input={<OutlinedInput label="Tipo do Projeto" />}
                      >
                        {PROJECT_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.projectType && errors.projectType && <FormHelperText error>{errors.projectType}</FormHelperText>}
                    </FormControl>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="customerId">Cliente *</InputLabel>
                    <Autocomplete
                      id="customerId"
                      options={customers}
                      getOptionLabel={(option) => option.displayName || ''}
                      loading={customerLoading}
                      value={findCustomerById(values.customerId)}
                      onChange={(_, value) => {
                        setFieldValue('customerId', value?.id || '');
                      }}
                      onInputChange={(_, value) => {
                        onCustomerSearch(value);
                      }}
                      onBlur={handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.customerId && errors.customerId)}
                          helperText={touched.customerId && errors.customerId ? errors.customerId : undefined}
                          placeholder="Selecione um cliente..."
                        />
                      )}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="description">Descrição</InputLabel>
                    <OutlinedInput
                      id="description"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Descrição do projeto (opcional)"
                      multiline
                      rows={4}
                      fullWidth
                    />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                onClick={() => handleSubmit()}
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
              >
                {isEdit ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}
