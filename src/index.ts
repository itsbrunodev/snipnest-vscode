import { defineExtension } from "reactive-vscode";
import { commands } from "vscode";

import { browseCommand, browseCommandHandler } from "./commands/browse";
import { searchCommand, searchCommandHandler } from "./commands/search";

const { activate, deactivate } = defineExtension((context) => {
  context.subscriptions.push(
    commands.registerCommand(browseCommand, browseCommandHandler)
  );

  context.subscriptions.push(
    commands.registerCommand(searchCommand, searchCommandHandler)
  );
});

export { activate, deactivate };
