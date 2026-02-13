/**
 * Formata nomes próprios com primeira letra maiúscula e o restante minúsculas,
 * exceto para palavras como "de", "do", "da", "dos", "das" que permanecem minúsculas.
 *
 * Exemplos:
 * - "joão da silva" -> "João da Silva"
 * - "MARIA DOS SANTOS" -> "Maria dos Santos"
 * - "pedro de oliveira" -> "Pedro de Oliveira"
 */
export function formatPersonName(name: string): string {
  if (!name || typeof name !== 'string') return name;

  // Lista de palavras que devem permanecer minúsculas
  const lowercaseWords = ['de', 'do', 'da', 'dos', 'das', 'e', 'em', 'na', 'no', 'nas', 'nos'];

  // Divide o nome em palavras, remove espaços extras e converte para minúsculas
  const words = name.trim().toLowerCase().split(/\s+/);

  // Formata cada palavra
  const formattedWords = words.map((word, index) => {
    // Se for a primeira palavra ou não estiver na lista de exceções, capitaliza
    if (index === 0 || !lowercaseWords.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    // Caso contrário, mantém minúscula
    return word;
  });

  return formattedWords.join(' ');
}
