import { useMemo } from 'react';
import useAuth from './useAuth';

/**
 * Verifica se o usuário tem uma ou mais regras.
 * @param rule - Regra única (ex: 'transcriptions.read') ou array de regras (qualquer uma)
 */
export function usePermission(rule: string | string[]): boolean {
  const { user } = useAuth();
  return useMemo(() => {
    const rules = user?.rules ?? [];
    if (Array.isArray(rule)) {
      return rule.some((r) => rules.includes(r));
    }
    return rules.includes(rule);
  }, [user?.rules, rule]);
}
