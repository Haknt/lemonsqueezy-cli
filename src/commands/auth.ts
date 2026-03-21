import type { CommandModule } from "yargs";
import { getAuthenticatedUser } from "@lemonsqueezy/lemonsqueezy.js";
import { callApi, flatten } from "../lib/api.js";
import { outputItem } from "../lib/output.js";

export const authCommand: CommandModule = {
  command: "auth",
  describe: "Authentication commands",
  builder: (yargs) =>
    yargs.command(
      "whoami",
      "Show authenticated user info",
      () => {},
      async (argv) => {
        const data = await callApi(() => getAuthenticatedUser(), argv);
        const user = (data as any).data;
        outputItem(flatten(user), argv);
      },
    ).demandCommand(1, "Specify a subcommand: whoami"),
  handler: () => {},
};
