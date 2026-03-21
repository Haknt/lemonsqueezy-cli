import { lemonSqueezySetup, listStores } from "@lemonsqueezy/lemonsqueezy.js";
import {
  fatal,
  writeError,
  errorCodeFromStatus,
  EXIT_ERROR,
} from "./errors.js";
import type { GlobalOptions, ApiItem, FlatItem, ListMeta } from "./types.js";

let initialized = false;
let cachedStoreId: string | undefined;

export function initApi(opts: Partial<GlobalOptions>): void {
  if (initialized) return;

  const apiKey = opts.apiKey || process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    fatal(
      "Authentication required. Set LEMONSQUEEZY_API_KEY or pass --api-key.",
      "AUTH_REQUIRED",
      EXIT_ERROR,
      opts,
    );
  }

  lemonSqueezySetup({
    apiKey,
    onError: () => {},
  });
  initialized = true;
}

export function flatten(item: ApiItem): FlatItem {
  return {
    id: item.id,
    type: item.type,
    ...item.attributes,
  };
}

export function flattenList(
  items: ApiItem[],
): FlatItem[] {
  return items.map(flatten);
}

export async function callApi<T>(
  fn: () => Promise<{ data: T | null; error: unknown; statusCode?: number | null }>,
  opts: Partial<GlobalOptions>,
): Promise<T> {
  initApi(opts);

  try {
    const result = await fn();
    if (result.error || !result.data) {
      const statusCode =
        typeof result.statusCode === "number" ? result.statusCode : null;
      const code = errorCodeFromStatus(statusCode);
      const message =
        result.error && typeof result.error === "object" && "message" in result.error
          ? String((result.error as { message: string }).message)
          : `API request failed (status ${statusCode || "unknown"})`;
      fatal(message, code, EXIT_ERROR, opts);
    }
    return result.data;
  } catch (err) {
    fatal(
      err instanceof Error ? err.message : String(err),
      "UNEXPECTED_ERROR",
      EXIT_ERROR,
      opts,
    );
  }
}

export async function resolveStoreId(
  opts: Partial<GlobalOptions>,
): Promise<string> {
  const explicit = opts.storeId || process.env.LEMONSQUEEZY_STORE_ID;
  if (explicit) return explicit;

  if (cachedStoreId) return cachedStoreId;

  initApi(opts);
  const data = await callApi(() => listStores(), opts);
  const stores = (data as unknown as { data: ApiItem[] }).data;
  if (!stores?.length) {
    fatal("No stores found for this API key.", "NOT_FOUND", EXIT_ERROR, opts);
  }
  cachedStoreId = stores[0].id;
  return cachedStoreId;
}
