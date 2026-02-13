// assets
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import BankOutlined from '@ant-design/icons/BankOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import ProjectOutlined from '@ant-design/icons/ProjectOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import FileOutlined from '@ant-design/icons/FileOutlined';
import AudioOutlined from '@ant-design/icons/AudioOutlined';
import AIIcon from 'components/icons/AIIcon';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  TeamOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  BankOutlined,
  WalletOutlined,
  ProjectOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  FileOutlined,
  AudioOutlined,
  AIIcon
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const pages: NavItemType = {
  id: 'group-pages',
  title: 'pages',
  type: 'group',
  children: [
    // 👇 Menu "Administração"
    {
      id: 'administration',
      title: 'administration',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'company',
          title: 'company',
          type: 'item',
          icon: icons.BankOutlined,
          url: '/company',
          rule: 'company.read'
        },
        {
          id: 'departments',
          title: 'departments',
          type: 'item',
          icon: icons.AppstoreOutlined,
          url: '/departments',
          rule: 'departments.read'
        },
        {
          id: 'roles',
          title: 'roles',
          type: 'item',
          icon: icons.SafetyOutlined,
          url: '/roles',
          rule: 'roles.read'
        },
        {
          id: 'collaborators',
          title: 'users',
          type: 'item',
          icon: icons.TeamOutlined,
          url: '/users',
          rule: 'users.read'
        },
        {
          id: 'clients',
          title: 'customer',
          type: 'item',
          icon: icons.UserOutlined,
          url: '/clients',
          rule: 'customers.read'
        },
        {
          id: 'ai-usage',
          title: 'ai-usage',
          type: 'item',
          icon: icons.AIIcon,
          url: '/ai-usage',
          rule: 'ai.usage.read'
        }
      ]
    },
    // 👇 Menu "Gestão de Projetos"
    {
      id: 'software-management',
      title: 'software-management',
      type: 'collapse',
      icon: icons.ProjectOutlined,
      children: [
        {
          id: 'projects',
          title: 'projects',
          type: 'item',
          icon: icons.FolderOpenOutlined,
          url: '/projects',
          rule: 'projects.read'
        },
        {
          id: 'scopes',
          title: 'scopes',
          type: 'item',
          icon: icons.FolderOpenOutlined,
          url: '/scopes',
          rule: 'projects-management.scopes.read'
        }
      ]
    },
    // 👇 Menu "Jurídico"
    {
      id: 'legal',
      title: 'legal',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      children: [
        // 👇 Submenu "Contrato"
        {
          id: 'legal-contract',
          title: 'contract',
          type: 'collapse',
          icon: icons.FileTextOutlined,
          children: [
            {
              id: 'contract-templates',
              title: 'contract-templates',
              type: 'item',
              icon: icons.FileOutlined,
              url: '/contracts/templates',
              rule: 'projects-management.contracts.templates.read'
            },
            {
              id: 'contracts-list',
              title: 'contracts',
              type: 'item',
              icon: icons.FileTextOutlined,
              url: '/contracts',
              rule: 'projects-management.contracts.read'
            }
          ]
        }
      ]
    },
    
  ]
};

export default pages;
