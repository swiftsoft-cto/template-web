import { useEffect, useRef, useState } from 'react';
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
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { useTheme } from '@mui/material/styles';

import * as Yup from 'yup';
import { Formik } from 'formik';
import { bindMask, formatCPF, formatCNPJ, formatPhoneBR, formatCEP, digitsOnly } from 'utils/mask';
import { openSnackbar } from 'api/snackbar';
import { createUser, updateUser, listRoles } from 'api/users';
import { isAdminRoleName } from 'utils/roles';
import useAuth from 'hooks/useAuth';

type Props = {
  open: boolean;
  onClose: () => void;
  editingId?: string | null;
  initial?: {
    name?: string;
    email?: string;
    phone?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    birthdate?: string | null;
    postalCode?: string | null;
    address?: string | null;
    addressState?: string | null;
    addressCity?: string | null;
    addressNeighborhood?: string | null;
    service?: string | null;
    emailVerifiedAt?: string | null; // para controlar se mostra campo de senha
    // 👇 NOVO (para edição)
    roleId?: string | null;
    roleName?: string | null;
  };
  onSaved: () => void;
};

const passwordRules = Yup.string()
  .min(8, 'Mínimo 8 caracteres')
  .matches(/[A-Z]/, 'Pelo menos 1 letra maiúscula (A-Z)')
  .matches(/[a-z]/, 'Pelo menos 1 letra minúscula (a-z)')
  .matches(/[0-9]/, 'Pelo menos 1 número (0-9)')
  .matches(/[^A-Za-z0-9]/, 'Pelo menos 1 caractere especial');

type RoleOption = { id: string; name: string; description?: string | null };

export default function UserFormDialog({ open, onClose, editingId, initial, onSaved }: Props) {
  const theme = useTheme();
  const { user: currentUser, updateProfile } = useAuth();
  const cpfRef = useRef<HTMLInputElement | null>(null);
  const cnpjRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const postalCodeRef = useRef<HTMLInputElement | null>(null);

  const isEdit = Boolean(editingId);

  // Detecta se o usuário atual está sendo editado
  const isEditingCurrentUser = isEdit && currentUser && editingId && currentUser.id && editingId === currentUser.id;

  // ------ verificação de campos sensíveis disponíveis ------
  // Se o campo não vier do backend (undefined), não deve aparecer no formulário
  // Para criação de usuário, sempre incluir os campos sensíveis
  const hasPhone = isEdit ? initial?.phone !== undefined : true;
  const hasCPF = isEdit ? initial?.cpf !== undefined : true;
  const hasCNPJ = true; // CNPJ sempre disponível na criação e edição
  const hasBirthdate = isEdit ? initial?.birthdate !== undefined : true;

  // ------ estado de cargos (autocomplete) ------
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');
  const [searchingCEP, setSearchingCEP] = useState(false);

  const loadRoles = async (q: string) => {
    setRoleLoading(true);
    try {
      const res = await listRoles({ page: 1, limit: 20, search: q || undefined });
      setRoles(res.data.map((r) => ({ id: r.id, name: r.name, description: r.description ?? null })));
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadRoles('');
  }, [open]);

  // helper para achar a option pelo id (quando abrimos edição com role atual)
  const findRoleById = (id?: string | null) =>
    roles.find((r) => r.id === id) || (id && initial?.roleName ? { id, name: initial.roleName, description: null } : null);

  // Busca dados do CEP no ViaCEP
  const searchCEP = async (cep: string, setFieldValue: any) => {
    const cleanCep = digitsOnly(cep);
    if (cleanCep.length !== 8) {
      openSnackbar({
        open: true,
        message: 'CEP deve ter 8 dígitos',
        variant: 'alert',
        alert: { color: 'warning' }
      } as any);
      return;
    }

    try {
      setSearchingCEP(true);
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        openSnackbar({
          open: true,
          message: 'CEP não encontrado',
          variant: 'alert',
          alert: { color: 'warning' }
        } as any);
        return;
      }

      // Preenche automaticamente os campos do endereço
      setFieldValue('address', data.logradouro || '', false);
      setFieldValue('addressNeighborhood', data.bairro || '', false);
      setFieldValue('addressCity', data.localidade || '', false);
      setFieldValue('addressState', data.uf || '', false);
      setFieldValue('postalCode', formatCEP(cleanCep), false);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      openSnackbar({
        open: true,
        message: 'Erro ao buscar CEP. Tente novamente.',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSearchingCEP(false);
    }
  };

  const schema = Yup.object({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
    // Campos sensíveis: só validam se estiverem disponíveis no backend
    phone: isEdit && !hasPhone ? Yup.string().optional() : Yup.string().nullable(),
    cpf: isEdit && !hasCPF ? Yup.string().optional() : isEdit ? Yup.string().nullable() : Yup.string().required('CPF é obrigatório'),
    cnpj: isEdit && !hasCNPJ ? Yup.string().optional() : Yup.string().nullable(),
    birthdate: isEdit && !hasBirthdate ? Yup.string().optional() : Yup.string().nullable(),
    password: isEdit
      ? Yup.string()
          .optional()
          .nullable()
          .test('pw', 'Senha fraca', (v) => !v || passwordRules.isValidSync(v))
      : passwordRules.required('Senha é obrigatória'),
    confirmPassword: isEdit
      ? Yup.string()
          .optional()
          .nullable()
          .when('password', {
            is: (password: string) => password && password.length > 0,
            then: (schema) => schema.required('Confirme a nova senha').oneOf([Yup.ref('password')], 'As senhas devem ser iguais'),
            otherwise: (schema) => schema.optional().nullable()
          })
      : Yup.string()
          .required('Confirme a senha')
          .oneOf([Yup.ref('password')], 'As senhas devem ser iguais'),
    roleId: isEdit ? Yup.string().nullable() : Yup.string().required('Função é obrigatória')
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar colaborador' : 'Novo colaborador'}</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={{
          name: initial?.name || '',
          email: initial?.email || '',
          // Campos sensíveis: inicializam baseado na disponibilidade
          phone: hasPhone ? (initial?.phone ? formatPhoneBR(String(initial.phone)) : '') : '',
          cpf: hasCPF ? (initial?.cpf ? formatCPF(String(initial.cpf)) : '') : '',
          cnpj: initial?.cnpj ? formatCNPJ(String(initial.cnpj)) : '', // CNPJ sempre disponível
          birthdate: hasBirthdate ? (initial?.birthdate ? String(initial.birthdate).slice(0, 10) : '') : '',
          postalCode: initial?.postalCode ? formatCEP(String(initial.postalCode)) : '',
          address: initial?.address || '',
          addressState: initial?.addressState || '',
          addressCity: initial?.addressCity || '',
          addressNeighborhood: initial?.addressNeighborhood || '',
          service: initial?.service || '',
          password: '',
          confirmPassword: '',
          // 👇 NOVO (controlamos o id no form)
          roleId: initial?.roleId ?? null
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            if (isEdit && editingId) {
              const removendoAdminDaPropriaConta =
                isEditingCurrentUser &&
                isAdminRoleName(initial?.roleName) &&
                !isAdminRoleName(findRoleById(values.roleId)?.name);
              if (removendoAdminDaPropriaConta) {
                const msg = 'Você não pode remover a função de administrador da sua própria conta.';
                setErrors({ email: msg });
                openSnackbar({
                  open: true,
                  message: msg,
                  variant: 'alert',
                  alert: { color: 'error' }
                } as any);
                setSubmitting(false);
                return;
              }
              const response = await updateUser(editingId, {
                name: values.name,
                email: values.email,
                // Campos sensíveis: só envia se estiverem disponíveis no backend
                ...(hasPhone ? { phone: values.phone ? digitsOnly(values.phone) : null } : {}),
                ...(hasCPF ? { cpf: values.cpf ? digitsOnly(values.cpf) : null } : {}),
                cnpj: values.cnpj ? digitsOnly(values.cnpj) : null, // CNPJ sempre enviado
                ...(hasBirthdate ? { birthdate: values.birthdate || null } : {}),
                postalCode: values.postalCode ? digitsOnly(values.postalCode) : null,
                address: values.address || null,
                addressState: values.addressState || null,
                addressCity: values.addressCity || null,
                addressNeighborhood: values.addressNeighborhood || null,
                service: values.service || null,
                ...(values.password ? { password: values.password } : {}),
                // 👇 envia o roleId (string para definir/trocar, null para limpar)
                ...(values.roleId !== undefined ? { roleId: values.roleId } : {})
              });

              // Se estiver editando o usuário atual, atualiza o contexto
              if (isEditingCurrentUser && currentUser) {
                const updatedUser = {
                  ...currentUser,
                  name: values.name,
                  email: values.email,
                  ...(hasPhone ? { phone: values.phone || undefined } : {}),
                  ...(hasCPF ? { cpf: values.cpf || undefined } : {}),
                  cnpj: values.cnpj || undefined, // CNPJ sempre atualizado
                  ...(hasBirthdate ? { birthdate: values.birthdate || undefined } : {})
                };
                updateProfile(updatedUser);
              }

              openSnackbar({
                open: true,
                message: response.message || 'Colaborador atualizado!',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
              if (isAdminRoleName(initial?.roleName) && !isAdminRoleName(findRoleById(values.roleId)?.name)) {
                openSnackbar({
                  open: true,
                  message: 'Atenção: administrador removido deste usuário.',
                  variant: 'alert',
                  alert: { color: 'warning' }
                } as any);
              }
            } else {
              const response = await createUser({
                name: values.name,
                email: values.email,
                // Campos sensíveis: sempre envia na criação
                phone: values.phone ? digitsOnly(values.phone) : null,
                cpf: values.cpf ? digitsOnly(values.cpf) : null,
                cnpj: values.cnpj ? digitsOnly(values.cnpj) : null,
                birthdate: values.birthdate || null,
                postalCode: values.postalCode ? digitsOnly(values.postalCode) : null,
                address: values.address || null,
                addressState: values.addressState || null,
                addressCity: values.addressCity || null,
                addressNeighborhood: values.addressNeighborhood || null,
                service: values.service || null,
                password: values.password,
                // 👇 roleId é obrigatório no create
                roleId: values.roleId!
              });
              openSnackbar({
                open: true,
                message: response.message || 'Colaborador criado!',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
            }
            onSaved();
            onClose();
          } catch (err: any) {
            const msg = err?.response?.data?.message || err.message || 'Erro ao salvar';
            setErrors({ email: msg });
            openSnackbar({
              open: true,
              message: msg,
              variant: 'alert',
              alert: { color: 'error' }
            } as any);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue }) => (
          <>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="name">Nome *</InputLabel>
                    <OutlinedInput
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.name && errors.name)}
                    />
                    {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email">E-mail *</InputLabel>
                    <OutlinedInput
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.email && errors.email)}
                      autoComplete="email"
                      inputProps={{
                        autoComplete: 'email',
                        'data-form-type': 'user-registration'
                      }}
                    />
                    {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Telefone - só mostra se o campo estiver disponível no backend */}
                {(isEdit ? hasPhone : true) && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="phone">Telefone</InputLabel>
                      <OutlinedInput
                        id="phone"
                        name="phone"
                        inputRef={phoneRef}
                        value={values.phone}
                        onChange={bindMask('phone', setFieldValue, formatPhoneBR, phoneRef)}
                        onBlur={handleBlur}
                        error={Boolean(touched.phone && errors.phone)}
                        placeholder="(11) 99999-9999"
                      />
                      {touched.phone && errors.phone && <FormHelperText error>{errors.phone}</FormHelperText>}
                    </Stack>
                  </Grid>
                )}

                {/* CPF - só mostra se o campo estiver disponível no backend */}
                {(isEdit ? hasCPF : true) && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="cpf">CPF {!isEdit && '*'}</InputLabel>
                      <OutlinedInput
                        id="cpf"
                        name="cpf"
                        inputRef={cpfRef}
                        value={values.cpf}
                        onChange={bindMask('cpf', setFieldValue, formatCPF, cpfRef)}
                        onBlur={handleBlur}
                        error={Boolean(touched.cpf && errors.cpf)}
                        placeholder={isEdit ? '000.000.000-00' : '000.000.000-00 (obrigatório)'}
                      />
                      {touched.cpf && errors.cpf && <FormHelperText error>{errors.cpf}</FormHelperText>}
                    </Stack>
                  </Grid>
                )}

                {/* CNPJ - sempre disponível na criação e edição */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="cnpj">CNPJ</InputLabel>
                    <OutlinedInput
                      id="cnpj"
                      name="cnpj"
                      inputRef={cnpjRef}
                      value={values.cnpj}
                      onChange={bindMask('cnpj', setFieldValue, formatCNPJ, cnpjRef)}
                      onBlur={handleBlur}
                      error={Boolean(touched.cnpj && errors.cnpj)}
                      placeholder="00.000.000/0000-00"
                    />
                    {touched.cnpj && errors.cnpj && <FormHelperText error>{errors.cnpj}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Data de nascimento - só mostra se o campo estiver disponível no backend */}
                {(isEdit ? hasBirthdate : true) && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="birthdate" shrink>
                        Data de nascimento
                      </InputLabel>
                      <OutlinedInput
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={values.birthdate || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.birthdate && errors.birthdate)}
                      />
                      {touched.birthdate && errors.birthdate && <FormHelperText error>{errors.birthdate}</FormHelperText>}
                    </Stack>
                  </Grid>
                )}

                {/* CEP */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="postalCode">CEP</InputLabel>
                    <OutlinedInput
                      id="postalCode"
                      name="postalCode"
                      inputRef={postalCodeRef}
                      value={values.postalCode}
                      onChange={bindMask('postalCode', setFieldValue, formatCEP, postalCodeRef)}
                      onBlur={handleBlur}
                      error={Boolean(touched.postalCode && errors.postalCode)}
                      placeholder="00000-000"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => searchCEP(values.postalCode, setFieldValue)}
                            disabled={searchingCEP || digitsOnly(values.postalCode).length !== 8}
                            size="small"
                          >
                            {searchingCEP ? <CircularProgress size={18} /> : <SearchOutlined />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {touched.postalCode && errors.postalCode && <FormHelperText error>{errors.postalCode}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Endereço */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="address">Endereço</InputLabel>
                    <OutlinedInput
                      id="address"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.address && errors.address)}
                      placeholder="Rua, Avenida, etc."
                    />
                    {touched.address && errors.address && <FormHelperText error>{errors.address}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Bairro */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="addressNeighborhood">Bairro</InputLabel>
                    <OutlinedInput
                      id="addressNeighborhood"
                      name="addressNeighborhood"
                      value={values.addressNeighborhood}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.addressNeighborhood && errors.addressNeighborhood)}
                      placeholder="Nome do bairro"
                    />
                    {touched.addressNeighborhood && errors.addressNeighborhood && (
                      <FormHelperText error>{errors.addressNeighborhood}</FormHelperText>
                    )}
                  </Stack>
                </Grid>

                {/* Cidade */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="addressCity">Cidade</InputLabel>
                    <OutlinedInput
                      id="addressCity"
                      name="addressCity"
                      value={values.addressCity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.addressCity && errors.addressCity)}
                      placeholder="Nome da cidade"
                    />
                    {touched.addressCity && errors.addressCity && <FormHelperText error>{errors.addressCity}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Estado */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="addressState">Estado (UF)</InputLabel>
                    <OutlinedInput
                      id="addressState"
                      name="addressState"
                      value={values.addressState}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().slice(0, 2);
                        setFieldValue('addressState', value);
                      }}
                      onBlur={handleBlur}
                      error={Boolean(touched.addressState && errors.addressState)}
                      placeholder="UF"
                      inputProps={{ maxLength: 2 }}
                    />
                    {touched.addressState && errors.addressState && <FormHelperText error>{errors.addressState}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Serviço */}
                <Grid size={{ xs: 12 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="service">Serviço</InputLabel>
                    <OutlinedInput
                      id="service"
                      name="service"
                      value={values.service}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.service && errors.service)}
                      placeholder="Descrição do serviço prestado"
                    />
                    {touched.service && errors.service && <FormHelperText error>{errors.service}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* 👇 NOVO: Seletor de Função (Role) */}
                <Grid size={{ xs: 12 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>Função {!isEdit && '*'}</InputLabel>
                    <Autocomplete<RoleOption>
                      options={roles}
                      loading={roleLoading}
                      value={findRoleById(values.roleId) || null}
                      onChange={(_, opt) => setFieldValue('roleId', opt ? opt.id : null)}
                      onInputChange={(_, v) => {
                        setRoleQuery(v);
                      }}
                      onClose={() => roleQuery && loadRoles(roleQuery)}
                      getOptionLabel={(opt) => opt?.name ?? ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={isEdit ? 'Buscar e selecionar a função' : 'Selecione uma função (obrigatório)'}
                          autoComplete="off"
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: 'off',
                            'data-form-type': 'other'
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {roleLoading ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      noOptionsText="Nenhuma função encontrada"
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                    />
                  </Stack>
                </Grid>

                {/* Senha obrigatória só no create; no edit é opcional apenas se email não verificado */}
                {(isEdit ? !initial?.emailVerifiedAt : true) && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InputLabel htmlFor="password">{isEdit ? 'Nova senha (opcional)' : 'Senha *'}</InputLabel>
                        {isEdit && (
                          <Tooltip title="A senha só pode ser alterada se o usuário ainda não fez o primeiro login">
                            <InfoCircleOutlined style={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          </Tooltip>
                        )}
                      </Stack>
                      <OutlinedInput
                        id="password"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.password && errors.password)}
                        placeholder={isEdit ? 'Deixe em branco para manter a atual' : 'Digite a senha'}
                        autoComplete={isEdit ? 'new-password' : 'new-password'}
                        inputProps={{
                          'data-form-type': 'user-registration',
                          autocomplete: isEdit ? 'new-password' : 'new-password'
                        }}
                      />
                      {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
                    </Stack>
                  </Grid>
                )}

                {/* Confirmação de senha - obrigatória no create, opcional no edit se senha for preenchida */}
                {(!isEdit || values.password) && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="confirmPassword">Confirmar senha {!isEdit && '*'}</InputLabel>
                      <OutlinedInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                        placeholder={isEdit ? 'Digite a nova senha novamente' : 'Digite a senha novamente'}
                        autoComplete="new-password"
                        inputProps={{
                          'data-form-type': 'user-registration',
                          autocomplete: 'new-password'
                        }}
                      />
                      {touched.confirmPassword && errors.confirmPassword && <FormHelperText error>{errors.confirmPassword}</FormHelperText>}
                    </Stack>
                  </Grid>
                )}

                {/* Informações sobre requisitos da senha */}
                {!isEdit && (
                  <Grid size={{ xs: 12 }}>
                    <Stack sx={{ gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Requisitos da senha:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          • Pelo menos 8 caracteres
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Pelo menos 1 letra minúscula (a-z)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Pelo menos 1 letra maiúscula (A-Z)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Pelo menos 1 número (0-9)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Pelo menos 1 caractere especial
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary">
                Cancelar
              </Button>
              <Button
                onClick={() => handleSubmit()}
                variant="contained"
                disabled={isSubmitting || (!!values.password && values.password !== values.confirmPassword)}
              >
                {isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}
