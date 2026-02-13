import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
export default function AuthFooter() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        alignItems: 'end',
        justifyItems: 'center',
        gap: 2,
        px: { xs: 2, md: 3 },
        pb: { xs: 2, md: 3 }
      }}
    >
      {/* LADO ESQUERDO — centralizado na 1ª coluna */}
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        &copy; Todos os direitos reservados{' '}
        <Link href="https://swiftsoft.com.br/" target="_blank" underline="hover">
          Swift Soft
        </Link>
      </Typography>

      {/* LADO DIREITO — centralizado na 2ª coluna */}
      <Stack direction="row" sx={{ gap: 3, alignItems: 'center', justifyContent: 'center' }}>
        <Link href="https://swiftsoft.com.br/terms/" target="_blank" variant="caption" color="text.primary">
          Termos e Condições
        </Link>
        <Link href="https://swiftsoft.com.br/privacy/" target="_blank" variant="caption" color="text.primary">
          Política de Privacidade
        </Link>
      </Stack>
    </Box>
  );
}
