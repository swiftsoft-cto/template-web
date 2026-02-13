// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - ALERT ||============================== //

export default function Alert(theme: Theme) {
  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          fontSize: '0.875rem'
        },
        icon: {
          fontSize: '1rem'
        },
        message: {
          padding: 0,
          marginTop: 3
        },
        filled: {
          color: theme.palette.grey[0]
        },
        border: { padding: '10px 16px', border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius },
        action: {
          '& .MuiButton-root': {
            padding: 2,
            height: 'auto',
            fontSize: '0.75rem',
            marginTop: -2
          },
          '& .MuiIconButton-root': {
            width: 'auto',
            height: 'auto',
            padding: 2,
            marginRight: 6,
            '& .MuiSvgIcon-root': {
              fontSize: '1rem'
            }
          }
        }
      }
    }
  };
}
