import { defineExtension } from "reactive-vscode";
import { window, commands } from "vscode";

import { browseCommand, browseCommandHandler } from "./commands/browse";
import { searchCommand, searchCommandHandler } from "./commands/search";

const { activate, deactivate } = defineExtension((context) => {
  window.showInformationMessage("Hello");

  context.subscriptions.push(
    commands.registerCommand(browseCommand, browseCommandHandler)
  );

  context.subscriptions.push(
    commands.registerCommand(searchCommand, searchCommandHandler)
  );
});

export { activate, deactivate };
