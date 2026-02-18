import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

// NOVO: Central de Dispositivos
const DevicesCenter = Loadable(lazy(() => import('pages/security/devices-center')));

// NOVO: Configurações da Conta
const AccountSettings = Loadable(lazy(() => import('pages/account')));

// NOVO: Colaboradores
const UsersPage = Loadable(lazy(() => import('pages/users')));
const SensitiveFieldsPage = Loadable(lazy(() => import('pages/sensitive-fields')));
// NOVO: Funções (roles)
const RolesPage = Loadable(lazy(() => import('pages/roles')));
// NOVO: Teste de Gravação
const RecorderTestPage = Loadable(lazy(() => import('pages/recorder-test')));
// NOVO: Departamentos
const DepartmentsPage = Loadable(lazy(() => import('pages/departments')));

// NOVO: Empresa
const CompanyPage = Loadable(lazy(() => import('pages/company')));

// Administração (abas: Funções, Clientes, Uso da IA)
const AdministrationPage = Loadable(lazy(() => import('pages/administration')));

// NOVO: Clientes
const ClientsPage = Loadable(lazy(() => import('pages/clients')));
const NewClientPage = Loadable(lazy(() => import('pages/clients/new')));
const ClientDetailsPage = Loadable(lazy(() => import('pages/clients/[id]')));
const EditClientPage = Loadable(lazy(() => import('pages/clients/[id]/edit')));


// NOVO: Bloqueios de Conta
const AccountBlocksPage = Loadable(lazy(() => import('pages/security/account-blocks')));

// NOVO: Uso da IA
const AiUsagePage = Loadable(lazy(() => import('pages/ai-usage')));

// NOVO: Contratos
const ContractTemplatesPage = Loadable(lazy(() => import('pages/contracts/templates')));
const ContractsPage = Loadable(lazy(() => import('pages/contracts')));
const NewContractPage = Loadable(lazy(() => import('pages/contracts/new')));
const ContractViewPage = Loadable(lazy(() => import('pages/contracts/[id]')));
const EditContractPage = Loadable(lazy(() => import('pages/contracts/[id]/edit')));


// NOVO: Financeiro

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'devices',
          element: <DevicesCenter />
        },
        // NOVO: Bloqueios de Conta
        {
          path: 'blocks',
          element: <AccountBlocksPage />
        },
        {
          path: 'account',
          element: <AccountSettings />
        },
        {
          path: 'users',
          element: <UsersPage />
        },
        {
          path: 'roles',
          element: <RolesPage />
        },
        {
          path: 'recorder-test',
          element: <RecorderTestPage />
        },
        {
          path: 'departments',
          element: <DepartmentsPage />
        },
        {
          path: 'company',
          element: <CompanyPage />
        },
        {
          path: 'administration',
          element: <AdministrationPage />
        },
        {
          path: 'clients',
          element: <ClientsPage />
        },
        {
          path: 'clients/new',
          element: <NewClientPage />
        },
        {
          path: 'clients/:id',
          element: <ClientDetailsPage />
        },
        {
          path: 'clients/:id/edit',
          element: <EditClientPage />
        },
                {
          path: 'sensitive-fields',
          element: <SensitiveFieldsPage />
        },
        {
          path: 'ai-usage',
          element: <AiUsagePage />
        },
        // NOVO: Contratos
        {
          path: 'contracts/templates',
          element: <ContractTemplatesPage />
        },
        {
          path: 'contracts/new',
          element: <NewContractPage />
        },
        {
          path: 'contracts/:id',
          element: <ContractViewPage />
        },
        {
          path: 'contracts/:id/edit',
          element: <EditContractPage />
        },
        {
          path: 'contracts',
          element: <ContractsPage />
        },
        
      ]
    },
    {
      path: '/maintenance',
      element: <PagesLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    }
  ]
};

export default MainRoutes;
