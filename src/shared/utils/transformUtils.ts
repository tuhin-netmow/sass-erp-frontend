/**
 * Convert snake_case string to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Recursively convert all keys in an object from snake_case to camelCase
 * Also adds `id` field when `_id` is present (for MongoDB compatibility)
 */
export function keysToCamelCase<T>(obj: unknown): T {
  if (obj === null || typeof obj !== 'object') {
    return obj as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamelCase(item)) as T;
  }

  // Handle objects
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      // Keep _id as is (common in MongoDB) and also add as `id`
      const newKey = key === '_id' ? '_id' : camelKey;
      result[newKey] = keysToCamelCase((obj as Record<string, unknown>)[key]);

      // Add `id` field when `_id` is present
      if (key === '_id') {
        result.id = (obj as Record<string, unknown>)[key];
      }
    }
  }
  return result as T;
}

/**
 * Recursively convert all keys in an object from camelCase to snake_case
 */
export function keysToSnakeCase<T>(obj: unknown): T {
  if (obj === null || typeof obj !== 'object') {
    return obj as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnakeCase(item)) as T;
  }

  // Handle objects
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Keep _id as is (common in MongoDB)
      const newKey = key === '_id' ? '_id' : toSnakeCase(key);
      result[newKey] = keysToSnakeCase((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
}

/**
 * Transform API response data from snake_case to camelCase
 */
export function transformApiResponse<T>(data: unknown): T {
  return keysToCamelCase<T>(data);
}

/**
 * Transform request body from camelCase to snake_case
 */
export function transformApiRequest<T>(data: T): Record<string, unknown> {
  return keysToSnakeCase(data as Record<string, unknown>);
}
