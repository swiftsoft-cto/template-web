// material-ui
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project imports
import { DRAWER_WIDTH } from 'config';

const openedMixin = (theme: Theme) =>
  ({
    width: DRAWER_WIDTH,
    borderRight: 'none',
    margin: theme.spacing(1.5, 0, 1.5, 1.5),
    borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(3)})`,

    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),

    overflowX: 'hidden',
    boxShadow: theme.customShadows.z1,
    '& .MuiDrawer-paper': {
      borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : theme.spacing(2),
      border: 'none',
      boxShadow: theme.customShadows.z1
    }
  }) as CSSObject;

const closedMixin = (theme: Theme) =>
  ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),

    overflowX: 'hidden',
    width: theme.spacing(7.5),
    borderRight: 'none',
    margin: theme.spacing(1.5, 0, 1.5, 1.5),
    borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(3)})`,
    boxShadow: theme.customShadows.z1,
    '& .MuiDrawer-paper': {
      borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : theme.spacing(2),
      border: 'none',
      boxShadow: theme.customShadows.z1
    }
  }) as CSSObject;

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  variants: [
    {
      props: ({ open }) => open,
      style: { ...openedMixin(theme), '& .MuiDrawer-paper': openedMixin(theme) }
    },
    {
      props: ({ open }) => !open,
      style: { ...closedMixin(theme), '& .MuiDrawer-paper': closedMixin(theme) }
    }
  ]
}));

export default MiniDrawerStyled;
