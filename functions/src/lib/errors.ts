import { https } from "firebase-functions/v2";

/**
 * Wrap an async callable handler with standard error handling.
 * Converts unknown errors to typed HttpsError for the client.
 */
export function handleCallable<T, R>(
  fn: (data: T, context: unknown) => Promise<R>
) {
  return async (data: T, context: unknown): Promise<R> => {
    try {
      return await fn(data, context);
    } catch (err: unknown) {
      if (err instanceof https.HttpsError) throw err;
      console.error("[VIGIL Function Error]", err);
      throw new https.HttpsError(
        "internal",
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };
}

export const { HttpsError } = https;
