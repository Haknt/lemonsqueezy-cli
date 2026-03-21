import type { CommandModule } from "yargs";
import { getStore, listStores } from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";
import type { GlobalOptions } from "../lib/types.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "currency", label: "Currency" },
  { key: "total_sales", label: "Sales" },
  { key: "total_revenue", label: "Revenue" },
  { key: "created_at", label: "Created" },
];

export const storeCommand: CommandModule<{}, GlobalOptions> = {
  command: "store",
  describe: "Manage stores",
  builder: (yargs) =>
    yargs
      .command(
        "get [id]",
        "Get store details",
        (y) => y.positional("id", { type: "string", describe: "Store ID" }),
        async (argv) => {
          const id = argv.id || await resolveStoreId(argv);
          const data = await callApi(() => getStore(id), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List all stores",
        () => {},
        async (argv) => {
          const data = await callApi(
            () => listStores({ page: { number: argv.page, size: argv.limit } }),
            argv,
          );
          const items = flattenList((data as any).data);
          outputList(items, COLUMNS, (data as any).meta, argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list"),
  handler: () => {},
};
