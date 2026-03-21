import type { CommandModule } from "yargs";
import {
  getOrder,
  listOrders,
  generateOrderInvoice,
  issueOrderRefund,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "status", label: "Status" },
  { key: "total_formatted", label: "Total" },
  { key: "user_email", label: "Email" },
  { key: "created_at", label: "Created" },
];

export const ordersCommand: CommandModule = {
  command: "orders",
  describe: "Manage orders",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get order details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getOrder(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List orders",
        (y) =>
          y.option("user-email", {
            type: "string",
            describe: "Filter by user email",
          }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const filter: Record<string, string> = { storeId };
          if (argv.userEmail) filter.userEmail = argv.userEmail as string;
          const data = await callApi(
            () =>
              listOrders({
                filter,
                page: { number: argv.page as number, size: argv.limit as number },
              }),
            argv,
          );
          const items = flattenList((data as any).data);
          outputList(items, COLUMNS, (data as any).meta, argv);
        },
      )
      .command(
        "invoice <id>",
        "Generate order invoice",
        (y) =>
          y
            .positional("id", { type: "string", demandOption: true })
            .option("name", { type: "string" })
            .option("address", { type: "string" })
            .option("notes", { type: "string" }),
        async (argv) => {
          const data = await callApi(
            () =>
              generateOrderInvoice(argv.id!, {
                name: argv.name,
                address: argv.address,
                notes: argv.notes,
              } as any),
            argv,
          );
          outputItem({ id: argv.id!, type: "invoice", ...(data as any) }, argv);
        },
      )
      .command(
        "refund <id>",
        "Refund an order",
        (y) =>
          y
            .positional("id", { type: "string", demandOption: true })
            .option("amount", {
              type: "number",
              demandOption: true,
              describe: "Refund amount in cents",
            }),
        async (argv) => {
          const data = await callApi(
            () => issueOrderRefund(argv.id!, argv.amount),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list, invoice, refund"),
  handler: () => {},
};
