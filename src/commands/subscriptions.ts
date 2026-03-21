import type { CommandModule } from "yargs";
import {
  getSubscription,
  listSubscriptions,
  updateSubscription,
  cancelSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";
import type { GlobalOptions } from "../lib/types.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "status", label: "Status" },
  { key: "user_email", label: "Email" },
  { key: "product_name", label: "Product" },
  { key: "variant_name", label: "Variant" },
  { key: "renews_at", label: "Renews" },
  { key: "created_at", label: "Created" },
];

export const subscriptionsCommand: CommandModule<{}, GlobalOptions> = {
  command: "subscriptions",
  describe: "Manage subscriptions",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get subscription details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getSubscription(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List subscriptions",
        (y) =>
          y.option("status", {
            type: "string",
            describe: "Filter by status (active, paused, cancelled, etc.)",
          }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const filter: Record<string, string> = { storeId };
          if (argv.status) filter.status = argv.status;
          const data = await callApi(
            () =>
              listSubscriptions({
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
        "update <id>",
        "Update a subscription",
        (y) =>
          y
            .positional("id", { type: "string", demandOption: true })
            .option("variant-id", { type: "string", describe: "Change plan variant" })
            .option("pause", { type: "boolean", describe: "Pause the subscription" })
            .option("unpause", { type: "boolean", describe: "Resume a paused subscription" })
            .option("billing-anchor", { type: "number", describe: "Day of month for billing" }),
        async (argv) => {
          const attrs: Record<string, unknown> = {};
          if (argv.variantId) attrs.variant_id = Number(argv.variantId);
          if (argv.pause) attrs.pause = { mode: "void" };
          if (argv.unpause) attrs.pause = null;
          if (argv.billingAnchor) attrs.billing_anchor = argv.billingAnchor;
          const data = await callApi(
            () => updateSubscription(argv.id!, attrs as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "cancel <id>",
        "Cancel a subscription",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => cancelSubscription(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list, update, cancel"),
  handler: () => {},
};
