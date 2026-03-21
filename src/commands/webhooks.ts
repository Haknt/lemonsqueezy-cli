import type { CommandModule } from "yargs";
import {
  getWebhook,
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "url", label: "URL" },
  { key: "events", label: "Events" },
  { key: "created_at", label: "Created" },
];

export const webhooksCommand: CommandModule = {
  command: "webhooks",
  describe: "Manage webhooks",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get webhook details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getWebhook(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List webhooks",
        () => {},
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              listWebhooks({
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
        "Create a webhook",
        (y) =>
          y
            .option("url", { type: "string", demandOption: true, describe: "Webhook URL" })
            .option("events", {
              type: "string",
              demandOption: true,
              describe: "Comma-separated events (e.g., subscription_created,order_created)",
            })
            .option("secret", { type: "string", demandOption: true, describe: "Webhook signing secret" }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const events = (argv.events as string).split(",").map((e) => e.trim()) as any[];
          const data = await callApi(
            () =>
              createWebhook(storeId, {
                url: argv.url as string,
                events,
                secret: argv.secret as string,
              }),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "update <id>",
        "Update a webhook",
        (y) =>
          y
            .positional("id", { type: "string", demandOption: true })
            .option("url", { type: "string" })
            .option("events", { type: "string", describe: "Comma-separated events" })
            .option("secret", { type: "string" }),
        async (argv) => {
          const attrs: Record<string, unknown> = {};
          if (argv.url) attrs.url = argv.url;
          if (argv.events) attrs.events = (argv.events as string).split(",").map((e) => e.trim());
          if (argv.secret) attrs.secret = argv.secret;
          const data = await callApi(
            () => updateWebhook(argv.id!, attrs as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "delete <id>",
        "Delete a webhook",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          await callApi(() => deleteWebhook(argv.id!), argv);
          if (argv.json) {
            process.stdout.write(JSON.stringify({ deleted: true, id: argv.id }) + "\n");
          } else {
            process.stdout.write(`Webhook ${argv.id} deleted.\n`);
          }
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list, create, update, delete"),
  handler: () => {},
};
