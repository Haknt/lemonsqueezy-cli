import type { GlobalOptions, FlatItem, ListMeta, Column } from "./types.js";

const useColor =
  !process.env.NO_COLOR && process.argv.indexOf("--no-color") === -1;

function dim(s: string): string {
  return useColor ? `\x1b[2m${s}\x1b[0m` : s;
}

function bold(s: string): string {
  return useColor ? `\x1b[1m${s}\x1b[0m` : s;
}

export function outputItem(
  item: FlatItem,
  opts: Partial<GlobalOptions>,
): void {
  if (opts.json) {
    process.stdout.write(JSON.stringify(item) + "\n");
    return;
  }

  if (opts.plain) {
    const values = Object.entries(item)
      .filter(([k]) => k !== "type")
      .map(([, v]) => formatValue(v));
    process.stdout.write(values.join("\t") + "\n");
    return;
  }

  // Human-readable key-value
  const maxKeyLen = Math.max(
    ...Object.keys(item).map((k) => k.length),
  );
  for (const [key, value] of Object.entries(item)) {
    if (key === "type") continue;
    const label = dim(key.padEnd(maxKeyLen) + ":");
    process.stdout.write(`${label} ${formatValue(value)}\n`);
  }
}

export function outputList(
  items: FlatItem[],
  columns: Column[],
  meta: ListMeta | null,
  opts: Partial<GlobalOptions>,
): void {
  if (opts.json) {
    const output: Record<string, unknown> = { data: items };
    if (meta) output.meta = { page: meta.page };
    process.stdout.write(JSON.stringify(output) + "\n");
    return;
  }

  if (opts.plain) {
    for (const item of items) {
      const values = columns.map((col) => formatValue(item[col.key]));
      process.stdout.write(values.join("\t") + "\n");
    }
    return;
  }

  // Human-readable table
  if (!items.length) {
    process.stdout.write("(empty)\n");
    return;
  }

  const colWidths = columns.map((col) => {
    const values = items.map((item) => String(formatValue(item[col.key])));
    return Math.max(col.label.length, ...values.map((v) => v.length));
  });

  // Header
  const header = columns
    .map((col, i) => bold(col.label.padEnd(colWidths[i])))
    .join("  ");
  process.stdout.write(` ${header}\n`);

  // Separator
  const sep = colWidths.map((w) => "─".repeat(w)).join("──");
  process.stdout.write(` ${dim(sep)}\n`);

  // Rows
  for (const item of items) {
    const row = columns
      .map((col, i) => String(formatValue(item[col.key])).padEnd(colWidths[i]))
      .join("  ");
    process.stdout.write(` ${row}\n`);
  }

  // Footer
  if (meta?.page) {
    const { currentPage, lastPage, total } = meta.page;
    process.stdout.write(
      `\n${dim(`Showing page ${currentPage} of ${lastPage} (${total} total)`)}` +
        "\n",
    );
  }
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
