import { NavItemType } from 'types/menu';

/**
 * Filtra recursivamente itens de menu com base nas regras do usuário.
 * Itens sem `rule` são sempre mantidos.
 * Itens com `permissionDisabled: true` são mantidos mesmo sem permissão (serão desabilitados).
 */
export function filterMenuByPermission(items: NavItemType[], userRules: string[]): NavItemType[] {
  return items
    .filter((item) => {
      if (!item.rule) return true;
      // Se tem permissionDisabled, mantém o item mesmo sem permissão (será desabilitado)
      if (item.permissionDisabled) return true;
      return userRules.includes(item.rule);
    })
    .map((item) => {
      if (!item.children?.length) return item;
      return {
        ...item,
        children: filterMenuByPermission(item.children, userRules)
      };
    })
    .filter((item) => {
      // Remove collapses/groups que ficaram sem filhos visíveis
      // Mas mantém se tiver permissionDisabled (mesmo sem filhos, será desabilitado)
      if (item.children && item.children.length === 0 && (item.type === 'collapse' || item.type === 'group')) {
        if (item.permissionDisabled) return true; // Mantém se tiver permissionDisabled
        return false;
      }
      return true;
    });
}
