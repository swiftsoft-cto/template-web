// material-ui
import Box from '@mui/material/Box';

// project imports
import logo from 'assets/images/logo/swift-soft.svg';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain({ reverse }: { reverse?: boolean }) {
  return (
    <Box sx={{ p: 1.5, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={logo} alt="Swift Soft" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
    </Box>
  );
}
