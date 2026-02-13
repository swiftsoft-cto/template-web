// assets
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import BankOutlined from '@ant-design/icons/BankOutlined';
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
   
    
  ]
};

export default pages;
