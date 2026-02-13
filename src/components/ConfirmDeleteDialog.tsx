import { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

type Props = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'delete' | 'confirm';
  confirmColor?: 'error' | 'success' | 'primary' | 'warning';
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Dialog padrão de confirmação de deleção.
 * Reutilizável para qualquer recurso (usuários, departamentos, etc).
 */
export default function ConfirmDeleteDialog({
  open,
  title = 'Remover registro',
  description,
  confirmText = 'Remover',
  cancelText = 'Cancelar',
  loading = false,
  variant = 'delete',
  confirmColor = 'error',
  icon,
  onConfirm,
  onCancel
}: Props) {
  const theme = useTheme();

  const defaultIcon =
    variant === 'delete' ? (
      <WarningOutlined style={{ color: theme.palette.error.main }} />
    ) : (
      <CheckCircleOutlined style={{ color: theme.palette.success.main }} />
    );

  const displayIcon = icon || defaultIcon;

  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          {displayIcon}
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          {description ? (
            <Typography variant="body2">{description}</Typography>
          ) : variant === 'delete' ? (
            <Typography variant="body2">Esta ação não pode ser desfeita. Tem certeza que deseja remover este registro?</Typography>
          ) : (
            <Typography variant="body2">Tem certeza que deseja confirmar esta ação?</Typography>
          )}
          {variant === 'delete' && (
            <Typography variant="caption" color="text.secondary">
              Dica: verifique se realmente não precisará mais deste dado antes de confirmar.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary" disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
