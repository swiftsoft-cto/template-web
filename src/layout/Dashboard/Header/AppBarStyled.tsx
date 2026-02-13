// material-ui
import { styled } from '@mui/material/styles';
import AppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

// project imports
import { DRAWER_WIDTH, BRAND_GOLD } from 'config';

// ==============================|| HEADER - APP BAR STYLED ||============================== //

interface Props extends MuiAppBarProps {
  open?: boolean;
}

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<Props>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  borderBottom: `2px solid ${BRAND_GOLD}`,
  backgroundColor: theme.palette.background.paper,
  margin: theme.spacing(1.5),
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : theme.spacing(2),
  boxShadow: theme.customShadows.z1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  variants: [
    {
      props: ({ open }) => !open,
      style: {
        width: `calc(100% - ${theme.spacing(7.5)} - ${theme.spacing(4.5)})`,
        marginLeft: `calc(${theme.spacing(7.5)} + ${theme.spacing(3)})`
      }
    },
    {
      props: ({ open }) => open,
      style: {
        marginLeft: `calc(${DRAWER_WIDTH}px + ${theme.spacing(3)})`,
        width: `calc(100% - ${DRAWER_WIDTH}px - ${theme.spacing(4.5)})`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
      }
    }
  ]
}));

export default AppBarStyled;
