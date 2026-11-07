export enum TransactionCategory {
  GROCERIES = 'GROCERIES',
  UTILITIES = 'UTILITIES',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER',
}

export enum ParseErrorCode {
  INVALID_TRANSACTION_CATEGORY = 'INVALID_TRANSACTION_CATEGORY',
}

export type ParseResult<T> =
  | { success: true; value: T }
  | { success: false; error: ParseErrorCode };

export function parseTransactionCategory(
  input: unknown,
): ParseResult<TransactionCategory> {
  switch (input) {
    case TransactionCategory.GROCERIES:
      return { success: true, value: TransactionCategory.GROCERIES };
    case TransactionCategory.UTILITIES:
      return { success: true, value: TransactionCategory.UTILITIES };
    case TransactionCategory.TRANSPORT:
      return { success: true, value: TransactionCategory.TRANSPORT };
    case TransactionCategory.OTHER:
      return { success: true, value: TransactionCategory.OTHER };
    default:
      return {
        success: false,
        error: ParseErrorCode.INVALID_TRANSACTION_CATEGORY,
      };
  }
}

export function getTransactionCategoryLabel(
  category: TransactionCategory,
): string {
  switch (category) {
    case TransactionCategory.GROCERIES:
      return 'Alimentos';
    case TransactionCategory.UTILITIES:
      return 'Servicios';
    case TransactionCategory.TRANSPORT:
      return 'Transporte';
    case TransactionCategory.OTHER:
      return 'Otros';
  }
}
