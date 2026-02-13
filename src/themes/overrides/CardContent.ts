// ==============================|| OVERRIDES - CARD CONTENT ||============================== //

export default function CardContent(theme: any) {
  return {
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          borderRadius: 6,
          '&:last-child': {
            paddingBottom: 20
          }
        }
      }
    }
  };
}
