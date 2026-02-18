import React from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme, alpha } from '@mui/material/styles';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';
import { motion } from 'framer-motion';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import useAuth from 'hooks/useAuth';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 }
  }
};

export interface AuthLoginProps {
  isDemo?: boolean;
  registerPath?: string;
}

export default function AuthLogin({ isDemo = false, registerPath }: AuthLoginProps) {
  const { login } = useAuth();
  const theme = useTheme();

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((p) => !p);
  const handleMouseDownPassword = (e: React.SyntheticEvent) => e.preventDefault();

  const [searchParams] = useSearchParams();
  const auth = searchParams.get('auth');

  const forgotPasswordUrl = isDemo ? '/auth/forgot-password' : auth ? `/${auth}/forgot-password?auth=jwt` : '/forgot-password';

  const inputSx = {
    border: 'none !important',
    outline: 'none',
    bgcolor: 'transparent',
    boxShadow: 'none !important',
    '&:hover': { border: 'none !important', boxShadow: 'none !important' },
    '&.Mui-focused': { border: 'none !important', boxShadow: 'none !important', outline: 'none' },
    '&.Mui-error': { border: 'none !important', boxShadow: 'none !important' },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none !important', borderWidth: 0 },
    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none !important', borderWidth: 0 },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none !important', borderWidth: 0 },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': { border: 'none !important', borderWidth: 0 },
    '& fieldset': { border: 'none !important', borderWidth: 0 },
    '& .MuiOutlinedInput-input': { outline: 'none' },
    '& .MuiOutlinedInput-input:focus': { outline: 'none' }
  };

  const isLight = theme.palette.mode === 'light';
  const glassWrapperSx = {
    borderRadius: 2,
    border: '1px solid',
    borderColor: isLight ? alpha(theme.palette.divider, 0.8) : 'divider',
    bgcolor: isLight ? alpha(theme.palette.background.paper, 0.7) : 'transparent',
    transition: 'border-color 0.2s, background-color 0.2s',
    '&:focus-within': {
      borderColor: 'primary.main',
      bgcolor: alpha(theme.palette.primary.main, isLight ? 0.12 : 0.06)
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        rememberMe: false,
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('E-mail inválido').max(255).required('E-mail é obrigatório'),
        password: Yup.string()
          .required('Senha é obrigatória')
          .test('no-leading-trailing-whitespace', 'A senha não pode começar ou terminar com espaços', (value) => value === value?.trim())
          .max(32, 'Máximo 32 caracteres')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          await login(values.email.trim(), values.password);
          setStatus({ success: true });
          setSubmitting(false);
        } catch (err: any) {
          console.error(err);
          setStatus({ success: false });
          setErrors({ submit: err?.message ?? 'Erro ao entrar.' });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, submitCount, touched, values }) => (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <form noValidate onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <motion.div variants={itemVariants as any}>
                <Typography variant="h4" fontWeight={600} sx={{ letterSpacing: '-0.02em' }}>
                  Bem-vindo
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  Acesse sua conta e continue de onde parou.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <Typography component="label" variant="body2" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  E-mail
                </Typography>
                <Box
                  sx={{
                    ...glassWrapperSx,
                    ...(submitCount > 0 &&
                      errors.email && {
                        borderColor: 'error.main',
                        '&:focus-within': {
                          borderColor: 'error.main',
                          bgcolor: alpha(theme.palette.error.main, 0.06)
                        }
                      })
                  }}
                >
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    name="email"
                    value={values.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Digite seu e-mail"
                    fullWidth
                    error={Boolean(submitCount > 0 && errors.email)}
                    sx={inputSx}
                    slotProps={{ input: { sx: { py: 1.5, px: 2 } } }}
                  />
                </Box>
                {submitCount > 0 && errors.email && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {errors.email}
                  </FormHelperText>
                )}
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <Typography component="label" variant="body2" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Senha
                </Typography>
                <Box
                  sx={{
                    ...glassWrapperSx,
                    ...(submitCount > 0 &&
                      errors.password && {
                        borderColor: 'error.main',
                        '&:focus-within': {
                          borderColor: 'error.main',
                          bgcolor: alpha(theme.palette.error.main, 0.06)
                        }
                      })
                  }}
                >
                  <OutlinedInput
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={values.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    fullWidth
                    error={Boolean(submitCount > 0 && errors.password)}
                    sx={inputSx}
                    slotProps={{ input: { sx: { py: 1.5, px: 2, pr: 1 } } }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Alternar visibilidade da senha"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Box>
                {submitCount > 0 && errors.password && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {errors.password}
                  </FormHelperText>
                )}
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="rememberMe"
                        checked={values.rememberMe}
                        onChange={handleChange}
                        size="small"
                        sx={{ '& .MuiSvgIcon-root': { borderRadius: '50%' } }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Manter-me conectado
                      </Typography>
                    }
                  />
                  <Link
                    component={RouterLink}
                    to={forgotPasswordUrl}
                    variant="body2"
                    underline="hover"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline', color: 'text.primary', opacity: 0.9 }
                    }}
                  >
                    Redefinir senha
                  </Link>
                </Box>
              </motion.div>

              {errors.submit && (
                <motion.div variants={itemVariants as any}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </motion.div>
              )}

              <motion.div variants={itemVariants as any}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Entrar
                  </Button>
                </AnimateButton>
              </motion.div>

              {registerPath && (
                <motion.div variants={itemVariants as any}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Novo por aqui?{' '}
                    <Link
                      component={RouterLink}
                      to={registerPath}
                      underline="hover"
                      sx={{ color: 'text.primary', fontWeight: 600, '&:hover': { color: 'text.primary', opacity: 0.9 } }}
                    >
                      Criar conta
                    </Link>
                  </Typography>
                </motion.div>
              )}
            </Stack>
          </form>
        </motion.div>
      )}
    </Formik>
  );
}
