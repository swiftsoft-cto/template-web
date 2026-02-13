// material-ui
import { alpha, createTheme } from '@mui/material/styles';

// third-party
import { presetDarkPalettes, presetPalettes, PalettesProps } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';
import { ThemeMode } from 'config';

// types
import { PaletteThemeProps } from 'types/theme';
import { PresetColor } from 'types/config';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode: ThemeMode, presetColor: PresetColor) {
  const colors: PalettesProps = mode === ThemeMode.DARK ? presetDarkPalettes : presetPalettes;

  // Gerar paleta amarelo-esverdeada baseada na cor principal (mais amarelada)
  // Usando tons mais claros e escuros da cor base
  colors.gold =
    mode === ThemeMode.DARK
      ? [
          '#1F1D0D', // 0 - muito escuro
          '#2F2C14', // 1
          '#45421C', // 2
          '#656129', // 3
          '#8A8537', // 4
          '#E4D84A', // 5 - main (mais amarelado)
          '#C4BC3F', // 6
          '#A69F35', // 7
          '#7D7A28', // 8
          '#55551C' // 9 - muito escuro
        ]
      : [
          '#F7F7E8', // 0 - muito claro
          '#F0EDD0', // 1
          '#E4DEA8', // 2
          '#D8CF80', // 3
          '#CCC058', // 4
          '#D4C83D', // 5 - main (mais amarelado)
          '#B8A934', // 6
          '#9A8A2B', // 7
          '#736821', // 8
          '#4D4616' // 9 - muito escuro
        ];

  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  if (mode === ThemeMode.DARK) {
    // Escala "grey" azulada para o modo DARK (fundo/paper/divider/text)
    // índices 0..10 + A-series seguem o contrato usado em ThemeOption
    greyPrimary = [
      '#021504', // 0  (quase preto azulado)
      '#031A05', // 1
      '#041F07', // 2  -> background.paper
      '#1B401F',
      '#041F07',
      '#bfbfbf',
      '#d9d9d9',
      '#f0f0f0',
      '#f5f5f5',
      '#fafafa',
      '#ffffff' // 10 (mantém branco para text.primary via grey[900])
    ];
    // acentos frios coerentes com o navy
    greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
    // constantes: base de página + contornos claros
    greyConstant = ['#031A05', '#d3d8db'];
  }
  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  const paletteColor: PaletteThemeProps = ThemeOption(colors, presetColor, mode);

  return createTheme({
    palette: {
      mode,
      common: {
        black: '#000',
        white: '#fff'
      },
      ...paletteColor,
      text: {
        // Em dark, grey[900] => último da escala (branco), mantendo boa legibilidade
        primary: mode === ThemeMode.DARK ? alpha(paletteColor.grey[900]!, 0.92) : paletteColor.grey[800],
        secondary: mode === ThemeMode.DARK ? alpha(paletteColor.grey[900]!, 0.6) : paletteColor.grey[600],
        disabled: mode === ThemeMode.DARK ? alpha(paletteColor.grey[900]!, 0.3) : paletteColor.grey[400]
      },
      action: {
        // usa a cor primária como realce global (hover/selected/focus)
        hover: alpha(paletteColor.primary.main as string, 0.08),
        selected: alpha(paletteColor.primary.main as string, 0.16),
        focus: alpha(paletteColor.primary.main as string, 0.24),
        active: alpha(paletteColor.primary.main as string, 0.9),
        disabled: paletteColor.grey[300],
        hoverOpacity: 0.08,
        selectedOpacity: 0.16,
        focusOpacity: 0.24,
        activatedOpacity: 0.12,
        disabledOpacity: 0.38
      },
      divider: mode === ThemeMode.DARK ? alpha(paletteColor.grey[900]!, 0.06) : paletteColor.grey[200],
      background: {
        // deixar o gradiente do body aparecer
        paper: mode === ThemeMode.DARK ? 'transparent' : paletteColor.grey[0],
        default: 'transparent'
      }
    }
  });
}
