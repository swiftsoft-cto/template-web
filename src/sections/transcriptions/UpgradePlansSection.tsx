import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CheckOutlined from '@ant-design/icons/CheckOutlined';

const LITE_FEATURES = [
  '300 minutos de tempo de transcrição por mês',
  'Faça upload e conversão de múltiplos arquivos de áudio/vídeo',
  'Organizar, editar e colaborar nas transcrições',
  'Traduza, compartilhe e baixe transcrições',
  'Acesso via web ou aplicativo móvel para maior flexibilidade',
  'Ideal para projetos de curto prazo ou uso ocasional',
  'Mantenha suas transcrições armazenadas de forma segura'
];

const PRO_FEATURES = [
  'Inclui tudo no Lite, além de:',
  '2.400 minutos de tempo de transcrição por mês',
  'Gravar automaticamente reuniões com integração de calendário',
  'Economize tempo com modelos de resumo integrados',
  'Acesso total à base de conhecimento de IA',
  'Seus dados não serão usados para fins de treinamento',
  'Espaços de trabalho com acesso compartilhado e colaboração'
];

const TEAM_FEATURES = [
  'Inclui tudo em Pro, além de:',
  'Número ilimitado de arquivos de transcrição',
  '3.000 minutos de tempo de transcrição por assento por mês',
  'Análise de chamadas: horário de conversa com o palestrante, filtros de IA, detecção de sentimento',
  'Análises avançadas para rastrear e medir o uso',
  'Atribuir papéis e permissões de usuário para acesso seguro',
  'Nome e avatar personalizados do bot para reuniões',
  'Seus dados não serão usados para fins de treinamento'
];

type BillingPeriod = 'monthly' | 'annual';

const PLANS = [
  {
    id: 'lite',
    title: 'Lite',
    subtitle: 'Para quem está começando',
    monthlyPrice: 9.99,
    annualPricePerMonth: 4,
    annualTotal: 47.99,
    savePercent: 60,
    buttonLabel: 'Comece',
    features: LITE_FEATURES
  },
  {
    id: 'pro',
    title: 'Prós',
    subtitle: 'Transcrição ilimitada e ferramentas avançadas de IA para economizar horas',
    monthlyPrice: 19.99,
    annualPricePerMonth: 8.33,
    annualTotal: 99.99,
    savePercent: 60,
    buttonLabel: 'Comece',
    features: PRO_FEATURES
  },
  {
    id: 'team',
    title: 'Equipe',
    subtitle: 'Otimize o trabalho em equipe em espaços compartilhados e ferramentas avançadas para reuniões',
    monthlyPrice: 30,
    annualPricePerMonth: 20,
    annualTotal: 240,
    savePercent: 33,
    buttonLabel: 'Planeja o Time',
    features: TEAM_FEATURES,
    showContactSales: true
  }
];

type UpgradePlansSectionProps = {
  onSelectPlan: (planId: string) => Promise<void>;
  loadingPlanId: string | null;
};

export default function UpgradePlansSection({ onSelectPlan, loadingPlanId }: UpgradePlansSectionProps) {
  const [billing, setBilling] = useState<BillingPeriod>('annual');

  const handleBillingChange = (_: React.MouseEvent<HTMLElement>, value: BillingPeriod | null) => {
    if (value) setBilling(value);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 3 }}>
        Planos e Preços
      </Typography>
      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 4 }}>
        <ToggleButtonGroup value={billing} exclusive onChange={handleBillingChange} size="small">
          <ToggleButton value="monthly">Mensal</ToggleButton>
          <ToggleButton value="annual">
            Anual
            <Chip label="Economize 60%" size="small" color="success" sx={{ ml: 1 }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Grid container spacing={3}>
        {PLANS.map((plan) => {
          const isAnnual = billing === 'annual';
          const price = isAnnual ? plan.annualPricePerMonth : plan.monthlyPrice;
          const priceLabel = plan.id === 'team' && isAnnual ? `${price}/mês/assento` : '/mês';
          const billedLabel = isAnnual ? `Valor faturado anualmente: $${plan.annualTotal}` : null;
          return (
            <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {plan.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {plan.subtitle}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {isAnnual && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', mr: 1 }}>
                        ${plan.monthlyPrice}
                      </Typography>
                    )}
                    {isAnnual && <Chip label={`Economize ${plan.savePercent}%`} size="small" color="success" sx={{ mr: 1, mb: 0.5 }} />}
                    <Typography component="span" variant="h4" fontWeight={700}>
                      ${price}
                      <Typography component="span" variant="body1" fontWeight={500}>
                        {priceLabel}
                      </Typography>
                    </Typography>
                    {billedLabel && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {billedLabel}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!!loadingPlanId}
                    onClick={() => onSelectPlan(plan.id)}
                    sx={{ py: 1.25, mb: 2 }}
                  >
                    {loadingPlanId === plan.id ? <CircularProgress size={24} color="inherit" /> : plan.buttonLabel}
                  </Button>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    {plan.features.map((text, i) => (
                      <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                        <Box component="span" sx={{ color: 'primary.main', display: 'inline-flex', mt: 0.5 }}>
                          <CheckOutlined style={{ fontSize: 14 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  {plan.showContactSales && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Entre em contato conosco para discutir as necessidades do seu negócio.
                      </Typography>
                      <Button variant="outlined" size="small" endIcon={<span>→</span>}>
                        Contate Vendas
                      </Button>
                    </Box>
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
