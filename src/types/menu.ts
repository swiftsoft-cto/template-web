import { ReactNode } from 'react';

// material-ui
import { ChipProps } from '@mui/material/Chip';

// project imports
import { GenericCardProps } from './root';
import { NavActionType } from 'config';

// ==============================|| MENU TYPES ||============================== //

type NavActionProps = {
  type: NavActionType;
  label: string;
  function?: any;
  url?: string;
  target?: boolean;
  icon: GenericCardProps['iconPrimary'] | string;
};

export type NavItemType = {
  breadcrumbs?: boolean;
  caption?: ReactNode | string;
  children?: NavItemType[];
  elements?: NavItemType[];
  chip?: ChipProps;
  color?: 'primary' | 'secondary' | 'default' | undefined;
  disabled?: boolean;
  external?: boolean;
  isDropdown?: boolean;
  icon?: GenericCardProps['iconPrimary'] | string;
  id?: string;
  link?: string;
  search?: string;
  target?: boolean;
  title?: ReactNode | string;
  type?: string;
  url?: string | undefined;
  actions?: NavActionProps[];
  /** Regra de autorização (ex: transcriptions.read). Se ausente, item é sempre visível. */
  rule?: string;
  /** Se true, usa Permission com disabled=true para desabilitar o primeiro elemento ao invés de ocultar */
  permissionDisabled?: boolean;
};

export type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

export type MenuProps = {
  /**
   * Indicate if dashboard layout menu open or not
   */
  isDashboardDrawerOpened: boolean;

  /**
   * Indicate if component layout menu open or not
   */
  isComponentDrawerOpened: boolean;
};
