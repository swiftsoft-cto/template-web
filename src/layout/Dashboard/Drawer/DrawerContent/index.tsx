// material-ui
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';
import useAuth from 'hooks/useAuth';
import Permission from 'components/Permission';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../SidebarComponents';

// assets
import UserOutlined from '@ant-design/icons/UserOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import CommentOutlined from '@ant-design/icons/CommentOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import { FormattedMessage } from 'react-intl';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Verificar se a rota atual corresponde aos caminhos dos itens do footer
  const isAccountSelected = !!matchPath({ path: '/account', end: false }, pathname);
  const isDevicesSelected = !!matchPath({ path: '/devices', end: false }, pathname);
  const isBlocksSelected = !!matchPath({ path: '/blocks', end: false }, pathname);
  const isSensitiveFieldsSelected = !!matchPath({ path: '/sensitive-fields', end: false }, pathname);
  const isSettingsSelected = isDevicesSelected || isBlocksSelected || isSensitiveFieldsSelected;

  // Abrir o menu "Ajustes" automaticamente quando um de seus filhos estiver selecionado
  useEffect(() => {
    if (isSettingsSelected && !settingsOpen) {
      setSettingsOpen(true);
    }
  }, [isSettingsSelected, settingsOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (downLG) {
      handlerDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <SimpleBar
      sx={{
        height: '100%',
        '& .simplebar-content': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0
        },
        '& .simplebar-wrapper': {
          height: '100%'
        },
        '& .simplebar-scrollbar': {
          zIndex: 2
        }
      }}
    >
      <SidebarContent>
        <Navigation />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton icon={<UserOutlined />} selected={isAccountSelected} onClick={() => handleNavigation('/account')}>
              Perfil
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Permission rule={['access-keys.read', 'users.block_access', 'privacy.sensitive-fields.read']}>
            <SidebarMenuItem>
              <ListItemButton
                selected={isSettingsSelected}
                onClick={handleSettingsToggle}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  ...(!drawerOpen && {
                    justifyContent: 'center',
                    px: 1.5
                  }),
                  ...(drawerOpen && {
                    '&.Mui-selected': {
                      backgroundColor: 'primary.lighter',
                      borderRight: '0px solid',
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.lighter'
                      }
                    }
                  }),
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 40 : 'auto',
                    justifyContent: drawerOpen ? 'flex-start' : 'center',
                    color: isSettingsSelected ? 'primary.main' : 'text.secondary'
                  }}
                >
                  <SettingOutlined />
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Ajustes</span>
                        {settingsOpen ? (
                          <DownOutlined style={{ fontSize: '0.875rem' }} />
                        ) : (
                          <RightOutlined style={{ fontSize: '0.875rem' }} />
                        )}
                      </Box>
                    }
                  />
                )}
              </ListItemButton>
            </SidebarMenuItem>

            <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
              <Box
                sx={(theme) => ({
                  position: 'relative',
                  ...(drawerOpen && {
                    pl: 4,
                    ml: 1
                  })
                })}
              >
                {/* Linha vertical conectando os itens filhos */}
                {drawerOpen && (
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      // Alinhado com o centro dos ícones
                      // Cálculo: ListItemButton margin-left (8px) + padding-left (12px) + centro do ListItemIcon (20px de 40px) = 40px
                      // Ajuste fino para centralizar perfeitamente com o ícone
                      left: '50px',
                      top: theme.spacing(3.5),
                      bottom: theme.spacing(3.5),
                      width: '1px',
                      borderLeft: `1px dashed ${theme.palette.divider}`
                    })}
                  />
                )}
                <List component="div" disablePadding>
                  <Permission rule="access-keys.read">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        icon={<CommentOutlined />}
                        selected={isDevicesSelected}
                        onClick={() => handleNavigation('/devices')}
                      >
                        <FormattedMessage id="devices-center" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Permission>

                  <Permission rule="users.block_access">
                    <SidebarMenuItem>
                      <SidebarMenuButton icon={<SafetyOutlined />} selected={isBlocksSelected} onClick={() => handleNavigation('/blocks')}>
                        <FormattedMessage id="account-blocks" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Permission>

                  <Permission rule="privacy.sensitive-fields.read">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        icon={<SafetyOutlined />}
                        selected={isSensitiveFieldsSelected}
                        onClick={() => handleNavigation('/sensitive-fields')}
                      >
                        Dados Sensíveis
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Permission>
                </List>
              </Box>
            </Collapse>
          </Permission>
          <SidebarMenuItem>
            <SidebarMenuButton icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SimpleBar>
  );
}
