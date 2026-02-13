// material-ui
import { Theme, alpha } from '@mui/material/styles';
// types
import { CustomGradientProps } from 'types/theme';
import { ThemeMode } from 'config';

// ==============================|| CUSTOM GRADIENTS (BRAND) ||============================== //
export default function CustomGradients(theme: Theme): CustomGradientProps {
  const isDark = theme.palette.mode === ThemeMode.DARK;

  // Fundo da aplicação
  const diagonal = `
    linear-gradient(
      160deg,
      ${alpha('#000800', 0.96)} 0%,
      ${alpha('#000A00', 0.94)} 45%,
      ${alpha('#000D00', isDark ? 0.18 : 0.22)} 100%
    )`;

  // Superfícies (Sidebar/Paper/Card): verde escuro translúcido, sem pesar
  const paperDiag = `
    linear-gradient(
      165deg,
      ${alpha('#031A05', isDark ? 0.48 : 0.22)} 0%,
      ${alpha('#041F07', isDark ? 0.26 : 0.12)} 100%
    )`;

  // AppBar/Toolbars: mais contraste e um toque de dourado
  const toolbarDiag = `
    linear-gradient(
      165deg,
      ${alpha('#021504', 0.85)} 0%,
      ${alpha('#031A05', 0.7)} 55%,
      ${alpha('#041F07', 0.28)} 100%
    )`;

  return {
    appBg: diagonal,
    paperBg: paperDiag,
    toolbarBg: toolbarDiag
  };
}
