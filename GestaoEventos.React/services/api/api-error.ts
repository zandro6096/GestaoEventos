import { isAxiosError } from 'axios';

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly raw?: unknown;

  constructor(message: string, options: { status?: number; code?: string; raw?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.raw = options.raw;
  }
}

export function normalizeApiError(error: unknown, fallbackMessage: string) {
  if (!isAxiosError(error)) {
    if (error instanceof Error) {
      return new ApiError(error.message || fallbackMessage, { raw: error });
    }

    return new ApiError(fallbackMessage, { raw: error });
  }

  const body = error.response?.data;
  const firstError = extractFirstError(body);

  return new ApiError(firstError.message ?? fallbackMessage, {
    status: error.response?.status,
    code: firstError.code,
    raw: body,
  });
}

function extractFirstError(body: unknown): { message?: string; code?: string } {
  const bodyRecord = asRecord(body);
  if (!bodyRecord) return {};

  const directMessage = getString(bodyRecord.message)
    ?? getString(bodyRecord.mensagem)
    ?? getString(bodyRecord.error)
    ?? getString(bodyRecord.errorMessage)
    ?? getString(bodyRecord.error_message);

  const errors = bodyRecord.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    return extractErrorEntry(errors[0], directMessage);
  }

  const errorRecord = asRecord(errors);
  if (errorRecord) {
    const firstValue = Object.values(errorRecord)[0];
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return extractErrorEntry(firstValue[0], directMessage);
    }

    return extractErrorEntry(firstValue, directMessage);
  }

  return { message: directMessage };
}

function extractErrorEntry(entry: unknown, fallback?: string): { message?: string; code?: string } {
  const record = asRecord(entry);
  if (!record) {
    return { message: getString(entry) ?? fallback };
  }

  return {
    message:
      getString(record.errorMessage)
      ?? getString(record.error_message)
      ?? getString(record.message)
      ?? getString(record.mensagem)
      ?? fallback,
    code: getString(record.errorCode) ?? getString(record.error_code),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}
