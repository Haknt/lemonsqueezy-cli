import type { CommandModule } from "yargs";
import {
  getCustomer,
  listCustomers,
  createCustomer,
  updateCustomer,
  archiveCustomer,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";
import type { GlobalOptions } from "../lib/types.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "country", label: "Country" },
  { key: "created_at", label: "Created" },
];

export const customersCommand: CommandModule<{}, GlobalOptions> = {
  command: "customers",
  describe: "Manage customers",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get customer details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getCustomer(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List customers",
        (y) =>
          y.option("email", {
            type: "string",
            describe: "Filter by email",
          }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const filter: Record<string, string> = { storeId };
          if (argv.email) filter.email = argv.email;
          const data = await callApi(
            () =>
              listCustomers({
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
        "Create a customer",
        (y) =>
          y
            .option("name", { type: "string", demandOption: true })
            .option("email", { type: "string", demandOption: true })
            .option("city", { type: "string" })
            .option("region", { type: "string" })
            .option("country", { type: "string" }),
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              createCustomer(storeId, {
                name: argv.name,
                email: argv.email,
                city: argv.city,
                region: argv.region,
                country: argv.country,
              } as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "update <id>",
        "Update a customer",
        (y) =>
          y
            .positional("id", { type: "string", demandOption: true })
            .option("name", { type: "string" })
            .option("email", { type: "string" })
            .option("status", { type: "string" }),
        async (argv) => {
          const attrs: Record<string, unknown> = {};
          if (argv.name) attrs.name = argv.name;
          if (argv.email) attrs.email = argv.email;
          if (argv.status) attrs.status = argv.status;
          const data = await callApi(
            () => updateCustomer(argv.id!, attrs as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "archive <id>",
        "Archive a customer",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(
            () => archiveCustomer(argv.id!),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .demandCommand(1, "Specify a subcommand: get, list, create, update, archive"),
  handler: () => {},
};
