import { describe, it, expect, vi, beforeEach } from "vitest";

describe("output", () => {
  let stdoutData: string;

  beforeEach(() => {
    stdoutData = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk: any) => {
      stdoutData += chunk;
      return true;
    });
  });

  it("outputItem writes JSON when opts.json is true", async () => {
    const { outputItem } = await import("../src/lib/output.js");
    const item = { id: "123", type: "products", name: "Test" };
    outputItem(item, { json: true });
    expect(JSON.parse(stdoutData)).toEqual(item);
  });

  it("outputItem writes plain when opts.plain is true", async () => {
    const { outputItem } = await import("../src/lib/output.js");
    const item = { id: "123", type: "products", name: "Test" };
    outputItem(item, { plain: true });
    expect(stdoutData).toContain("123");
    expect(stdoutData).toContain("Test");
    expect(stdoutData).toContain("\t");
  });

  it("outputList writes JSON array with meta", async () => {
    const { outputList } = await import("../src/lib/output.js");
    const items = [{ id: "1", type: "products", name: "A" }];
    const columns = [{ key: "id", label: "ID" }, { key: "name", label: "Name" }];
    const meta = { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 10, to: 1, total: 1 } };
    outputList(items, columns, meta, { json: true });
    const parsed = JSON.parse(stdoutData);
    expect(parsed.data).toHaveLength(1);
    expect(parsed.meta.page.total).toBe(1);
  });

  it("outputList writes tab-separated plain", async () => {
    const { outputList } = await import("../src/lib/output.js");
    const items = [{ id: "1", type: "products", name: "A" }];
    const columns = [{ key: "id", label: "ID" }, { key: "name", label: "Name" }];
    outputList(items, columns, null, { plain: true });
    expect(stdoutData.trim()).toBe("1\tA");
  });

  it("outputList writes (empty) for no items in human mode", async () => {
    const { outputList } = await import("../src/lib/output.js");
    outputList([], [{ key: "id", label: "ID" }], null, {});
    expect(stdoutData).toContain("(empty)");
  });
});
