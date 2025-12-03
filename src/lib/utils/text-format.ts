export type TextFormatType = 'capitalize-words' | 'capitalize-first' | 'uppercase' | 'lowercase';

/**
 * Format text theo các kiểu khác nhau
 * @param text - Text cần format
 * @param type - Kiểu format: 
 *   - 'capitalize-words': Viết hoa chữ cái đầu mỗi từ
 *   - 'capitalize-first': Viết hoa chữ cái đầu câu
 *   - 'uppercase': Viết hoa tất cả
 *   - 'lowercase': Viết thường tất cả
 */
export function formatText(text: string, type: TextFormatType): string {
  if (!text) return '';

  switch (type) {
    case 'capitalize-words':
      return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    case 'capitalize-first':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    case 'uppercase':
      return text.toUpperCase();

    case 'lowercase':
      return text.toLowerCase();

    default:
      return text;
  }
}

/**
 * Check if text contains CJK (Chinese, Japanese, Korean) characters
 */
function hasCJKCharacters(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(text);
}

/**
 * Viết hoa chữ cái đầu mỗi từ (chỉ áp dụng cho chữ Latin)
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  if (hasCJKCharacters(text)) return text;
  return formatText(text, 'capitalize-words');
}

/**
 * Viết hoa chữ cái đầu câu
 */
export function capitalizeFirst(text: string): string {
  return formatText(text, 'capitalize-first');
}

/**
 * Viết hoa tất cả (chỉ áp dụng cho chữ Latin)
 */
export function toUpperCase(text: string): string {
  if (!text) return '';
  if (hasCJKCharacters(text)) return text;
  return formatText(text, 'uppercase');
}

/**
 * Viết thường tất cả
 */
export function toLowerCase(text: string): string {
  return formatText(text, 'lowercase');
}
