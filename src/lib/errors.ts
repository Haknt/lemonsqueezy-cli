export const EXIT_SUCCESS = 0;
export const EXIT_ERROR = 1;
export const EXIT_USAGE = 2;

export interface CliError {
  error: string;
  code: string;
}

const STATUS_CODE_MAP: Record<number, string> = {
  401: "AUTH_INVALID",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
};

export function errorCodeFromStatus(status: number | null): string {
  if (!status) return "NETWORK_ERROR";
  if (status >= 500) return "SERVER_ERROR";
  return STATUS_CODE_MAP[status] || "API_ERROR";
}

export function writeError(err: CliError, opts?: any): void {
  if (opts?.json) {
    process.stderr.write(JSON.stringify(err) + "\n");
  } else {
    process.stderr.write(`Error: ${err.error}\n`);
  }
}

export function fatal(
  message: string,
  code: string,
  exitCode: number,
  opts?: any,
): never {
  writeError({ error: message, code }, opts);
  process.exit(exitCode);
}
