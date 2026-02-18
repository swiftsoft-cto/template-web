// material-ui
import { Theme, alpha } from '@mui/material/styles';
// types
import { CustomGradientProps } from 'types/theme';
import { ThemeMode } from 'config';
import { PresetColor } from 'types/config';

type PrimaryScale = {
  darker?: string;
  dark?: string;
  main?: string;
  light?: string;
  lighter?: string;
  900?: string;
  100?: string;
  50?: string;
  [key: string]: string | undefined;
};

// Direção: superior esquerdo (tom mais escuro) → inferior direito (tom mais claro)
const GRADIENT_DIR = 'to bottom right';

// theme1: gradiente verde escuro (160deg, preto-esverdeado → transparente)
const THEME1_GRADIENT =
  'linear-gradient(160deg, rgba(0, 8, 0, 0.96) 0%, rgba(0, 10, 0, 0.94) 45%, rgba(0, 13, 0, 0.18) 100%)';

// ==============================|| CUSTOM GRADIENTS (MODELO PARA TODOS OS TEMAS) ||============================== //
/**
 * theme1: usa gradiente fixo verde escuro.
 * Demais temas: superior esquerdo = tom mais escuro do primary → inferior direito = tom mais claro.
 */
export default function CustomGradients(theme: Theme, presetColor?: PresetColor): CustomGradientProps {
  if (presetColor === 'theme1') {
    return {
      appBg: THEME1_GRADIENT,
      paperBg: THEME1_GRADIENT,
      toolbarBg: THEME1_GRADIENT
    };
  }

  const isDark = theme.palette.mode === ThemeMode.DARK;
  const p = (theme.palette.primary || {}) as unknown as PrimaryScale;

  const tomMaisEscuro = p.darker || p[900] || p.dark || p.main || '#0a0a0a';
  const tomMaisClaro = p.lighter || p[50] || p[100] || p.light || p.main || '#888';
  const op = (a: number, b: number) => (isDark ? a : b);
  const mid = p.main || p.dark || tomMaisEscuro;

  const appBg = `
    linear-gradient(
      ${GRADIENT_DIR},
      ${alpha(tomMaisEscuro, op(0.98, 0.95))} 0%,
      ${alpha(p.dark || mid, op(0.85, 0.6))} 40%,
      ${alpha(mid, op(0.65, 0.4))} 70%,
      ${alpha(tomMaisClaro, op(0.4, 0.22))} 100%
    )`;

  const paperBg = `
    linear-gradient(
      ${GRADIENT_DIR},
      ${alpha(tomMaisEscuro, op(0.78, 0.45))} 0%,
      ${alpha(mid, op(0.58, 0.3))} 50%,
      ${alpha(tomMaisClaro, op(0.38, 0.18))} 100%
    )`;

  const toolbarBg = `
    linear-gradient(
      ${GRADIENT_DIR},
      ${alpha(tomMaisEscuro, op(0.94, 0.85))} 0%,
      ${alpha(mid, op(0.72, 0.5))} 50%,
      ${alpha(tomMaisClaro, op(0.45, 0.25))} 100%
    )`;

  return {
    appBg,
    paperBg,
    toolbarBg
  };
}
