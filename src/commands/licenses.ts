import type { CommandModule } from "yargs";
import {
  getLicenseKey,
  listLicenseKeys,
  updateLicenseKey,
  getLicenseKeyInstance,
  listLicenseKeyInstances,
  activateLicense,
  deactivateLicense,
  validateLicense,
} from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten, flattenList, resolveStoreId } from "../lib/api.js";
import { outputItem, outputList } from "../lib/output.js";

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "key", label: "Key" },
  { key: "status", label: "Status" },
  { key: "activation_limit", label: "Limit" },
  { key: "created_at", label: "Created" },
];

const INSTANCE_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "identifier", label: "Identifier" },
  { key: "name", label: "Name" },
  { key: "created_at", label: "Created" },
];

export const licensesCommand: CommandModule = {
  command: "licenses",
  describe: "Manage license keys",
  builder: (yargs) =>
    yargs
      .command(
        "get <id>",
        "Get license key details",
        (y) => y.positional("id", { type: "string", demandOption: true }),
        async (argv) => {
          const data = await callApi(() => getLicenseKey(argv.id!), argv);
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "list",
        "List license keys",
        () => {},
        async (argv) => {
          const storeId = await resolveStoreId(argv);
          const data = await callApi(
            () =>
              listLicenseKeys({
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
        "update <id>",
        "Update a license key",
        (y) =>
          y
            .positional("id", { type: "string", demandOption: true })
            .option("activation-limit", { type: "number", describe: "Max activations" })
            .option("disabled", { type: "boolean", describe: "Disable the key" }),
        async (argv) => {
          const attrs: Record<string, unknown> = {};
          if (argv.activationLimit !== undefined) attrs.activation_limit = argv.activationLimit;
          if (argv.disabled !== undefined) attrs.disabled = argv.disabled;
          const data = await callApi(
            () => updateLicenseKey(argv.id!, attrs as any),
            argv,
          );
          outputItem(flatten((data as any).data), argv);
        },
      )
      .command(
        "activate",
        "Activate a license",
        (y) =>
          y
            .option("key", { type: "string", demandOption: true, describe: "License key" })
            .option("instance-name", { type: "string", demandOption: true, describe: "Instance name" }),
        async (argv) => {
          const data = await callApi(
            () => activateLicense(argv.key as string, argv.instanceName as string),
            argv,
          );
          outputItem(data as any, argv);
        },
      )
      .command(
        "deactivate",
        "Deactivate a license",
        (y) =>
          y
            .option("key", { type: "string", demandOption: true, describe: "License key" })
            .option("instance-id", { type: "string", demandOption: true, describe: "Instance ID" }),
        async (argv) => {
          const data = await callApi(
            () => deactivateLicense(argv.key as string, argv.instanceId as string),
            argv,
          );
          outputItem(data as any, argv);
        },
      )
      .command(
        "validate",
        "Validate a license key",
        (y) =>
          y
            .option("key", { type: "string", demandOption: true, describe: "License key" })
            .option("instance-id", { type: "string", describe: "Instance ID" }),
        async (argv) => {
          const data = await callApi(
            () => validateLicense(argv.key as string, argv.instanceId as string || ""),
            argv,
          );
          outputItem(data as any, argv);
        },
      )
      .command(
        "instances",
        "Manage license key instances",
        (y) =>
          y
            .command(
              "get <id>",
              "Get instance details",
              (yy) => yy.positional("id", { type: "string", demandOption: true }),
              async (argv) => {
                const data = await callApi(
                  () => getLicenseKeyInstance(argv.id!),
                  argv,
                );
                outputItem(flatten((data as any).data), argv);
              },
            )
            .command(
              "list",
              "List instances",
              (yy) =>
                yy.option("license-key-id", { type: "string", describe: "Filter by license key ID" }),
              async (argv) => {
                const filter: Record<string, string> = {};
                if (argv.licenseKeyId) filter.licenseKeyId = argv.licenseKeyId as string;
                const data = await callApi(
                  () =>
                    listLicenseKeyInstances({
                      filter,
                      page: { number: argv.page as number, size: argv.limit as number },
                    }),
                  argv,
                );
                const items = flattenList((data as any).data);
                outputList(items, INSTANCE_COLUMNS, (data as any).meta, argv);
              },
            )
            .demandCommand(1, "Specify a subcommand: get, list"),
      )
      .demandCommand(
        1,
        "Specify a subcommand: get, list, update, activate, deactivate, validate, instances",
      ),
  handler: () => {},
};
