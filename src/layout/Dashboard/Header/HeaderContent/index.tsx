// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
// import Search from './Search';
// import Message from './Message';
// import Profile from './Profile';
// import Localization from './Localization';
import Notification from './Notification';
// import FullScreen from './FullScreen';
import MobileSection from './MobileSection';
// import MegaMenuSection from './MegaMenuSection';
import SessionTimer from 'components/SessionTimer';

import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { MenuOrientation } from 'config';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();
  const { expiresIn } = useAuth();
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {/* Spacer para empurrar os itens para a direita */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Timer de sessão solto no navbar */}
      {!downLG && expiresIn && <SessionTimer expiresIn={expiresIn} variant="compact" />}

      {/* Ações à direita */}
      {/* {!downLG && <FullScreen />} */}
      {!downLG && <Notification />}
      {downLG && <MobileSection />}
    </>
  );
}
