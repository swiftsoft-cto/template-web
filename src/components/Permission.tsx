import { ReactNode, Children, cloneElement, isValidElement } from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionProps {
  rule: string | string[];
  children: ReactNode;
  /** Conteúdo exibido quando o usuário não tem permissão (ex: mensagem ou botão) */
  fallback?: ReactNode;
  /** Se true, desabilita o primeiro elemento filho ao invés de ocultar */
  disabled?: boolean;
}

/**
 * Renderiza children apenas se o usuário tiver a(s) regra(s) informada(s).
 * Se disabled=true, desabilita o primeiro elemento filho ao invés de ocultar.
 */
export default function Permission({ rule, children, fallback, disabled = false }: PermissionProps) {
  const can = usePermission(rule);

  if (!can) {
    if (disabled) {
      // Se disabled=true e não tem permissão, desabilita o primeiro filho mas mantém todos os children
      const childrenArray = Children.toArray(children);
      if (childrenArray.length > 0 && isValidElement(childrenArray[0])) {
        const firstChild = cloneElement(childrenArray[0] as React.ReactElement<any>, { disabled: true });
        // Se há mais children, renderiza todos
        if (childrenArray.length > 1) {
          return (
            <>
              {firstChild}
              {childrenArray.slice(1)}
            </>
          );
        }
        return <>{firstChild}</>;
      }
      return <>{children}</>;
    }
    return <>{fallback ?? null}</>;
  }

  // Se tem permissão, renderiza normalmente
  return <>{children}</>;
}
