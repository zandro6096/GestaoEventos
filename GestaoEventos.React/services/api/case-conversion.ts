function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function toCamelKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toSnakeKey(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toCamelCase<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelCase(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value as T;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [toCamelKey(key), toCamelCase(entry)]),
  ) as T;
}

export function toSnakeCase<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => toSnakeCase(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value as T;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [toSnakeKey(key), toSnakeCase(entry)]),
  ) as T;
}
