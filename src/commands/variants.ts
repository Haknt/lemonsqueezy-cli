import type { CommandModule } from "yargs";
import { getVariant, listVariants } from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";
import type { GlobalOptions } from "../lib/types.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "price", label: "Price" },
  { key: "is_subscription", label: "Subscription" },
  { key: "status", label: "Status" },
  { key: "sort", label: "Sort" },
];

export const variantsCommand: CommandModule<{}, GlobalOptions> = {
  command: "variants",
  describe: "Manage variants",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get variant details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getVariant(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List variants",
        (y) =>
          y.option("product-id", {
            type: "string",
            describe: "Filter by product ID",
          }),
        async (argv) => {
          const filter: Record<string, string> = {};
          if (argv.productId) filter.productId = argv.productId as string;
          const data = await callApi(
            () =>
              listVariants({
                filter,
                page: { number: argv.page, size: argv.limit },
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
