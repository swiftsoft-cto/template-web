/**
 * Handler global para erros de importação dinâmica (chunk loading errors)
 * Este handler detecta quando um módulo não pode ser carregado e tenta recuperar
 */

let retryCount = 0;
const MAX_RETRIES = 3;

export function setupChunkErrorHandler() {
  // Listener para erros não capturados
  window.addEventListener('error', (event) => {
    const error = event.error || event;
    const message = error?.message || String(error);

    if (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('ChunkLoadError') ||
      message.includes('Importing a module script failed')
    ) {
      event.preventDefault();
      handleChunkError(error);
    }
  });

  // Listener para promises rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error?.message || String(error);

    if (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('ChunkLoadError') ||
      message.includes('Importing a module script failed')
    ) {
      event.preventDefault();
      handleChunkError(error);
    }
  });
}

function handleChunkError(error: any) {
  console.warn('Erro de chunk detectado, tentando recuperar...', error);

  if (retryCount >= MAX_RETRIES) {
    console.error('Máximo de tentativas atingido, recarregando página...');
    clearCacheAndReload();
    return;
  }

  retryCount++;

  // Limpa cache relacionado a chunks
  const reload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (typeof window !== 'undefined' && 'caches' in window && window.caches) {
    window.caches.keys().then((names) => {
      const chunkCaches = names.filter(
        (name) => name.includes('chunk') || name.includes('index') || name.includes('vite') || name.includes('js')
      );

      Promise.all(chunkCaches.map((name) => window.caches?.delete(name))).then(() => {
        console.log('Cache limpo, recarregando...');
        setTimeout(() => {
          reload();
        }, 1000);
      });
    });
  } else {
    // Se não houver suporte a cache API, apenas recarrega
    setTimeout(() => {
      reload();
    }, 1000);
  }
}

function clearCacheAndReload() {
  // Limpa todos os caches
  const reload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (typeof window !== 'undefined' && 'caches' in window && window.caches) {
    window.caches.keys().then((names) => {
      Promise.all(names.map((name) => window.caches?.delete(name))).then(() => {
        reload();
      });
    });
  } else {
    reload();
  }
}

// Função para resetar o contador de tentativas (útil após recarregar com sucesso)
export function resetRetryCount() {
  retryCount = 0;
}
