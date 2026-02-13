// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - FAB ||============================== //

export default function Fab(theme: Theme) {
  return {
    MuiFab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: theme.shape.borderRadius,
          boxShadow: 'none',
          '&.Mui-disabled': { backgroundColor: theme.palette.grey[200] },
          '&::after': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            borderRadius: theme.shape.borderRadius,
            opacity: 0,
            transition: 'all 0.5s'
          },
          '&:active::after': {
            position: 'absolute',
            borderRadius: theme.shape.borderRadius,
            left: 0,
            top: 0,
            opacity: 1,
            transition: '0s'
          }
        },
        sizeSmall: {
          width: 40,
          height: 40
        },
        sizeMedium: {
          width: 48,
          height: 48
        },
        sizeLarge: {
          width: 56,
          height: 56
        }
      }
    }
  };
}
