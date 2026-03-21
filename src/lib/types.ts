export interface GlobalOptions {
  json: boolean;
  plain: boolean;
  apiKey?: string;
  storeId?: string;
  limit: number;
  page: number;
  all: boolean;
  noColor: boolean;
}

export interface ApiItem {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

export interface FlatItem {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface ListMeta {
  page: {
    currentPage: number;
    from: number | null;
    lastPage: number;
    perPage: number;
    to: number | null;
    total: number;
  };
}

export interface ListResult {
  data: FlatItem[];
  meta: ListMeta;
}

export interface Column {
  key: string;
  label: string;
  width?: number;
}
