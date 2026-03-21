import type { CommandModule } from "yargs";
import { getProduct, listProducts } from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "price_formatted", label: "Price" },
  { key: "created_at", label: "Created" },
];

export const productsCommand: CommandModule = {
  command: "products",
  describe: "Manage products",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get product details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getProduct(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List products",
        () => {},
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              listProducts({
                filter: { storeId },
                page: { number: argv.page as number, size: argv.limit as number },
              }),
            argv,
          );
          const items = flattenList((data as any).data);
          outputList(items, COLUMNS, (data as any).meta, argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list"),
  handler: () => {},
};
