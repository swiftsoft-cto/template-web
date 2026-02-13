import { CSSProperties, ReactNode, Ref } from 'react';

// material-ui
import Card, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children?: ReactNode;
  subheader?: ReactNode | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps['sx'];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps['sx'];
  secondary?: CardHeaderProps['action'];
  shadow?: string;
  elevation?: number;
  title?: ReactNode | string;
  codeHighlight?: boolean;
  codeString?: string;
  modal?: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLDivElement>;
}

export default function MainCard({
  border = false,
  boxShadow,
  children,
  subheader,
  content = true,
  contentSX = {},
  darkTitle,
  divider = true,
  elevation,
  secondary,
  shadow,
  sx = {},
  title,
  codeHighlight = false,
  codeString,
  modal = false,
  ref,
  ...others
}: MainCardProps) {
  return (
    <Card
      elevation={elevation || 0}
      sx={(theme) => ({
        position: 'relative',
        backgroundColor: 'transparent !important',
        backgroundImage: 'none !important',
        ...(border && { border: `1px solid ${theme.palette.grey['A800']}` }),
        borderRadius: 1,
        boxShadow: 'none !important',
        ':hover': { boxShadow: 'none !important' },
        ...(boxShadow && {
          boxShadow: `${shadow || theme.customShadows.z1} !important`,
          ':hover': { boxShadow: `${shadow || theme.customShadows.z1} !important` }
        }),
        ...(codeHighlight && {
          '& pre': { margin: 0, padding: '12px !important', fontFamily: theme.typography.fontFamily, fontSize: '0.75rem' }
        }),
        ...(modal && {
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: `calc(100% - 50px)`, sm: 'auto' },
          maxWidth: 768,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: theme.customGradients?.paperBg,
          boxShadow: theme.customShadows?.z1 || theme.shadows[8],
          borderRadius: theme.shape.borderRadius
        }),
        ...(typeof sx === 'function' ? sx(theme) : sx || {})
      })}
      ref={ref}
      {...others}
    >
      {/* card header and action */}
      {title && (
        <CardHeader
          sx={{
            p: { xs: 2, sm: 2.5 },
            pb: divider ? 1.5 : 2.5,
            backgroundColor: 'transparent'
          }}
          slotProps={{
            title: {
              variant: darkTitle ? 'h4' : 'subtitle1',
              sx: { mb: subheader ? 0.5 : 0 }
            },
            action: { sx: { m: '0px auto', alignSelf: 'center' } }
          }}
          title={title}
          action={secondary}
          subheader={subheader}
        />
      )}

      {/* content & header divider */}
      {title && divider && (
        <Divider
          sx={{
            mx: { xs: 2, sm: 2.5 },
            opacity: 0.3
          }}
        />
      )}

      {/* card content */}
      {content && (
        <CardContent
          sx={{
            p: { xs: 2, sm: 2.5 },
            '&:last-child': {
              paddingBottom: { xs: 2, sm: 2.5 }
            },
            ...contentSX
          }}
          {...(modal && { slotProps: { root: { sx: { overflowY: 'auto', minHeight: 'auto', maxHeight: `calc(100vh - 200px)` } } } })}
        >
          {children}
        </CardContent>
      )}
      {!content && children}

      {/* card footer - clipboard & highlighter  */}
      {/* {codeString && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Highlighter codeString={codeString} codeHighlight={codeHighlight} />
        </>
      )} */}
    </Card>
  );
}
