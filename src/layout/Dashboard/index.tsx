import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Drawer from './Drawer';
import Header from './Header';
import HorizontalBar from './Drawer/HorizontalBar';
import Loader from 'components/Loader';
import AuthGuard from 'utils/route-guard/AuthGuard';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'));
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      handlerDrawerOpen(!downXL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  // Verifica se estamos na página A4Playground
  const isA4Playground = pathname.includes('/ai-docs/a4-playground/');

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', width: '100%' }} data-page={isA4Playground ? 'a4-playground' : 'other'}>
        <Header />
        {!isHorizontal ? <Drawer /> : <HorizontalBar />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 2, sm: 3, md: 4 },
            mt: 1.5
          }}
        >
          <Toolbar sx={{ mt: isHorizontal ? 8 : 0, minHeight: '64px !important' }} />
          <Container
            maxWidth={container ? 'xl' : false}
            sx={{
              ...(container && { px: { xs: 0, sm: 2 } }),
              position: 'relative',
              minHeight: 'calc(100vh - 110px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
    </AuthGuard>
  );
}
