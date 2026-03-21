import type { CommandModule } from "yargs";
import {
  getUsageRecord,
  listUsageRecords,
  createUsageRecord,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";
import type { GlobalOptions } from "../lib/types.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "subscription_item_id", label: "Sub Item" },
  { key: "quantity", label: "Quantity" },
  { key: "action", label: "Action" },
  { key: "created_at", label: "Created" },
];

export const usageCommand: CommandModule<{}, GlobalOptions> = {
  command: "usage",
  describe: "Manage usage records",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get usage record details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getUsageRecord(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List usage records",
        (y) =>
          y.option("subscription-item-id", {
            type: "string",
            describe: "Filter by subscription item ID",
          }),
        async (argv) => {
          const filter: Record<string, string> = {};
          if (argv.subscriptionItemId)
            filter.subscriptionItemId = argv.subscriptionItemId as string;
          const data = await callApi(
            () =>
              listUsageRecords({
                filter,
                page: { number: argv.page, size: argv.limit },
              }),
            argv,
          );
          const items = flattenList((data as any).data);
          outputList(items, COLUMNS, (data as any).meta, argv);
        },
      )
      .command(
        "create",
        "Create a usage record",
        (y) =>
          y
            .option("subscription-item-id", {
              type: "string",
              demandOption: true,
              describe: "Subscription item ID",
            })
            .option("quantity", {
              type: "number",
              demandOption: true,
              describe: "Usage quantity",
            })
            .option("action", {
              type: "string",
              default: "increment",
              choices: ["increment", "set"],
              describe: "Usage action",
            }),
        async (argv) => {
          const data = await callApi(
            () =>
              createUsageRecord(argv.subscriptionItemId as string, {
                quantity: argv.quantity as number,
                action: argv.action as "increment" | "set",
              } as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list, create"),
  handler: () => {},
};
