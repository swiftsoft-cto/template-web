import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import Dot from 'components/@extended/Dot';
import SimpleBar from 'components/third-party/SimpleBar';
import Transitions from 'components/@extended/Transitions';
import Permission from 'components/Permission';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../../SidebarComponents';
import { MenuOrientation } from 'config';

import useConfig from 'hooks/useConfig';
import useMenuCollapse from 'hooks/useMenuCollapse';
import { useGetMenuMaster } from 'api/menu';

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import BorderOutlined from '@ant-design/icons/BorderOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

// types
import { NavItemType } from 'types/menu';

type VirtualElement = {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
};

type ListItemClick =
  | React.MouseEvent<HTMLButtonElement>
  | React.MouseEvent<HTMLAnchorElement>
  | React.MouseEvent<HTMLDivElement, MouseEvent>
  | undefined;

// mini-menu - wrapper
const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: 'visible',
  zIndex: 1202,
  minWidth: 180,
  '& > .MuiBox-root': {
    position: 'relative',
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 25,
      ...(theme.direction !== 'rtl' && { left: -5 }),
      ...(theme.direction === 'rtl' && { right: -5 }),
      width: 10,
      height: 10,
      background: theme.palette.background.paper,
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 120,
      borderLeft: '2px solid',
      borderLeftColor: theme.palette.divider,
      borderBottom: '2px solid',
      borderBottomColor: theme.palette.divider
    }
  },
  '&[data-popper-placement="right-end"]': {
    '.MuiPaper-root': {
      marginBottom: -8
    },
    '&:before': {
      top: 'auto',
      bottom: 5
    }
  }
}));

// ==============================|| NAVIGATION - LIST COLLAPSE ||============================== //

interface Props {
  menu: NavItemType;
  level: number;
  parentId: string;
  setSelectedItems: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedItems: string | undefined;
  setSelectedLevel: React.Dispatch<React.SetStateAction<number>>;
  selectedLevel: number;
}

export default function NavCollapse({ menu, level, parentId, setSelectedItems, selectedItems, setSelectedLevel, selectedLevel }: Props) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const navigation = useNavigate();

  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null | undefined>(null);
  const [anchorEl, setAnchorEl] = useState<VirtualElement | (() => VirtualElement) | null | undefined>(null);

  const handleClick = (event: ListItemClick, isRedirect: boolean) => {
    setAnchorEl(null);
    setSelectedLevel(level);
    if (drawerOpen) {
      setOpen(!open);
      setSelected(!selected ? menu.id : null);
      setSelectedItems(!selected ? menu.id : '');
      if (menu.url && isRedirect) navigation(`${menu.url}`);
    } else {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handlerIconLink = () => {
    if (!drawerOpen) {
      if (menu.url) navigation(`${menu.url}`);
      setSelected(menu.id);
    }
  };

  const handleHover = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const miniMenuOpened = Boolean(anchorEl);

  const handleMiniClose = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setOpen(false);
    if (!miniMenuOpened) {
      if (!menu.url) {
        setSelected(null);
      }
    }
    setAnchorEl(null);
  };

  useMemo(() => {
    if (selected === selectedItems) {
      if (level === 1) {
        setOpen(true);
      }
    } else {
      if (level === selectedLevel) {
        setOpen(false);
        if (!miniMenuOpened && !drawerOpen && !selected) {
          setSelected(null);
        }
        if (drawerOpen) {
          setSelected(null);
        }
      }
    }
  }, [selectedItems, level, selected, miniMenuOpened, drawerOpen, selectedLevel]);

  const { pathname } = useLocation();

  // menu collapse for sub-levels
  useMenuCollapse(menu, pathname, miniMenuOpened, setSelected, setOpen, setAnchorEl);

  useEffect(() => {
    if (menu.url === pathname) {
      setSelected(menu.id);
      setAnchorEl(null);
      setOpen(true);
    }
  }, [pathname, menu]);

  const navCollapse = menu.children?.map((item) => {
    switch (item.type) {
      case 'collapse':
        return (
          <NavCollapse
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            menu={item}
            level={level + 1}
            parentId={parentId}
          />
        );
      case 'item':
        return <NavItem key={item.id} item={item} level={level + 1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Collapse or Item
          </Typography>
        );
    }
  });

  const isSelected = selected === menu.id;
  const borderIcon = level === 1 ? <BorderOutlined style={{ fontSize: '1rem' }} /> : false;
  const Icon = menu.icon!;
  const menuIcon = menu.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : borderIcon;
  const popperId = miniMenuOpened ? `collapse-pop-${menu.id}` : undefined;

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <>
          <SidebarMenuItem>
            {menu.permissionDisabled && menu.rule ? (
              <Permission rule={menu.rule} disabled={true}>
                <SidebarMenuButton
                  icon={menuIcon}
                  selected={selected === menu.id}
                  onClick={(e: any) => handleClick(e, true)}
                  {...(!drawerOpen && { onMouseEnter: (e: ListItemClick) => handleClick(e, true), onMouseLeave: handleMiniClose })}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <FormattedMessage id={menu.title as string} />
                    {drawerOpen && (
                      <Box
                        component="span"
                        sx={{
                          ml: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          ...((miniMenuOpened || open) && { color: 'primary.main' })
                        }}
                      >
                        {open ? <DownOutlined style={{ fontSize: '0.875rem' }} /> : <RightOutlined style={{ fontSize: '0.875rem' }} />}
                      </Box>
                    )}
                  </Box>
                </SidebarMenuButton>
              </Permission>
            ) : (
              <SidebarMenuButton
                icon={menuIcon}
                selected={selected === menu.id}
                onClick={(e: any) => handleClick(e, true)}
                {...(!drawerOpen && { onMouseEnter: (e: ListItemClick) => handleClick(e, true), onMouseLeave: handleMiniClose })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <FormattedMessage id={menu.title as string} />
                  {drawerOpen && (
                    <Box
                      component="span"
                      sx={{
                        ml: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        ...((miniMenuOpened || open) && { color: 'primary.main' })
                      }}
                    >
                      {open ? <DownOutlined style={{ fontSize: '0.875rem' }} /> : <RightOutlined style={{ fontSize: '0.875rem' }} />}
                    </Box>
                  )}
                </Box>
              </SidebarMenuButton>
            )}

            {!drawerOpen && (
              <PopperStyled open={miniMenuOpened} anchorEl={anchorEl} placement="right-start" style={{ zIndex: 2001 }}>
                {({ TransitionProps }) => (
                  <Transitions in={miniMenuOpened} {...TransitionProps}>
                    <Paper
                      sx={(theme) => ({
                        overflow: 'hidden',
                        boxShadow: theme.customShadows.z1,
                        backgroundImage: 'none',
                        border: '1px solid',
                        borderColor: 'divider'
                      })}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <>
                          <SimpleBar sx={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '50vh' }}>{navCollapse}</SimpleBar>
                        </>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </SidebarMenuItem>
          {drawerOpen && (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box
                sx={(theme) => ({
                  position: 'relative',
                  pl: 4,
                  ml: 1
                })}
              >
                {/* Linha vertical conectando os itens filhos */}
                <Box
                  sx={(theme) => ({
                    position: 'absolute',
                    // Alinhado com o centro dos ícones: ListItemButton margin-left (8px) + padding-left (12px) + centro do ListItemIcon (20px de 40px) = 40px
                    // Ajuste fino para centralizar perfeitamente com o ícone
                    left: '52px',
                    top: theme.spacing(3.5),
                    bottom: theme.spacing(3.5),
                    width: '1px',
                    borderLeft: `1px dashed ${theme.palette.divider}`
                  })}
                />
                <SidebarMenu>{navCollapse}</SidebarMenu>
              </Box>
            </Collapse>
          )}
        </>
      ) : (
        <ListItemButton
          {...(menu?.url && { component: Link, to: menu.url })}
          id={`boundary-${popperId}`}
          disableRipple
          selected={isSelected}
          onMouseEnter={handleHover}
          onMouseLeave={handleClose}
          onClick={handleHover}
          aria-describedby={popperId}
          className={anchorEl ? 'Mui-selected' : ''}
          sx={{ '&.Mui-selected': { bgcolor: 'transparent' } }}
        >
          <Box onClick={handlerIconLink} sx={FlexBox}>
            {menuIcon && (
              <ListItemIcon sx={{ my: 'auto', minWidth: !menu.icon ? 18 : 28, color: 'secondary.dark' }}>{menuIcon}</ListItemIcon>
            )}
            {!menuIcon && level !== 1 && (
              <ListItemIcon
                sx={{ my: 'auto', minWidth: !menu.icon ? 18 : 28, bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } }}
              >
                <Dot size={4} color={isSelected || anchorEl ? 'primary' : 'secondary'} />
              </ListItemIcon>
            )}
            <ListItemText
              primary={
                <Typography variant="body1" color="inherit" sx={{ my: 'auto' }}>
                  <FormattedMessage id={menu.title as string} />
                </Typography>
              }
            />
            {miniMenuOpened ? <RightOutlined /> : <DownOutlined />}
          </Box>

          {anchorEl && (
            <PopperStyled id={popperId} open={miniMenuOpened} anchorEl={anchorEl} placement="right-start" style={{ zIndex: 2001 }}>
              {({ TransitionProps }) => (
                <Transitions in={miniMenuOpened} {...TransitionProps}>
                  <Paper sx={(theme) => ({ overflow: 'hidden', py: 0.5, boxShadow: theme.shadows[8], backgroundImage: 'none' })}>
                    <ClickAwayListener onClickAway={handleClose}>
                      <>
                        <SimpleBar sx={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '50vh' }}>{navCollapse}</SimpleBar>
                      </>
                    </ClickAwayListener>
                  </Paper>
                </Transitions>
              )}
            </PopperStyled>
          )}
        </ListItemButton>
      )}
    </>
  );
}
