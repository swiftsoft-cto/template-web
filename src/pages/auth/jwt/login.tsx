// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import { motion } from 'framer-motion';

// project imports
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/jwt/AuthLogin';
import loginImage from 'assets/images/cases/login.png';

// ================================|| TIPOS - DESTAQUE DE FUNCIONALIDADE ||================================ //

export interface FeatureHighlight {
  initial: string;
  name: string;
  handle: string;
  text: string;
}

const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    initial: 'T',
    name: 'Transcrição',
    handle: 'Áudio e vídeo',
    text: 'Transcreva reuniões, áudios e vídeos com precisão. Suporte a vários formatos, resumos e exportação para uso em atas e documentos.'
  },
  {
    initial: 'P',
    name: 'Projeto',
    handle: 'Organização',
    text: 'Organize trabalhos em projetos. Acompanhe prazos, tarefas e documentos em um só lugar, com controle de acesso por perfil.'
  },
  {
    initial: 'D',
    name: 'Documentos jurídicos',
    handle: 'Processos e contratos',
    text: 'Gerencie peças processuais, contratos e documentação jurídica com segurança, versionamento e busca integrada.'
  }
];

// ================================|| CARTÃO DE FUNCIONALIDADE ||================================ //

function FeatureCard({ feature, delay = 0 }: { feature: FeatureHighlight; delay?: number }) {
  const theme = useTheme();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          maxWidth: 280,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.white, 0.92),
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: theme.shadows[2]
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 700
          }}
        >
          {feature.initial}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {feature.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {feature.handle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
            {feature.text}
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
}

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
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${loginImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: theme.shape.borderRadius * 3,
                margin: theme.spacing(2),
                marginLeft: 0
              }}
            />
            {/* Overlay escuro suave para legibilidade dos cartões */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: theme.shape.borderRadius * 3,
                margin: theme.spacing(2),
                marginLeft: 0,
                background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.7)} 0%, ${alpha(theme.palette.common.black, 0.2)} 50%, transparent 100%)`,
                pointerEvents: 'none'
              }}
            />
            {/* Destaques de funcionalidades: mesma largura e alinhamento da imagem */}
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(3),
                left: 0,
                right: theme.spacing(2),
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: 2,
                alignItems: 'end',
                px: 2
              }}
            >
              <FeatureCard feature={FEATURE_HIGHLIGHTS[0]} delay={0.3} />
              <FeatureCard feature={FEATURE_HIGHLIGHTS[1]} delay={0.45} />
              <FeatureCard feature={FEATURE_HIGHLIGHTS[2]} delay={0.6} />
            </Box>
          </Box>
        )}
      </Box>
    </AuthWrapper>
  );
}
