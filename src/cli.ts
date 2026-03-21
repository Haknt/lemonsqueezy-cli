import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { authCommand } from "./commands/auth.js";
import { storeCommand } from "./commands/store.js";
import { productsCommand } from "./commands/products.js";
import { variantsCommand } from "./commands/variants.js";
import { customersCommand } from "./commands/customers.js";
import { ordersCommand } from "./commands/orders.js";
import { subscriptionsCommand } from "./commands/subscriptions.js";
import { checkoutsCommand } from "./commands/checkouts.js";
import { webhooksCommand } from "./commands/webhooks.js";
import { discountsCommand } from "./commands/discounts.js";
import { licensesCommand } from "./commands/licenses.js";
import { usageCommand } from "./commands/usage.js";

export function buildCli() {
  return yargs(hideBin(process.argv))
    .scriptName("lemonsqueezy")
    .usage("Usage: $0 <resource> <action> [id] [flags]")
    .option("json", {
      type: "boolean",
      default: false,
      describe: "Output as JSON",
    })
    .option("plain", {
      type: "boolean",
      default: false,
      describe: "Output as tab-separated plain text",
    })
    .option("api-key", {
      type: "string",
      describe: "LemonSqueezy API key (overrides LEMONSQUEEZY_API_KEY)",
    })
    .option("store-id", {
      type: "string",
      describe: "Default store ID (overrides LEMONSQUEEZY_STORE_ID)",
    })
    .option("limit", {
      type: "number",
      default: 10,
      describe: "Page size for list commands",
    })
    .option("page", {
      type: "number",
      default: 1,
      describe: "Page number for list commands",
    })
    .option("all", {
      type: "boolean",
      default: false,
      describe: "Fetch all pages",
    })
    .option("no-color", {
      type: "boolean",
      default: false,
      describe: "Disable color output",
    })
    .command(authCommand)
    .command(storeCommand)
    .command(productsCommand)
    .command(variantsCommand)
    .command(customersCommand)
    .command(ordersCommand)
    .command(subscriptionsCommand)
    .command(checkoutsCommand)
    .command(webhooksCommand)
    .command(discountsCommand)
    .command(licensesCommand)
    .command(usageCommand)
    .demandCommand(1, "Please specify a resource. Run --help for usage.")
    .strict()
    .fail((msg, err) => {
      if (err) throw err;
      const isJson = process.argv.includes("--json");
      if (isJson) {
        process.stderr.write(
          JSON.stringify({ error: msg, code: "USAGE_ERROR" }) + "\n",
        );
      } else {
        process.stderr.write(`Error: ${msg}\n`);
        process.stderr.write("Run with --help for usage.\n");
      }
      process.exit(2);
    })
    .version()
    .help()
    .alias("h", "help")
    .wrap(Math.min(100, process.stdout.columns || 80));
}
