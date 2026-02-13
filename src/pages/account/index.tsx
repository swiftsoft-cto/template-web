import { useState } from 'react';

// mui
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';

// layout
import MainCard from 'components/MainCard';

// sections
import PersonalForm from 'sections/account/PersonalForm';
import ChangePasswordForm from 'sections/account/ChangePasswordForm';
import MyExtraRulesSection from 'sections/account/MyExtraRulesSection';

// ==============================|| ACCOUNT - PAGE (Pessoal / Alterar Senha) ||============================== //

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function AccountSettings() {
  const [tab, setTab] = useState(0);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard contentSX={{ p: 0 }}>
          <Box sx={{ px: 2.5, pt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
              <Tab label="Pessoal" />
              <Tab label="Alterar Senha" />
              <Tab label="Regras extras" />
            </Tabs>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <TabPanel value={tab} index={0}>
              <PersonalForm />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <ChangePasswordForm />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <MyExtraRulesSection />
            </TabPanel>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}
