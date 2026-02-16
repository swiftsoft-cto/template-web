// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/jwt/AuthLogin';
import loginImage from 'assets/images/cases/login.png';

// ================================|| JWT - ENTRAR ||================================ //

export default function Login() {
  const { isLoggedIn } = useAuth();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <AuthWrapper>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 0
        }}
      >
        {/* Coluna esquerda: formulário */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 4 }
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <AuthLogin isDemo={isLoggedIn} registerPath={undefined} />
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 4, pt: 2, textAlign: 'center' }}>
              <Link
                href="https://swiftsoft.com.br/terms/"
                target="_blank"
                variant="caption"
                color="primary.main"
                underline="hover"
                sx={{ '&:hover': { color: 'primary.dark' } }}
              >
                Termos e Condições
              </Link>
              <Link
                href="https://swiftsoft.com.br/privacy/"
                target="_blank"
                variant="caption"
                color="primary.main"
                underline="hover"
                sx={{ '&:hover': { color: 'primary.dark' } }}
              >
                Política de Privacidade
              </Link>
              <Typography variant="caption" color="text.secondary">
                © Todos os direitos reservados{' '}
                <Link
                  href="https://swiftsoft.com.br/"
                  target="_blank"
                  underline="hover"
                  color="primary.main"
                  sx={{ '&:hover': { color: 'primary.dark' } }}
                >
                  Swift Soft
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* Coluna direita: hero + depoimentos (apenas md+) */}
        {matches && (
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              minHeight: 320,
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha(theme.palette.common.white, 0.12),
              boxShadow: theme.shadows[4],
              m: 2
            }}
          >
            <Box
              component="img"
              src={loginImage}
              alt="Login"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: 3
              }}
            />
          </Box>
        )}
      </Box>
    </AuthWrapper>
  );
}
