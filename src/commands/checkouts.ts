import type { CommandModule } from "yargs";
import {
  getCheckout,
  listCheckouts,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "url", label: "URL" },
  { key: "created_at", label: "Created" },
  { key: "expires_at", label: "Expires" },
];

export const checkoutsCommand: CommandModule = {
  command: "checkouts",
  describe: "Manage checkouts",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get checkout details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getCheckout(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List checkouts",
        () => {},
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              listCheckouts({
                filter: { storeId },
                page: { number: argv.page as number, size: argv.limit as number },
              }),
            argv,
          );
          const items = flattenList((data as any).data);
          outputList(items, COLUMNS, (data as any).meta, argv);
        },
      )
      .command(
        "create",
        "Create a checkout link",
        (y) =>
          y
            .option("variant-id", {
              type: "string",
              demandOption: true,
              describe: "Variant ID for the checkout",
            })
            .option("email", { type: "string", describe: "Pre-fill customer email" })
            .option("custom-data", {
              type: "string",
              describe: "Custom data as JSON string",
            })
            .option("redirect-url", { type: "string", describe: "Redirect URL after purchase" })
            .option("expires-at", { type: "string", describe: "Expiry date (ISO 8601)" }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const checkoutData: Record<string, unknown> = {};
          if (argv.email) checkoutData.email = argv.email;
          if (argv.customData) {
            try {
              checkoutData.custom = JSON.parse(argv.customData as string);
            } catch {
              checkoutData.custom = argv.customData;
            }
          }

          const productOptions: Record<string, unknown> = {};
          if (argv.redirectUrl) productOptions.redirectUrl = argv.redirectUrl;

          const opts: Record<string, unknown> = { checkoutData };
          if (Object.keys(productOptions).length) opts.productOptions = productOptions;
          if (argv.expiresAt) opts.expiresAt = argv.expiresAt;

          const data = await callApi(
            () => createCheckout(storeId, argv.variantId as string, opts as any),
            argv,
          );
          const item = flatten((data as any).data);
          outputItem(item, argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list, create"),
  handler: () => {},
};
