import { useEffect, useRef, useState } from 'react';

// mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from 'components/@extended/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// project
import axios from 'utils/axios';
import { openSnackbar } from 'api/snackbar';
import { bindMask, formatCPF, formatCNPJ, formatPhoneBR, formatCEP, digitsOnly } from 'utils/mask';
import useAuth from 'hooks/useAuth';
import { UserProfile } from 'types/auth';
import useAvatarUrl from 'hooks/useAvatarUrl';
import { updateUserAvatar } from 'api/users';

// helpers
const unwrapUser = (resp: any) => resp?.data?.data ?? resp?.data?.user ?? resp?.data ?? resp;

// Validação de CPF
const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

const baseSchema = Yup.object({
  name: Yup.string().required('Nome é obrigatório').max(120),
  email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório').max(255),
  cpf: Yup.string()
    .required('CPF é obrigatório')
    .test('cpf-format', 'CPF deve ter 11 dígitos', (value) => {
      if (!value) return false;
      const cleanCPF = value.replace(/\D/g, '');
      return cleanCPF.length === 11;
    })
    .test('cpf-valid', 'CPF inválido', (value) => {
      if (!value) return false;
      return validateCPF(value);
    }),
  birthdate: Yup.string().optional(),
  phone: Yup.string().optional().max(20),
  cnpj: Yup.string().optional(),
  currentPassword: Yup.string()
});

type MeDTO = {
  name: string;
  email: string;
  cpf: string; // Agora obrigatório
  cnpj?: string;
  birthdate?: string; // ISO yyyy-mm-dd
  phone?: string;
  postalCode?: string;
  address?: string;
  addressState?: string;
  addressCity?: string;
  addressNeighborhood?: string;
  service?: string;
  currentPassword?: string; // só quando trocando email
};

const emptyMe: MeDTO = {
  name: '',
  email: '',
  cpf: '',
  cnpj: '',
  birthdate: '',
  phone: '',
  postalCode: '',
  address: '',
  addressState: '',
  addressCity: '',
  addressNeighborhood: '',
  service: '',
  currentPassword: ''
};

export default function PersonalForm() {
  const { updateProfile, user: currentUser, refreshUser } = useAuth();
  const avatarUrl = useAvatarUrl(currentUser?.id || null, currentUser?.avatarFileId || null);
  const [uploading, setUploading] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);
  const emailOriginal = useRef<string>('');
  const cpfRef = useRef<HTMLInputElement | null>(null);
  const cnpjRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const postalCodeRef = useRef<HTMLInputElement | null>(null);

  const [initialMe, setInitialMe] = useState<MeDTO>(emptyMe);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await axios.get('/auth/me');
        if (cancelled) return;
        const u = unwrapUser(resp);
        emailOriginal.current = u?.email || '';
        setInitialMe({
          name: u?.name || '',
          email: u?.email || '',
          cpf: formatCPF(u?.cpf || ''),
          cnpj: formatCNPJ(u?.cnpj || ''),
          birthdate: u?.birthdate ? String(u.birthdate).slice(0, 10) : '',
          phone: formatPhoneBR(u?.phone || ''),
          postalCode: u?.postalCode ? formatCEP(String(u.postalCode)) : '',
          address: u?.address || '',
          addressState: u?.addressState || '',
          addressCity: u?.addressCity || '',
          addressNeighborhood: u?.addressNeighborhood || '',
          service: u?.service || '',
          currentPassword: ''
        });
      } catch {
        if (!cancelled) console.error('Erro ao carregar dados do usuário');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const schema = baseSchema.shape({
    currentPassword: Yup.string().when('email', {
      is: (email: string) => email !== emailOriginal.current,
      then: (schema) => schema.required('Senha atual é obrigatória para trocar e-mail')
    })
  });

  return (
    <Formik<MeDTO>
      enableReinitialize
      initialValues={initialMe}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          // prepara payload base
          const payload: any = {
            ...values
          };

          // formata CPF se preenchido
          if (values.cpf) {
            payload.cpf = digitsOnly(values.cpf);
          }

          // formata CNPJ se preenchido
          if (values.cnpj) {
            payload.cnpj = digitsOnly(values.cnpj);
          }

          // formata telefone se preenchido
          if (values.phone) {
            payload.phone = digitsOnly(values.phone);
          }

          // formata CEP se preenchido
          if (values.postalCode) {
            payload.postalCode = digitsOnly(values.postalCode);
          }

          // se o email não mudou, não envie o campo 'email' nem 'currentPassword'
          if (values.email === emailOriginal.current) {
            delete payload.email;
            delete payload.currentPassword;
          }

          // não envie currentPassword vazia
          if (!payload.currentPassword) delete payload.currentPassword;

          const resp = await axios.put('/auth/me', payload);

          // Atualiza o contexto com os novos dados do usuário
          const updatedUser: UserProfile = {
            ...values,
            cpf: values.cpf ? digitsOnly(values.cpf) : undefined,
            cnpj: values.cnpj ? digitsOnly(values.cnpj) : undefined,
            phone: values.phone ? digitsOnly(values.phone) : undefined
          };

          // Busca os dados atualizados do servidor para garantir consistência
          try {
            const resp = await axios.get('/auth/me');
            const u = unwrapUser(resp);
            updateProfile(u);
          } catch {
            // Se falhar ao buscar dados atualizados, usa os dados locais
            updateProfile(updatedUser);
          }

          // Atualiza o email original para manter a consistência
          emailOriginal.current = values.email;

          setSubmitting(false);

          openSnackbar({
            open: true,
            message: resp.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          } as any);
        } catch (err: unknown) {
          setSubmitting(false);
          setErrors({
            email: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao atualizar perfil'
          });
        }
      }}
    >
      {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue }) => {
        // Busca dados do CEP no ViaCEP
        const searchCEP = async (cep: string) => {
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

        return (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Avatar + upload */}
              <Grid size={12}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={avatarUrl ?? undefined} alt={values.name || 'avatar'} size="lg" color="primary">
                    {(values.name || 'U').charAt(0)}
                  </Avatar>
                  <div>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !currentUser?.id) return;
                        try {
                          setUploading(true);
                          await updateUserAvatar(currentUser.id, file);
                          await refreshUser?.(); // mantêm store alinhada, se backend retornar avatarFileId
                          openSnackbar({ open: true, message: 'Avatar atualizado!', variant: 'alert', alert: { color: 'success' } } as any);
                        } catch (err: any) {
                          openSnackbar({
                            open: true,
                            message: err?.response?.data?.message || 'Falha ao trocar avatar',
                            variant: 'alert',
                            alert: { color: 'error' }
                          } as any);
                        } finally {
                          setUploading(false);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <label htmlFor="avatar-input">
                      <Button variant="outlined" component="span" disabled={uploading} startIcon={(<CameraOutlined />) as any}>
                        {uploading ? 'Enviando...' : 'Alterar foto'}
                      </Button>
                    </label>
                  </div>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="name">Nome</InputLabel>
                  <OutlinedInput
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    placeholder="Seu nome completo"
                    fullWidth
                  />
                  {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email">E-mail</InputLabel>
                  <OutlinedInput
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.email && errors.email)}
                    placeholder="seu@email.com"
                    fullWidth
                  />
                  {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                </Stack>
              </Grid>

              {emailOriginal.current !== values.email && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="currentPassword">Senha atual (obrigatória para trocar e-mail)</InputLabel>
                    <OutlinedInput
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={values.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.currentPassword && errors.currentPassword)}
                    />
                    {touched.currentPassword && errors.currentPassword && <FormHelperText error>{errors.currentPassword}</FormHelperText>}
                  </Stack>
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="cpf">CPF *</InputLabel>
                  <OutlinedInput
                    id="cpf"
                    name="cpf"
                    inputRef={cpfRef}
                    value={values.cpf}
                    onChange={bindMask('cpf', setFieldValue, formatCPF, cpfRef)}
                    onBlur={handleBlur}
                    error={Boolean(touched.cpf && errors.cpf)}
                    placeholder="000.000.000-00 (obrigatório)"
                    fullWidth
                  />
                  {touched.cpf && errors.cpf && <FormHelperText error>{errors.cpf}</FormHelperText>}
                </Stack>
              </Grid>

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
                    fullWidth
                  />
                  {touched.cnpj && errors.cnpj && <FormHelperText error>{errors.cnpj}</FormHelperText>}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="birthdate" shrink>
                    Data de Aniversário (opcional)
                  </InputLabel>
                  <OutlinedInput
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={values.birthdate || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.birthdate && errors.birthdate)}
                    fullWidth
                  />
                  {touched.birthdate && errors.birthdate && <FormHelperText error>{errors.birthdate}</FormHelperText>}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="phone">Telefone (opcional)</InputLabel>
                  <OutlinedInput
                    id="phone"
                    name="phone"
                    inputRef={phoneRef}
                    type="tel"
                    value={values.phone}
                    onChange={bindMask('phone', setFieldValue, formatPhoneBR, phoneRef)}
                    onBlur={handleBlur}
                    error={Boolean(touched.phone && errors.phone)}
                    placeholder="(11) 99999-9999"
                    fullWidth
                  />
                  {touched.phone && errors.phone && <FormHelperText error>{errors.phone}</FormHelperText>}
                </Stack>
              </Grid>

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
                    fullWidth
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => searchCEP(values.postalCode)}
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
                    fullWidth
                  />
                  {touched.address && errors.address && <FormHelperText error>{errors.address}</FormHelperText>}
                </Stack>
              </Grid>

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
                    fullWidth
                  />
                  {touched.addressNeighborhood && errors.addressNeighborhood && (
                    <FormHelperText error>{errors.addressNeighborhood}</FormHelperText>
                  )}
                </Stack>
              </Grid>

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
                    fullWidth
                  />
                  {touched.addressCity && errors.addressCity && <FormHelperText error>{errors.addressCity}</FormHelperText>}
                </Stack>
              </Grid>

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
                    fullWidth
                  />
                  {touched.addressState && errors.addressState && <FormHelperText error>{errors.addressState}</FormHelperText>}
                </Stack>
              </Grid>

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
                    fullWidth
                  />
                  {touched.service && errors.service && <FormHelperText error>{errors.service}</FormHelperText>}
                </Stack>
              </Grid>

              <Grid size={12}>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  Salvar alterações
                </Button>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
}
