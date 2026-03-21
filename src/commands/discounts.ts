import type { CommandModule } from "yargs";
import {
  getDiscount,
  listDiscounts,
  createDiscount,
  deleteDiscount,
  getDiscountRedemption,
  listDiscountRedemptions,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "code", label: "Code" },
  { key: "amount", label: "Amount" },
  { key: "amount_type", label: "Type" },
  { key: "created_at", label: "Created" },
];

const REDEMPTION_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "discount_id", label: "Discount" },
  { key: "order_id", label: "Order" },
  { key: "created_at", label: "Created" },
];

export const discountsCommand: CommandModule = {
  command: "discounts",
  describe: "Manage discounts",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get discount details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getDiscount(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List discounts",
        () => {},
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              listDiscounts({
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
        "Create a discount",
        (y) =>
          y
            .option("name", { type: "string", demandOption: true })
            .option("code", { type: "string", demandOption: true })
            .option("amount", { type: "number", demandOption: true, describe: "Discount amount" })
            .option("amount-type", {
              type: "string",
              demandOption: true,
              choices: ["percent", "fixed"],
              describe: "Discount type",
            }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              createDiscount({
                storeId: Number(storeId),
                name: argv.name as string,
                code: argv.code as string,
                amount: argv.amount as number,
                amountType: argv.amountType as "percent" | "fixed",
              } as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "delete <id>",
        "Delete a discount",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          await callApi(() => deleteDiscount(argv.id!), argv);
          if (argv.json) {
            process.stdout.write(JSON.stringify({ deleted: true, id: argv.id }) + "\n");
          } else {
            process.stdout.write(`Discount ${argv.id} deleted.\n`);
          }
        },
      )
      .command(
        "redemptions",
        "Manage discount redemptions",
        (y) =>
          y
            .command(
              "get <id>",
              "Get redemption details",
              (yy) => yy.positional("id", { type: "string", demandOption: true }),
              async (argv) => {
                const data = await callApi(
                  () => getDiscountRedemption(argv.id!),
                  argv,
                );
                outputItem(flatten((data as any).data), argv);
              },
            )
            .command(
              "list",
              "List redemptions",
              (yy) =>
                yy.option("discount-id", { type: "string", describe: "Filter by discount ID" }),
              async (argv) => {
                const filter: Record<string, string> = {};
                if (argv.discountId) filter.discountId = argv.discountId as string;
                const data = await callApi(
                  () =>
                    listDiscountRedemptions({
                      filter,
                      page: { number: argv.page as number, size: argv.limit as number },
                    }),
                  argv,
                );
                const items = flattenList((data as any).data);
                outputList(items, REDEMPTION_COLUMNS, (data as any).meta, argv);
              },
            )
            .demandCommand(1, "Specify a subcommand: get, list"),
      )
      .demandCommand(1, "Specify a subcommand: get, list, create, delete, redemptions"),
  handler: () => {},
};
