import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

const BATCH_OFFERS = [
  { id: '100', hours: '100 Horas', monthlyPrice: 60, annualPricePerMonth: 30, annualTotal: 360, savePercent: 50 },
  { id: '250', hours: '250 Horas', monthlyPrice: 150, annualPricePerMonth: 75, annualTotal: 900, savePercent: 50 },
  { id: '500', hours: '500 Horas', monthlyPrice: 300, annualPricePerMonth: 150, annualTotal: 1800, savePercent: 50 },
  { id: '1000', hours: '1000 Horas', monthlyPrice: 600, annualPricePerMonth: 300, annualTotal: 3600, savePercent: 50 }
];

type BillingPeriod = 'monthly' | 'annual';

export default function BatchOffersSection() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  const handleBillingChange = (_: React.MouseEvent<HTMLElement>, value: BillingPeriod | null) => {
    if (value) setBilling(value);
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 3 }}>
        Ofertas em Lote para Você
      </Typography>
      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 4 }}>
        <ToggleButtonGroup value={billing} exclusive onChange={handleBillingChange} size="small">
          <ToggleButton value="monthly">Mensal</ToggleButton>
          <ToggleButton value="annual">
            Anual
            <Chip label="Economize 50%" size="small" color="success" sx={{ ml: 1 }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Grid container spacing={3}>
        {BATCH_OFFERS.map((offer) => {
          const isAnnual = billing === 'annual';
          const price = isAnnual ? offer.annualPricePerMonth : offer.monthlyPrice;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={offer.id}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                    {offer.hours}
                  </Typography>
                  {isAnnual && (
                    <>
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', mr: 1 }}>
                        ${offer.monthlyPrice}
                      </Typography>
                      <Chip label={`Economize ${offer.savePercent}%`} size="small" color="success" sx={{ mb: 1 }} />
                    </>
                  )}
                  <Typography variant="h5" fontWeight={700}>
                    ${price}/mês
                  </Typography>
                  {isAnnual && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Valor faturado anualmente: ${offer.annualTotal}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
