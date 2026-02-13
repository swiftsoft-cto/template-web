// material-ui
import React, { ReactNode } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// project imports
import { useGetMenuMaster } from 'api/menu';

// ==============================|| SIDEBAR CONTENT ||============================== //

interface SidebarContentProps {
  children: ReactNode;
}

export function SidebarContent({ children }: SidebarContentProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'auto',
        minHeight: 0,
        px: 1.5,
        py: 1
      }}
    >
      {children}
    </Box>
  );
}

// ==============================|| SIDEBAR GROUP ||============================== //

interface SidebarGroupProps {
  children: ReactNode;
  label?: string;
}

export function SidebarGroup({ children, label }: SidebarGroupProps) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <Box sx={{ mb: 2 }}>
      {label && drawerOpen && (
        <Box sx={{ pl: 3, mb: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      )}
      <Box>{children}</Box>
    </Box>
  );
}

// ==============================|| SIDEBAR GROUP LABEL ||============================== //

interface SidebarGroupLabelProps {
  children: ReactNode;
}

export function SidebarGroupLabel({ children }: SidebarGroupLabelProps) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  if (!drawerOpen) return null;

  return (
    <Box sx={{ pl: 3, mb: 1.5 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
}

// ==============================|| SIDEBAR GROUP CONTENT ||============================== //

interface SidebarGroupContentProps {
  children: ReactNode;
}

export function SidebarGroupContent({ children }: SidebarGroupContentProps) {
  return <Box>{children}</Box>;
}

// ==============================|| SIDEBAR MENU ||============================== //

interface SidebarMenuProps {
  children: ReactNode;
}

const SidebarMenuStyled = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItemButton-root': {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.25, 0),
    padding: theme.spacing(1, 1.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

export function SidebarMenu({ children }: SidebarMenuProps) {
  return <SidebarMenuStyled>{children}</SidebarMenuStyled>;
}

// ==============================|| SIDEBAR MENU ITEM ||============================== //

interface SidebarMenuItemProps {
  children: ReactNode;
}

export function SidebarMenuItem({ children }: SidebarMenuItemProps) {
  return <Box component="li">{children}</Box>;
}

// ==============================|| SIDEBAR MENU BUTTON ||============================== //

interface SidebarMenuButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: (event?: any) => void;
  selected?: boolean;
  component?: React.ElementType;
  to?: string;
  href?: string;
  target?: string;
  disabled?: boolean;
  asChild?: boolean;
  [key: string]: any; // Para permitir props adicionais como onMouseEnter, onMouseLeave
}

export function SidebarMenuButton({
  children,
  icon,
  onClick,
  selected = false,
  component,
  to,
  href,
  target,
  disabled,
  asChild = false,
  ...otherProps
}: SidebarMenuButtonProps) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  // Separar sx de otherProps para mesclar corretamente
  const { sx: otherSx, ...restOtherProps } = otherProps;

  const selectedStyle = drawerOpen
    ? {
        '&.Mui-selected': {
          backgroundColor: 'primary.lighter',
          borderRight: '2px solid',
          borderColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.lighter'
          }
        }
      }
    : {
        '&.Mui-selected': {
          backgroundColor: 'transparent'
        }
      };

  const buttonProps: any = {
    selected,
    onClick,
    disabled,
    ...restOtherProps,
    sx: [
      {
        borderRadius: 1,
        mb: 0.5,
        ...(!drawerOpen && {
          justifyContent: 'center'
        })
      },
      selectedStyle,
      ...(otherSx ? (Array.isArray(otherSx) ? otherSx : [otherSx]) : [])
    ]
  };

  if (component && !asChild) {
    buttonProps.component = component;
  }
  if (to && !asChild) {
    buttonProps.to = to;
  }
  if (href && !asChild) {
    buttonProps.href = href;
  }
  if (target) {
    buttonProps.target = target;
  }

  return (
    <ListItemButton
      {...buttonProps}
      className={selected ? 'Mui-selected' : ''}
      sx={[
        ...(Array.isArray(buttonProps.sx) ? buttonProps.sx : [buttonProps.sx]),
        drawerOpen &&
          selected && {
            '&.Mui-selected': {
              borderRight: '0 solid !important',
              borderColor: 'primary.main !important'
            }
          }
      ]}
    >
      {icon && (
        <ListItemIcon
          sx={{
            minWidth: drawerOpen ? 40 : 'auto',
            justifyContent: drawerOpen ? 'flex-start' : 'center',
            color: selected ? 'primary.main' : 'text.secondary'
          }}
        >
          {icon}
        </ListItemIcon>
      )}
      {drawerOpen && (
        <ListItemText
          primary={
            <Typography component="span" variant="body2" color={selected ? 'primary.main' : 'text.primary'}>
              {children}
            </Typography>
          }
        />
      )}
    </ListItemButton>
  );
}

// ==============================|| SIDEBAR HEADER ||============================== //

interface SidebarHeaderProps {
  children?: ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      {children}
    </Box>
  );
}

// ==============================|| SIDEBAR FOOTER ||============================== //

interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 1,
        pb: 1,
        px: 1,
        zIndex: 1
      }}
    >
      {children}
    </Box>
  );
}
