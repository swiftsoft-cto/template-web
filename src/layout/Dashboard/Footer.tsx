// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { BRAND_GOLD } from 'config';

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 'auto',
        px: 3,
        py: 2.5
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'center', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 400
          }}
        >
          &copy; Todos os direitos reservados{' '}
          <Link
            href="https://swiftsoft.com.br/"
            target="_blank"
            underline="hover"
            sx={{
              color: BRAND_GOLD,
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme.palette.mode === 'dark' ? '#D4B87A' : BRAND_GOLD,
                opacity: 0.8
              }
            }}
          >
            Swift Soft
          </Link>
        </Typography>
        <Stack
          direction="row"
          sx={{
            gap: 2.5,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}
        >
          <Link
            href="https://swiftsoft.com.br/sobre-nos/"
            target="_blank"
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 400,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                color: 'text.primary',
                '&::after': {
                  width: '100%'
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: 0,
                height: '1px',
                backgroundColor: BRAND_GOLD,
                transition: 'width 0.2s ease'
              }
            }}
          >
            Sobre nós
          </Link>
          <Link
            href="https://swiftsoft.com.br/privacidade/"
            target="_blank"
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 400,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                color: 'text.primary',
                '&::after': {
                  width: '100%'
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: 0,
                height: '1px',
                backgroundColor: BRAND_GOLD,
                transition: 'width 0.2s ease'
              }
            }}
          >
            Privacidade
          </Link>
          <Link
            href="https://swiftsoft.com.br/termos/"
            target="_blank"
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 400,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                color: 'text.primary',
                '&::after': {
                  width: '100%'
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: 0,
                height: '1px',
                backgroundColor: BRAND_GOLD,
                transition: 'width 0.2s ease'
              }
            }}
          >
            Termos
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
