import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';

import AuthFooter from 'components/cards/AuthFooter';
import AuthCard from './AuthCard';
import AuthBackground from './AuthBackground';
import logoImage from 'assets/images/logo/swift-soft.svg';

interface Props {
  children: ReactElement;
  useCard?: boolean;
}

export default function AuthWrapper({ children, useCard = true }: Props) {
  const location = useLocation();

  // Se estiver na página de login, não usar card wrapper
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';
  const shouldUseCard = useCard && !isLoginPage;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: shouldUseCard ? '1fr 1fr' : '1fr' },
        gridTemplateRows: '1fr auto',
        alignContent: 'start',
        position: 'relative'
      }}
    >
      <AuthBackground />

      {shouldUseCard ? (
        <>
          {/* coluna esquerda (logo) */}
          <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 4, md: 6 } }}>
            <Box component="img" src={logoImage} alt="Logo Swift Soft" sx={{ width: '70%', maxWidth: 600 }} />
          </Box>

          {/* coluna direita (card) */}
          <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, md: 6 } }}>
            <AuthCard>{children}</AuthCard>
          </Box>
        </>
      ) : (
        /* Conteúdo sem card wrapper (para login) – ocupa toda a área disponível; rodapé fica dentro da página */
        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: 1
          }}
        >
          {children}
        </Box>
      )}

      {/* footer só em páginas que usam card (forgot-password, etc.); na login fica abaixo do botão */}
      {shouldUseCard && (
        <Box
          sx={{
            gridColumn: '1 / -1',
            p: 3
          }}
        >
          <AuthFooter />
        </Box>
      )}
    </Box>
  );
}
