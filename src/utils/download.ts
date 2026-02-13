export function extractFilenameFromContentDisposition(contentDisposition?: string | null): string | null {
  if (!contentDisposition) return null;

  // RFC 5987: filename*=UTF-8''encoded%20name.docx
  const filenameStarMatch = contentDisposition.match(/filename\*\s*=\s*([^;]+)/i);
  if (filenameStarMatch) {
    let value = filenameStarMatch[1].trim();
    value = value.replace(/^"(.*)"$/, '$1');

    // geralmente: UTF-8''<urlencoded>
    const parts = value.split("''");
    if (parts.length === 2) {
      const encoded = parts[1];
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  // filename="name.docx" ou filename=name.docx
  const filenameMatch = contentDisposition.match(/filename\s*=\s*([^;]+)/i);
  if (filenameMatch) {
    let value = filenameMatch[1].trim();
    value = value.replace(/^"(.*)"$/, '$1');
    return value || null;
  }

  return null;
}

export function triggerBrowserDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // dá tempo do browser iniciar o download antes de revogar
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/**
 * Converte uma string para title case (primeira letra maiúscula, resto minúscula)
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Formata o nome do arquivo do contrato como "nome do contrato - nome do cliente.extensão"
 * Remove caracteres inválidos para nomes de arquivo e aplica title case
 */
export function formatContractFilename(
  contractTitle: string | null | undefined,
  customerName: string | null | undefined,
  extension: 'pdf' | 'docx'
): string {
  // Função para limpar caracteres inválidos em nomes de arquivo
  const sanitize = (str: string): string => {
    return str
      .replace(/[<>:"/\\|?*]/g, '') // Remove caracteres inválidos
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim();
  };

  const title = sanitize(contractTitle || 'Contrato');
  const customer = sanitize(customerName || 'Cliente');

  // Aplica title case (primeira letra maiúscula, resto minúscula)
  const formattedTitle = toTitleCase(title);
  const formattedCustomer = toTitleCase(customer);

  return `${formattedTitle} - ${formattedCustomer}.${extension}`;
}
