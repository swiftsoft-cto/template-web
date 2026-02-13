import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from 'components/@extended/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { listNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount, deleteNotification } from 'api/notifications';
import { openSnackbar } from 'api/snackbar';
import type { Notification } from 'types/notifications';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import ProjectOutlined from '@ant-design/icons/ProjectOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// Ícone customizado para scope
const ScopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
    <path
      fill="currentColor"
      d="M5 1a2 2 0 0 0-2 2v2.256q.478-.17 1-.229V3a1 1 0 0 1 1-1h3v2.5A1.5 1.5 0 0 0 9.5 6H12v7a1 1 0 0 1-1 1h-.085c.114.323.114.677 0 1H11a2 2 0 0 0 2-2V5.414a1.5 1.5 0 0 0-.44-1.06L9.647 1.439A1.5 1.5 0 0 0 8.586 1zm6.793 4H9.5a.5.5 0 0 1-.5-.5V2.207zm-5.197 7.303a3.5 3.5 0 1 1 .707-.707l2.55 2.55a.5.5 0 0 1-.707.708zM7 9.5a2.5 2.5 0 1 0-5 0a2.5 2.5 0 0 0 5 0"
    ></path>
  </svg>
);

// Ícone customizado para scope finalizado
const ScopeFinishedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20">
    <path
      fill="currentColor"
      d="M6 2a2 2 0 0 0-2 2v5.207a5.5 5.5 0 0 1 1-.185V4a1 1 0 0 1 1-1h4v3.5A1.5 1.5 0 0 0 11.5 8H15v8a1 1 0 0 1-1 1h-3.6a5.5 5.5 0 0 1-.657 1H14a2 2 0 0 0 2-2V7.414a1.5 1.5 0 0 0-.44-1.06l-3.914-3.915A1.5 1.5 0 0 0 10.586 2zm8.793 5H11.5a.5.5 0 0 1-.5-.5V3.207zM10 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-2.146-1.854a.5.5 0 0 0-.708 0L4.5 15.293l-.646-.647a.5.5 0 0 0-.708.708l1 1a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0 0-.708"
    ></path>
  </svg>
);

// Ícone customizado para contrato assinado
const ContractSignedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 48 48">
    <path
      fill="currentColor"
      d="M8 8.25A4.25 4.25 0 0 1 12.25 4h13.336a2.25 2.25 0 0 1 1.59.659l10.04 10.04a6 6 0 0 0-1.457 1.088l-.491.499L26.5 7.518v7.732c0 .69.56 1.25 1.25 1.25h7.307L32.595 19H27.75A3.75 3.75 0 0 1 24 15.25V6.5H12.25a1.75 1.75 0 0 0-1.75 1.75v31.5c0 .967.784 1.75 1.75 1.75h23.5a1.75 1.75 0 0 0 1.75-1.75v-8.891l2.5-2.462V39.75A4.25 4.25 0 0 1 35.75 44h-23.5A4.25 4.25 0 0 1 8 39.75zm29.182 8.94a3.981 3.981 0 1 1 5.63 5.63L29.09 36.33a3 3 0 0 1-1.351.766l-3.235.839a2 2 0 0 1-.593.064h-9.672a1.25 1.25 0 1 1 0-2.5h7.828l.838-3.236a3 3 0 0 1 .767-1.352z"
    ></path>
  </svg>
);

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// Função para formatar data relativa
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;

  // Mais de 7 dias, mostra data formatada
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Função para obter ícone baseado na entidade e título
function getEntityIcon(entity: string, title?: string) {
  switch (entity) {
    case 'finance':
      return <DollarOutlined />;
    case 'contract':
      // Se o título contém "assinado", usa o ícone de contrato assinado
      if (title && title.toLowerCase().includes('assinado')) {
        return <ContractSignedIcon />;
      }
      return <FileTextOutlined />;
    case 'project':
      return <ProjectOutlined />;
    case 'scope':
      // Se o título contém "Finalizado", usa o ícone de scope finalizado
      if (title && title.toLowerCase().includes('finalizado')) {
        return <ScopeFinishedIcon />;
      }
      return <ScopeIcon />;
    case 'user':
      return <UserOutlined />;
    default:
      return <BellOutlined />;
  }
}

// Função para obter cor do avatar baseado na entidade e título
function getEntityColor(entity: string, title?: string): 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (entity) {
    case 'finance':
      return 'success';
    case 'contract':
      // Se o título contém "assinado", usa cor verde (success)
      if (title && title.toLowerCase().includes('assinado')) {
        return 'success';
      }
      return 'primary';
    case 'project':
      return 'info';
    case 'scope':
      return 'info';
    case 'user':
      return 'warning';
    default:
      return 'primary';
  }
}

// Função para tocar som de notificação
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Som de sino (frequência que sobe e desce)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (err) {
    // Silenciosamente falha se o navegador não suportar Web Audio API
    console.warn('Não foi possível tocar som de notificação:', err);
  }
}

// ==============================|| HEADER CONTENT - NOTIFICAÇÕES ||============================== //

export default function Notification() {
  const navigate = useNavigate();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const anchorRef = useRef<any>(null);
  const previousCountRef = useRef<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [markingAll, setMarkingAll] = useState<boolean>(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Carregar notificações e contador
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationsData, count] = await Promise.all([
        listNotifications({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
        getUnreadCount()
      ]);
      setNotifications(notificationsData.data);
      // Verifica se há nova notificação e toca o som
      if (count > previousCountRef.current && previousCountRef.current > 0) {
        playNotificationSound();
      }
      previousCountRef.current = count;
      setUnreadCount(count);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Erro ao carregar notificações',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar quando abrir o menu
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  // Atualizar contador periodicamente (a cada 30 segundos) e tocar som quando houver nova notificação
  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await getUnreadCount();
        // Se o contador aumentou, toca o som
        if (count > previousCountRef.current && previousCountRef.current > 0) {
          playNotificationSound();
        }
        previousCountRef.current = count;
        setUnreadCount(count);
      } catch {
        // Silenciosamente falha ao atualizar contador
      }
    };

    const interval = setInterval(updateCount, 30000);

    // Carregar contador inicial
    getUnreadCount()
      .then((count) => {
        previousCountRef.current = count;
        setUnreadCount(count);
      })
      .catch(() => {
        // Silenciosamente falha ao carregar contador inicial
      });

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen: boolean) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      openSnackbar({
        open: true,
        message: 'Todas as notificações foram marcadas como lidas',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Erro ao marcar todas como lidas',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marca como lida ao visualizar
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id, true);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err: any) {
        openSnackbar({
          open: true,
          message: err?.response?.data?.message || 'Erro ao marcar notificação como lida',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
    }

    // Fecha o dropdown
    setOpen(false);

    // Navega para a entidade relacionada baseado no tipo
    if (notification.registerId) {
      switch (notification.entity) {
        case 'scope':
          navigate(`/scopes/${notification.registerId}`);
          break;
        case 'contract':
          navigate(`/contracts/${notification.registerId}`);
          break;
        case 'project':
          // Navega para a lista de projetos com query param para abrir o dialog
          navigate(`/projects?view=${notification.registerId}`);
          break;
        default:
          // Não navega se não houver rota definida para o tipo de entidade
          break;
      }
    }
  };

  const handleDeleteNotification = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setDeletingIds((prev) => new Set(prev).add(notification.id));
      await deleteNotification(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      // Se a notificação não estava lida, decrementa o contador
      if (!notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      openSnackbar({
        open: true,
        message: 'Notificação removida',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Erro ao remover notificação',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={(theme) => ({
          color: 'text.primary',
          bgcolor: open ? 'grey.100' : 'transparent',
          ...theme.applyStyles('dark', { bgcolor: open ? 'background.default' : 'transparent' })
        })}
        aria-label="abrir notificações"
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal={false}
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              sx={(theme) => {
                // Usa a cor de background do tema com transparência para permitir o blur
                // No dark mode, background.paper é transparent, então usa a cor base #041F07 (grey[2] do tema)
                // No light mode, usa background.paper diretamente
                const bgColor = theme.palette.background.paper;

                return {
                  boxShadow: theme.customShadows.z1,
                  width: '100%',
                  minWidth: 285,
                  maxWidth: { xs: 285, md: 420 },
                  backgroundColor: `${bgColor} !important`,
                  backdropFilter: 'blur(10px) saturate(120%) !important',
                  WebkitBackdropFilter: 'blur(10px) saturate(120%) !important',
                  border: '1px solid rgba(255,255,255,.08)',
                  // Força a sobrescrever os overrides do Paper
                  '&.MuiPaper-root': {
                    backgroundColor: `${bgColor} !important`,
                    backdropFilter: 'blur(10px) saturate(120%) !important',
                    WebkitBackdropFilter: 'blur(10px) saturate(120%) !important'
                  }
                };
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notificações"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unreadCount > 0 && (
                        <Tooltip title="Marcar todas como lidas">
                          <IconButton color="success" size="small" onClick={handleMarkAllAsRead} disabled={markingAll}>
                            {markingAll ? <CircularProgress size={16} /> : <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : notifications.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                      <Alert severity="info">Nenhuma notificação</Alert>
                    </Box>
                  ) : (
                    <List
                      component="nav"
                      sx={{
                        p: 0,
                        maxHeight: 400,
                        overflowY: 'auto',
                        '& .MuiListItemButton-root': {
                          py: 0.5,
                          px: 2,
                          '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                          '& .MuiAvatar-root': avatarSX,
                          '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                        }
                      }}
                    >
                      {notifications.map((notification) => (
                        <ListItem
                          key={notification.id}
                          component={ListItemButton}
                          divider
                          selected={!notification.read}
                          onClick={() => handleNotificationClick(notification)}
                          secondaryAction={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" noWrap sx={{ mr: 1 }}>
                                {formatRelativeTime(notification.createdAt)}
                              </Typography>
                              <Tooltip title="Remover notificação">
                                <IconButton
                                  edge="end"
                                  size="small"
                                  color="error"
                                  onClick={(e) => handleDeleteNotification(notification, e)}
                                  disabled={deletingIds.has(notification.id)}
                                  sx={{ ml: 0.5 }}
                                >
                                  {deletingIds.has(notification.id) ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <DeleteOutlined style={{ fontSize: '0.875rem' }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar color={getEntityColor(notification.entity, notification.title)} type="filled">
                              {getEntityIcon(notification.entity, notification.title)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                {notification.title}
                              </Typography>
                            }
                            secondary={notification.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
