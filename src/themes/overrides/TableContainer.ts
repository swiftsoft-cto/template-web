// ==============================|| OVERRIDES - TABLE CONTAINER ||============================== //

export default function TableContainer(theme: any) {
  return {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius
        }
      }
    }
  };
}
