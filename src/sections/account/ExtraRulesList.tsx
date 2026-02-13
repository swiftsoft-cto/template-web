import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import type { UserExtraRule } from 'types/users';

type ExtraRulesListProps = {
  rules: UserExtraRule[];
  loading?: boolean;
  error?: string | null;
  /** Quando informado, exibe botão para revogar a regra (DELETE /users/:userId/extra-rules/:ruleId) */
  onDelete?: (ruleId: string) => void;
  deletingRuleId?: string | null;
};

function formatExpiresAt(expiresAt: string | null): string {
  if (!expiresAt) return '—';
  const d = new Date(expiresAt);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ExtraRulesList({ rules, loading, error, onDelete, deletingRuleId }: ExtraRulesListProps) {
  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Carregando regras...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    );
  }

  if (!rules.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhuma regra extra.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Origem</TableCell>
            <TableCell align="right">Expira em</TableCell>
            {onDelete && (
              <TableCell align="center" width={56}>
                Ações
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rules.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {r.name}
                </Typography>
              </TableCell>
              <TableCell>{r.description ?? '—'}</TableCell>
              <TableCell>
                <Chip label={r.source} size="small" variant="outlined" />
              </TableCell>
              <TableCell align="right">{formatExpiresAt(r.expiresAt)}</TableCell>
              {onDelete && (
                <TableCell align="center">
                  <Tooltip title="Revogar regra">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(r.id)}
                      disabled={deletingRuleId === r.id}
                      aria-label="Revogar regra"
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
